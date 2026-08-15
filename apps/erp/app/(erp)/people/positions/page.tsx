import { PageHeader, type Column } from "@tesera/ui";
import { getApp } from "@/src/tesera/engine";
import { Department, Employee, Position } from "@/src/tesera/modules/people";
import { createPosition } from "@/src/tesera/actions";
import type { TableParams } from "@/src/tesera/table";
import { AddRecord } from "@/src/ui/AddRecord";
import { DataPanel } from "@/src/ui/DataPanel";
import type { FormFieldSpec } from "@/src/ui/RecordForm";
import { RowActions } from "@/src/ui/RowActions";

export default async function PositionsPage({
  searchParams,
}: {
  searchParams: TableParams;
}) {
  const app = await getApp();
  const [positions, departments, employees] = await Promise.all([
    app.repo(Position).list({ orderBy: { field: "name", direction: "asc" } }),
    app.repo(Department).list({ orderBy: { field: "name", direction: "asc" } }),
    app.repo(Employee).list(),
  ]);

  const departmentName = (id?: string) =>
    id ? (departments.find((d) => d.id === id)?.name ?? "—") : "—";
  const headcount = (positionId: string) =>
    employees.filter((e) => e.positionId === positionId).length;

  const positionFields = (position?: (typeof positions)[number]): FormFieldSpec[] => [
    {
      name: "name",
      label: "Название",
      placeholder: "Например, Designer",
      required: true,
      defaultValue: position?.name,
    },
    {
      name: "departmentId",
      label: "Отдел",
      type: "select",
      defaultValue: position?.departmentId ?? "",
      options: [
        { value: "", label: "Без отдела" },
        ...departments.map((d) => ({ value: d.id, label: d.name })),
      ],
    },
  ];

  const columns: Column<(typeof positions)[number]>[] = [
    {
      key: "name",
      header: "Должность",
      value: (p) => p.name,
      render: (p) => <span className="font-medium text-ink">{p.name}</span>,
    },
    { key: "department", header: "Отдел", value: (p) => departmentName(p.departmentId), render: (p) => departmentName(p.departmentId) },
    { key: "headcount", header: "Сотрудников", align: "right", value: (p) => headcount(p.id), render: (p) => headcount(p.id) },
    {
      key: "actions",
      header: "Действия",
      align: "right",
      className: "w-28",
      render: (p) => (
        <RowActions
          entity="position"
          id={p.id}
          title={p.name}
          fields={positionFields(p)}
          details={[
            { label: "Должность", value: p.name },
            { label: "Отдел", value: departmentName(p.departmentId) },
            { label: "Сотрудников", value: String(headcount(p.id)) },
          ]}
        />
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Должности"
        subtitle="Справочник должностей"
        actions={
          <AddRecord
            title="Новая должность"
            action={createPosition}
            submitLabel="Добавить должность"
            label="Новая должность"
            fields={positionFields()}
          />
        }
      />

      <DataPanel
          columns={columns}
          rows={positions}
          params={searchParams}
          filename="positions"
          empty="Должностей пока нет"
        />
    </>
  );
}
