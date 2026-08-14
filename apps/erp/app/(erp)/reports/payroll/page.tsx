import { PageHeader, ReportTable, StatCard, type ReportRow } from "@tesera/ui";
import { getApp } from "@/src/tesera/engine";
import { Department, Employee, Position } from "@/src/tesera/modules/people";
import { money } from "@/src/tesera/format";
import { resolveRange } from "@/src/tesera/range";
import { monthColumns, periodLabel } from "@/src/tesera/report";
import { ReportPeriod } from "@/src/ui/ReportPeriod";

export default async function PayrollReportPage({
  searchParams,
}: {
  searchParams: { period?: string; from?: string; to?: string };
}) {
  const app = await getApp();
  const [employees, positions, departments] = await Promise.all([
    app.repo(Employee).list({ orderBy: { field: "fullName", direction: "asc" } }),
    app.repo(Position).list(),
    app.repo(Department).list({ orderBy: { field: "name", direction: "asc" } }),
  ]);

  const range = resolveRange(searchParams);
  const active = employees.filter((e) => e.active);
  // With no explicit range, show the current year of payroll.
  const yearStart = new Date(new Date().getFullYear(), 0, 1);
  const columns = monthColumns(range, [yearStart, new Date()]);
  const positionName = (id: string) => positions.find((p) => p.id === id)?.name ?? "—";

  /** Accrual per month: the salary applies from the month the person was hired. */
  const accrualFor = (employee: (typeof active)[number]) => {
    const values = columns.map((column) => {
      if (!employee.hiredAt) return employee.salary;
      const hired = new Date(employee.hiredAt);
      const hiredKey = `${hired.getFullYear()}-${String(hired.getMonth() + 1).padStart(2, "0")}`;
      return column.key >= hiredKey ? employee.salary : 0;
    });
    return { values, total: values.reduce((s, v) => s + v, 0) };
  };

  const sumRows = (rows: { values: number[]; total: number }[]) => ({
    values: columns.map((_, i) => rows.reduce((s, r) => s + (r.values[i] ?? 0), 0)),
    total: rows.reduce((s, r) => s + r.total, 0),
  });

  const rows: ReportRow[] = [];
  const departmentTotals: { values: number[]; total: number }[] = [];

  for (const department of departments) {
    const staff = active.filter((e) => e.departmentId === department.id);
    if (!staff.length) continue;

    rows.push({
      id: `dep-${department.id}`,
      label: department.name,
      kind: "section",
      values: columns.map(() => 0),
      total: 0,
    });

    const staffRows = staff.map((employee) => {
      const accrual = accrualFor(employee);
      rows.push({
        id: employee.id,
        label: `${employee.fullName}, ${positionName(employee.positionId)}`,
        kind: "item",
        values: accrual.values,
        total: accrual.total,
      });
      return accrual;
    });

    const subtotal = sumRows(staffRows);
    departmentTotals.push(subtotal);
    rows.push({
      id: `sub-${department.id}`,
      label: `Итого ${department.name.toLowerCase()}`,
      kind: "subtotal",
      values: subtotal.values,
      total: subtotal.total,
    });
  }

  const grand = sumRows(departmentTotals);
  rows.push({
    id: "total",
    label: "Итого ФОТ",
    kind: "total",
    values: grand.values,
    total: grand.total,
  });

  const monthly = active.reduce((s, e) => s + e.salary, 0);

  return (
    <>
      <PageHeader title="Зарплатные ведомости" subtitle="Начисления по сотрудникам и отделам" />

      <ReportPeriod period={periodLabel(columns)} />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Активных сотрудников" value={active.length} />
        <StatCard label="ФОТ в месяц" value={money(monthly)} />
        <StatCard label="Начислено за период" value={money(grand.total)} />
      </div>

      <ReportTable
        columns={columns}
        rows={rows}
        rowHeader="Сотрудник"
        caption="Суммы в UZS. Начисления рассчитаны по текущему окладу с месяца приёма на работу."
      />
    </>
  );
}
