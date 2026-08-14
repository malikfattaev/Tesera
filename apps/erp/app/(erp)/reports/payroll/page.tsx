import { PageHeader, ReportTable, StatCard, type ReportRow } from "@tesera/ui";
import { getApp } from "@/src/tesera/engine";
import { Employee } from "@/src/tesera/modules/people";
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
  const employees = await app
    .repo(Employee)
    .list({ orderBy: { field: "fullName", direction: "asc" } });

  const range = resolveRange(searchParams);
  const active = employees.filter((e) => e.active);
  // With no explicit range, show the current year of payroll.
  const yearStart = new Date(new Date().getFullYear(), 0, 1);
  const columns = monthColumns(range, [yearStart, new Date()]);

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

  // Flat payroll sheet: one line per person, then the bottom line.
  const accruals = active.map((employee) => accrualFor(employee));
  const rows: ReportRow[] = active.map((employee, index) => ({
    id: employee.id,
    label: employee.fullName,
    kind: "item",
    values: accruals[index]!.values,
    total: accruals[index]!.total,
  }));

  const grand = sumRows(accruals);
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
      <PageHeader title="Зарплатные ведомости" subtitle="Начисления по сотрудникам за период" />

      <ReportPeriod range={range} />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Активных сотрудников" value={active.length} />
        <StatCard label="ФОТ в месяц" value={money(monthly)} />
        <StatCard label="Начислено за период" value={money(grand.total)} />
      </div>

      <ReportTable
        columns={columns}
        rows={rows}
        rowHeader="Сотрудник"
        title="Зарплатная ведомость"
        period={periodLabel(columns)}
        caption="Суммы в UZS. Начисления рассчитаны по текущему окладу с месяца приёма на работу."
      />
    </>
  );
}
