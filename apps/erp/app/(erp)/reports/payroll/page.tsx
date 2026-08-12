import { DataTable, PageHeader, StatCard, type Column } from "@tesera/ui";
import { getApp } from "@/src/tesera/engine";
import { Department, Employee, Position } from "@/src/tesera/modules/people";
import { money } from "@/src/tesera/format";

export default async function PayrollReportPage() {
  const app = await getApp();
  const [employees, positions, departments] = await Promise.all([
    app.repo(Employee).list({ orderBy: { field: "fullName", direction: "asc" } }),
    app.repo(Position).list(),
    app.repo(Department).list({ orderBy: { field: "name", direction: "asc" } }),
  ]);

  const active = employees.filter((e) => e.active);
  const payroll = active.reduce((s, e) => s + e.salary, 0);
  const positionName = (id: string) => positions.find((p) => p.id === id)?.name ?? "—";
  const departmentName = (id: string) => departments.find((d) => d.id === id)?.name ?? "—";

  const departmentRows = departments
    .map((department) => {
      const staff = active.filter((e) => e.departmentId === department.id);
      return {
        id: department.id,
        name: department.name,
        headcount: staff.length,
        total: staff.reduce((s, e) => s + e.salary, 0),
      };
    })
    .sort((a, b) => b.total - a.total);

  const employeeColumns: Column<(typeof employees)[number]>[] = [
    {
      key: "fullName",
      header: "Сотрудник",
      render: (e) => <span className="font-medium text-ink">{e.fullName}</span>,
    },
    { key: "position", header: "Должность", render: (e) => positionName(e.positionId) },
    { key: "department", header: "Отдел", render: (e) => departmentName(e.departmentId) },
    { key: "salary", header: "Оклад", align: "right", render: (e) => money(e.salary) },
  ];

  const departmentColumns: Column<(typeof departmentRows)[number]>[] = [
    { key: "name", header: "Отдел", render: (r) => r.name },
    { key: "headcount", header: "Сотрудников", align: "right", render: (r) => r.headcount },
    { key: "total", header: "ФОТ", align: "right", render: (r) => money(r.total) },
  ];

  return (
    <>
      <PageHeader title="Зарплатные ведомости" subtitle="Фонд оплаты труда по сотрудникам и отделам" />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Активных сотрудников" value={active.length} />
        <StatCard label="ФОТ в месяц" value={money(payroll)} />
        <StatCard
          label="Средний оклад"
          value={money(active.length ? Math.round(payroll / active.length) : 0)}
        />
      </div>

      <div className="mt-6">
        <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
          По отделам
        </div>
        <DataTable columns={departmentColumns} rows={departmentRows} empty="Отделов пока нет" />
      </div>

      <div className="mt-6">
        <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Ведомость
        </div>
        <DataTable columns={employeeColumns} rows={employees} empty="Сотрудников пока нет" />
      </div>
    </>
  );
}
