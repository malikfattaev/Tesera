import { DataTable, PageHeader, type Column } from "@tesera/ui";
import { getApp } from "@/src/tesera/engine";
import { Department, Employee } from "@/src/tesera/modules/people";
import { createDepartment } from "@/src/tesera/actions";
import { money } from "@/src/tesera/format";
import { AddRecord } from "@/src/ui/AddRecord";

export default async function DepartmentsPage() {
  const app = await getApp();
  const [departments, employees] = await Promise.all([
    app.repo(Department).list({ orderBy: { field: "name", direction: "asc" } }),
    app.repo(Employee).list(),
  ]);

  const inDepartment = (id: string) => employees.filter((e) => e.departmentId === id);

  const columns: Column<(typeof departments)[number]>[] = [
    {
      key: "name",
      header: "Отдел",
      render: (d) => <span className="font-medium text-ink">{d.name}</span>,
    },
    { key: "head", header: "Руководитель", render: (d) => d.head ?? "—" },
    {
      key: "headcount",
      header: "Сотрудников",
      align: "right",
      render: (d) => inDepartment(d.id).length,
    },
    {
      key: "payroll",
      header: "ФОТ",
      align: "right",
      render: (d) => money(inDepartment(d.id).reduce((s, e) => s + e.salary, 0)),
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
            fields={[
              { name: "name", label: "Название", placeholder: "Например, Маркетинг", required: true },
              { name: "head", label: "Руководитель", placeholder: "Имя" },
              { name: "note", label: "Заметка", placeholder: "Необязательно" },
            ]}
          />
        }
      />

      <DataTable columns={columns} rows={departments} empty="Отделов пока нет" />
    </>
  );
}
