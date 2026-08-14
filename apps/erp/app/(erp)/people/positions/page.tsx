import { DataTable, PageHeader, type Column } from "@tesera/ui";
import { getApp } from "@/src/tesera/engine";
import { Department, Employee, Position } from "@/src/tesera/modules/people";
import { createPosition } from "@/src/tesera/actions";
import { AddRecord } from "@/src/ui/AddRecord";

export default async function PositionsPage() {
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

  const columns: Column<(typeof positions)[number]>[] = [
    {
      key: "name",
      header: "Должность",
      render: (p) => <span className="font-medium text-ink">{p.name}</span>,
    },
    { key: "department", header: "Отдел", render: (p) => departmentName(p.departmentId) },
    { key: "headcount", header: "Сотрудников", align: "right", render: (p) => headcount(p.id) },
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
            fields={[
              { name: "name", label: "Название", placeholder: "Например, Designer", required: true },
              {
                name: "departmentId",
                label: "Отдел",
                type: "select",
                options: [
                  { value: "", label: "Без отдела" },
                  ...departments.map((d) => ({ value: d.id, label: d.name })),
                ],
              },
              { name: "note", label: "Заметка", placeholder: "Необязательно" },
            ]}
          />
        }
      />

      <DataTable columns={columns} rows={positions} empty="Должностей пока нет" />
    </>
  );
}
