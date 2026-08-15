import { PageHeader, type Column } from "@tesera/ui";
import { getApp } from "@/src/tesera/engine";
import { Department, Employee } from "@/src/tesera/modules/people";
import { createDepartment } from "@/src/tesera/actions";
import { money } from "@/src/tesera/format";
import type { TableParams } from "@/src/tesera/table";
import { AddRecord } from "@/src/ui/AddRecord";
import { DataPanel } from "@/src/ui/DataPanel";
import type { FormFieldSpec } from "@/src/ui/RecordForm";
import { RowActions } from "@/src/ui/RowActions";

export default async function DepartmentsPage({
  searchParams,
}: {
  searchParams: TableParams;
}) {
  const app = await getApp();
  const [departments, employees] = await Promise.all([
    app.repo(Department).list({ orderBy: { field: "name", direction: "asc" } }),
    app.repo(Employee).list(),
  ]);

  const inDepartment = (id: string) => employees.filter((e) => e.departmentId === id);

  const departmentFields = (department?: (typeof departments)[number]): FormFieldSpec[] => [
    {
      name: "name",
      label: "Название",
      placeholder: "Например, Маркетинг",
      required: true,
      defaultValue: department?.name,
    },
    {
      name: "head",
      label: "Руководитель",
      placeholder: "Имя",
      defaultValue: department?.head,
    },
  ];

  const columns: Column<(typeof departments)[number]>[] = [
    {
      key: "name",
      header: "Отдел",
      value: (d) => d.name,
      render: (d) => <span className="font-medium text-ink">{d.name}</span>,
    },
    { key: "head", header: "Руководитель", value: (d) => d.head ?? "", render: (d) => d.head ?? "—" },
    {
      key: "headcount",
      header: "Сотрудников",
      align: "right",
      value: (d) => inDepartment(d.id).length,
      render: (d) => inDepartment(d.id).length,
    },
    {
      key: "payroll",
      header: "ФОТ",
      align: "right",
      value: (d) => inDepartment(d.id).reduce((s, e) => s + e.salary, 0),
      render: (d) => money(inDepartment(d.id).reduce((s, e) => s + e.salary, 0)),
    },
    {
      key: "actions",
      header: "Действия",
      align: "right",
      className: "w-28",
      render: (d) => (
        <RowActions
          entity="department"
          id={d.id}
          title={d.name}
          fields={departmentFields(d)}
          details={[
            { label: "Отдел", value: d.name },
            { label: "Руководитель", value: d.head ?? "—" },
            { label: "Сотрудников", value: String(inDepartment(d.id).length) },
            {
              label: "ФОТ",
              value: money(inDepartment(d.id).reduce((s, e) => s + e.salary, 0)),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Отделы"
        subtitle="Структура компании"
        actions={
          <AddRecord
            title="Новый отдел"
            action={createDepartment}
            submitLabel="Добавить отдел"
            label="Новый отдел"
            fields={departmentFields()}
          />
        }
      />

      <DataPanel
          columns={columns}
          rows={departments}
          params={searchParams}
          filename="departments"
          empty="Отделов пока нет"
        />
    </>
  );
}
