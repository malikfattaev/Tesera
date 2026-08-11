import {
  BarChart,
  Card,
  CardHeader,
  DataTable,
  DonutChart,
  PageHeader,
  StatCard,
  type Column,
} from "@tesera/ui";
import { getApp } from "@/src/tesera/engine";
import {
  Account,
  CATEGORY_LABELS,
  Transaction,
} from "@/src/tesera/modules/money";
import { formatDate, money, monthKey, monthLabel, signedMoney } from "@/src/tesera/format";

export default async function DashboardPage() {
  const app = await getApp();
  const [txs, accounts] = await Promise.all([
    app.repo(Transaction).list({ orderBy: { field: "date", direction: "desc" } }),
    app.repo(Account).list(),
  ]);

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
    if (t.direction === "out") {
      byMonth.set(monthKey(t.date), (byMonth.get(monthKey(t.date)) ?? 0) + t.amount);
    }
  }
  const barData = [...byMonth.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => ({ label: monthLabel(key), value }));

  // Expenses grouped by category.
  const byCategory = new Map<string, number>();
  for (const t of txs) {
    if (t.direction === "out") {
      byCategory.set(t.category, (byCategory.get(t.category) ?? 0) + t.amount);
    }
  }
  const donutData = [...byCategory.entries()].map(([key, value]) => ({
    label: CATEGORY_LABELS[key] ?? key,
    value,
  }));
  const expenseTotal = donutData.reduce((s, d) => s + d.value, 0);

  // Balance per account.
  const accountBalance = new Map<string, number>();
  for (const t of txs) {
    const delta = t.direction === "in" ? t.amount : -t.amount;
    accountBalance.set(t.accountId, (accountBalance.get(t.accountId) ?? 0) + delta);
  }
  const accountsData = accounts.map((a) => ({
    label: a.name,
    value: accountBalance.get(a.id) ?? 0,
  }));

  const accountName = (id: string) => accounts.find((a) => a.id === id)?.name ?? "—";
  const recent = txs.slice(0, 6);
  const columns: Column<(typeof recent)[number]>[] = [
    { key: "date", header: "Дата", render: (r) => formatDate(r.date) },
    { key: "counterparty", header: "Контрагент", render: (r) => r.counterparty ?? "—" },
    { key: "category", header: "Категория", render: (r) => CATEGORY_LABELS[r.category] ?? r.category },
    { key: "account", header: "Счёт", render: (r) => accountName(r.accountId) },
    {
      key: "amount",
      header: "Сумма",
      align: "right",
      render: (r) => (
        <span className={r.direction === "in" ? "font-medium text-emerald-600" : "font-medium text-ink"}>
          {(r.direction === "in" ? "+" : "−") + money(r.amount)}
        </span>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Финансовый обзор" subtitle={`Данные за ${monthLabel(period)}`} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Остаток на счетах" value={signedMoney(balance)} tone={balance < 0 ? "negative" : "positive"} />
        <StatCard label="Пришло за месяц" value={money(incomeMonth)} tone="positive" />
        <StatCard label="Ушло за месяц" value={money(expenseMonth)} />
        <StatCard label="Операций за месяц" value={inPeriod.length} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
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

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Остатки по счетам" />
          <div className="p-4">
            <BarChart data={accountsData} height={220} />
          </div>
        </Card>
        <div>
          <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Последние операции
          </div>
          <DataTable columns={columns} rows={recent} empty="Операций нет" />
        </div>
      </div>
    </>
  );
}
