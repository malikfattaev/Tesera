import {
  Badge,
  Card,
  CardHeader,
  DataTable,
  PageHeader,
  StatCard,
  type Column,
} from "@tesera/ui";
import { getApp } from "@/src/tesera/engine";
import { DEPARTMENT_LABELS, Employee } from "@/src/tesera/modules/people";
import { money } from "@/src/tesera/format";
import { AddEmployeeForm } from "@/src/ui/AddEmployeeForm";

export default async function PeoplePage() {
  const app = await getApp();
  const employees = await app
    .repo(Employee)
    .list({ orderBy: { field: "fullName", direction: "asc" } });
  const payroll = employees.filter((e) => e.active).reduce((s, e) => s + e.salary, 0);

  const columns: Column<(typeof employees)[number]>[] = [
    { key: "fullName", header: "Сотрудник", render: (e) => <span className="font-medium text-ink">{e.fullName}</span> },
    { key: "position", header: "Должность", render: (e) => e.position },
    { key: "department", header: "Отдел", render: (e) => DEPARTMENT_LABELS[e.department] ?? e.department },
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
      <PageHeader title="Люди" subtitle="Сотрудники компании" />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Сотрудников" value={employees.length} />
        <StatCard label="Активных" value={employees.filter((e) => e.active).length} />
        <StatCard label="ФОТ в месяц" value={money(payroll)} />
      </div>

      <Card className="mt-6">
        <CardHeader title="Новый сотрудник" />
        <div className="p-5">
          <AddEmployeeForm />
        </div>
      </Card>

      <div className="mt-6">
        <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Список
        </div>
        <DataTable columns={columns} rows={employees} empty="Сотрудников пока нет" />
      </div>
    </>
  );
}
