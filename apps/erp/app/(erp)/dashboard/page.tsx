import {
  BarChart,
  Card,
  CardHeader,
  DonutChart,
  PageHeader,
  StatCard,
} from "@tesera/ui";
import { getApp } from "@/src/tesera/engine";
import { CATEGORY_LABELS, Transaction } from "@/src/tesera/modules/money";
import { money, monthKey, monthLabel, signedMoney } from "@/src/tesera/format";

export default async function DashboardPage() {
  const app = await getApp();
  const txs = await app.repo(Transaction).list();

  const income = txs.filter((t) => t.direction === "in").reduce((s, t) => s + t.amount, 0);
  const expense = txs.filter((t) => t.direction === "out").reduce((s, t) => s + t.amount, 0);
  const balance = income - expense;

  // Reporting period = the most recent month present in the data.
  const months = txs.map((t) => monthKey(t.date)).sort();
  const period = months.length ? months[months.length - 1]! : monthKey(new Date());
  const inPeriod = txs.filter((t) => monthKey(t.date) === period);
  const incomeMonth = inPeriod.filter((t) => t.direction === "in").reduce((s, t) => s + t.amount, 0);
  const expenseMonth = inPeriod.filter((t) => t.direction === "out").reduce((s, t) => s + t.amount, 0);

  // Expenses grouped by month.
  const byMonth = new Map<string, number>();
  for (const t of txs) {
    if (t.direction === "out") byMonth.set(monthKey(t.date), (byMonth.get(monthKey(t.date)) ?? 0) + t.amount);
  }
  const barData = [...byMonth.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => ({ label: monthLabel(key), value }));

  // Expenses grouped by category.
  const byCategory = new Map<string, number>();
  for (const t of txs) {
    if (t.direction === "out") byCategory.set(t.category, (byCategory.get(t.category) ?? 0) + t.amount);
  }
  const donutData = [...byCategory.entries()].map(([key, value]) => ({
    label: CATEGORY_LABELS[key] ?? key,
    value,
  }));
  const expenseTotal = donutData.reduce((s, d) => s + d.value, 0);

  return (
    <>
      <PageHeader title="Финансовый обзор" subtitle={`Данные за ${monthLabel(period)}`} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Остаток на счетах" value={signedMoney(balance)} tone={balance < 0 ? "negative" : "positive"} />
        <StatCard label="Пришло за месяц" value={money(incomeMonth)} tone="positive" />
        <StatCard label="Ушло за месяц" value={money(expenseMonth)} />
        <StatCard label="Операций за месяц" value={inPeriod.length} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Расходы по месяцам" />
          <div className="p-4">
            <BarChart data={barData} />
          </div>
        </Card>
        <Card>
          <CardHeader
            title="На что уходят деньги"
            action={<span className="text-xs text-slate-400">Итого: {money(expenseTotal)}</span>}
          />
          <div className="p-4">
            <DonutChart data={donutData} />
          </div>
        </Card>
      </div>
    </>
  );
}
