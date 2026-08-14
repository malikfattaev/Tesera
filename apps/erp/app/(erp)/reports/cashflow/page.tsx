import { DataTable, PageHeader, StatCard, type Column } from "@tesera/ui";
import { getApp } from "@/src/tesera/engine";
import { Category, Transaction } from "@/src/tesera/modules/finance";
import { totals } from "@/src/tesera/finance-calc";
import { money, monthKey, monthLabel, signedMoney } from "@/src/tesera/format";
import { filterByRange, resolveRange } from "@/src/tesera/range";
import { DateRangeFilter } from "@/src/ui/DateRangeFilter";

interface MonthRow {
  id: string;
  month: string;
  income: number;
  expense: number;
  net: number;
}

export default async function CashflowReportPage({
  searchParams,
}: {
  searchParams: { period?: string; from?: string; to?: string };
}) {
  const app = await getApp();
  const [all, categories] = await Promise.all([
    app.repo(Transaction).list(),
    app.repo(Category).list(),
  ]);

  const range = resolveRange(searchParams);
  const txs = filterByRange(all, range);

  // Cash movement grouped by month.
  const byMonth = new Map<string, { income: number; expense: number }>();
  for (const t of txs) {
    // Transfers move money between own accounts, they are not cash flow.
    if (t.direction === "transfer") continue;
    const key = monthKey(t.date);
    const row = byMonth.get(key) ?? { income: 0, expense: 0 };
    if (t.direction === "in") row.income += t.amount;
    else row.expense += t.amount;
    byMonth.set(key, row);
  }
  const monthRows: MonthRow[] = [...byMonth.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([key, row]) => ({
      id: key,
      month: monthLabel(key),
      income: row.income,
      expense: row.expense,
      net: row.income - row.expense,
    }));

  // Expenses grouped by category.
  const byCategory = new Map<string, number>();
  for (const t of txs) {
    if (t.direction === "out" && t.categoryId) {
      byCategory.set(t.categoryId, (byCategory.get(t.categoryId) ?? 0) + t.amount);
    }
  }
  const categoryRows = [...byCategory.entries()]
    .map(([id, total]) => ({
      id,
      name: categories.find((c) => c.id === id)?.name ?? "—",
      total,
    }))
    .sort((a, b) => b.total - a.total);

  const { income, expense } = totals(txs);

  const monthColumns: Column<MonthRow>[] = [
    { key: "month", header: "Месяц", render: (r) => <span className="font-medium text-ink">{r.month}</span> },
    {
      key: "income",
      header: "Приход",
      align: "right",
      render: (r) => <span className="text-emerald-600">{money(r.income)}</span>,
    },
    { key: "expense", header: "Расход", align: "right", render: (r) => money(r.expense) },
    {
      key: "net",
      header: "Итог",
      align: "right",
      render: (r) => (
        <span className={r.net < 0 ? "font-medium text-rose-600" : "font-medium text-emerald-600"}>
          {signedMoney(r.net)}
        </span>
      ),
    },
  ];

  const categoryColumns: Column<(typeof categoryRows)[number]>[] = [
    { key: "name", header: "Категория", render: (r) => r.name },
    { key: "total", header: "Сумма", align: "right", render: (r) => money(r.total) },
  ];

  return (
    <>
      <PageHeader title="Движения по деньгам" subtitle="Приходы и расходы по месяцам" />

      <div className="mb-5">
        <DateRangeFilter />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Всего пришло" value={money(income)} tone="positive" />
        <StatCard label="Всего ушло" value={money(expense)} />
        <StatCard
          label="Итог"
          value={signedMoney(income - expense)}
          tone={income - expense < 0 ? "negative" : "positive"}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div>
          <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            По месяцам
          </div>
          <DataTable columns={monthColumns} rows={monthRows} empty="Операций пока нет" />
        </div>
        <div>
          <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Расходы по категориям
          </div>
          <DataTable columns={categoryColumns} rows={categoryRows} empty="Расходов пока нет" />
        </div>
      </div>
    </>
  );
}
