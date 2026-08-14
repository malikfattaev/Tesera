import { PageHeader, ReportTable, StatCard, type ReportRow } from "@tesera/ui";
import { getApp } from "@/src/tesera/engine";
import { Category, Transaction } from "@/src/tesera/modules/finance";
import { totals } from "@/src/tesera/finance-calc";
import { money, signedMoney } from "@/src/tesera/format";
import { filterByRange, resolveRange } from "@/src/tesera/range";
import { columnIndex, monthColumns, periodLabel } from "@/src/tesera/report";
import { ReportPeriod } from "@/src/ui/ReportPeriod";

export default async function CashflowReportPage({
  searchParams,
}: {
  searchParams: { period?: string; from?: string; to?: string };
}) {
  const app = await getApp();
  const [all, categories] = await Promise.all([
    app.repo(Transaction).list(),
    app.repo(Category).list({ orderBy: { field: "name", direction: "asc" } }),
  ]);

  const range = resolveRange(searchParams);
  // Transfers move money between own accounts, they are not income or spending.
  const txs = filterByRange(all, range).filter((t) => t.direction !== "transfer");
  const columns = monthColumns(range, txs.map((t) => t.date));

  /** Sum a set of transactions into one row of monthly values. */
  const rowFor = (categoryId: string) => {
    const values = columns.map(() => 0);
    let total = 0;
    for (const tx of txs) {
      if (tx.categoryId !== categoryId) continue;
      const index = columnIndex(columns, tx.date);
      if (index < 0) continue;
      values[index] = (values[index] ?? 0) + tx.amount;
      total += tx.amount;
    }
    return { values, total };
  };

  const sumRows = (rows: { values: number[]; total: number }[]) => ({
    values: columns.map((_, i) => rows.reduce((s, r) => s + (r.values[i] ?? 0), 0)),
    total: rows.reduce((s, r) => s + r.total, 0),
  });

  const incomeCats = categories.filter((c) => c.direction === "in");
  const expenseCats = categories.filter((c) => c.direction === "out");
  const incomeData = incomeCats.map((c) => ({ name: c.name, ...rowFor(c.id) }));
  const expenseData = expenseCats.map((c) => ({ name: c.name, ...rowFor(c.id) }));
  const incomeTotal = sumRows(incomeData);
  const expenseTotal = sumRows(expenseData);

  const rows: ReportRow[] = [
    { id: "s-in", label: "Доходы", kind: "section", tone: "income", values: [], total: 0 },
    ...incomeData.map((row) => ({
      id: `in-${row.name}`,
      label: row.name,
      kind: "item" as const,
      values: row.values,
      total: row.total,
    })),
    {
      id: "sub-in",
      label: "Операционный доход",
      kind: "subtotal",
      tone: "income",
      values: incomeTotal.values,
      total: incomeTotal.total,
    },
    { id: "s-out", label: "Расходы", kind: "section", tone: "expense", values: [], total: 0 },
    ...expenseData.map((row) => ({
      id: `out-${row.name}`,
      label: row.name,
      kind: "item" as const,
      values: row.values,
      total: row.total,
    })),
    {
      id: "sub-out",
      label: "Общие расходы",
      kind: "subtotal",
      values: expenseTotal.values,
      total: expenseTotal.total,
    },
    {
      id: "net",
      label: "Чистая прибыль",
      kind: "total",
      values: columns.map((_, i) => (incomeTotal.values[i] ?? 0) - (expenseTotal.values[i] ?? 0)),
      total: incomeTotal.total - expenseTotal.total,
    },
  ];

  // Section rows carry no numbers; pad them so every row has the same width.
  for (const row of rows) {
    if (row.kind === "section") row.values = columns.map(() => 0);
  }

  const { income, expense, net } = totals(txs);

  return (
    <>
      <PageHeader title="Движения по деньгам" subtitle="Доходы и расходы по категориям и месяцам" />

      <ReportPeriod range={range} />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Доходы за период" value={money(income)} tone="positive" />
        <StatCard label="Расходы за период" value={money(expense)} />
        <StatCard label="Чистая прибыль" value={signedMoney(net)} tone={net < 0 ? "negative" : "positive"} />
      </div>

      <ReportTable
        columns={columns}
        rows={rows}
        rowHeader="Категория"
        title="Отчёт о движении денег"
        period={periodLabel(columns)}
        caption="Суммы в UZS. Переводы между своими счетами в отчёт не входят."
      />
    </>
  );
}
