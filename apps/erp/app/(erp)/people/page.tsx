import { Badge, DataTable, PageHeader, StatCard, type Column } from "@tesera/ui";
import { getApp } from "@/src/tesera/engine";
import { Department, Employee, Position } from "@/src/tesera/modules/people";
import { createEmployee } from "@/src/tesera/actions";
import { money } from "@/src/tesera/format";
import { AddRecord } from "@/src/ui/AddRecord";

export default async function PeoplePage() {
  const app = await getApp();
  const [employees, positions, departments] = await Promise.all([
    app.repo(Employee).list({ orderBy: { field: "fullName", direction: "asc" } }),
    app.repo(Position).list({ orderBy: { field: "name", direction: "asc" } }),
    app.repo(Department).list({ orderBy: { field: "name", direction: "asc" } }),
  ]);

  const positionName = (id: string) => positions.find((p) => p.id === id)?.name ?? "—";
  const departmentName = (id: string) => departments.find((d) => d.id === id)?.name ?? "—";
  const payroll = employees.filter((e) => e.active).reduce((s, e) => s + e.salary, 0);

  const columns: Column<(typeof employees)[number]>[] = [
    {
      key: "fullName",
      header: "Сотрудник",
      render: (e) => <span className="font-medium text-ink">{e.fullName}</span>,
    },
    { key: "position", header: "Должность", render: (e) => positionName(e.positionId) },
    { key: "department", header: "Отдел", render: (e) => departmentName(e.departmentId) },
    { key: "email", header: "Email", render: (e) => e.email ?? "—" },
    { key: "salary", header: "Оклад", align: "right", render: (e) => money(e.salary) },
    {
      key: "active",
      header: "Статус",
      render: (e) =>
        e.active ? <Badge tone="green">Активен</Badge> : <Badge tone="red">Неактивен</Badge>,
    },
  ];

  return (
    <>
      <PageHeader
        title="Сотрудники"
        subtitle="Команда компании"
        actions={
          <AddRecord
            title="Новый сотрудник"
            action={createEmployee}
            submitLabel="Добавить сотрудника"
            label="Новый сотрудник"
            fields={[
              { name: "fullName", label: "ФИО", placeholder: "Имя Фамилия", required: true },
              {
                name: "positionId",
                label: "Должность",
                type: "select",
                required: true,
                options: positions.map((p) => ({ value: p.id, label: p.name })),
              },
              {
                name: "departmentId",
                label: "Отдел",
                type: "select",
                required: true,
                options: departments.map((d) => ({ value: d.id, label: d.name })),
              },
              { name: "email", label: "Email", type: "email", placeholder: "name@tesera.dev" },
              { name: "salary", label: "Оклад", type: "number", step: "500000", placeholder: "0" },
              { name: "hiredAt", label: "Дата найма", type: "date" },
            ]}
          />
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Сотрудников" value={employees.length} />
        <StatCard label="Активных" value={employees.filter((e) => e.active).length} />
        <StatCard label="ФОТ в месяц" value={money(payroll)} />
      </div>

      <div className="mt-6">
        <DataTable columns={columns} rows={employees} empty="Сотрудников пока нет" />
      </div>
    </>
  );
}
