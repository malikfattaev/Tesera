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
import {
  Account,
  ACCOUNT_KIND_LABELS,
  CATEGORY_LABELS,
  DIRECTION_LABELS,
  Transaction,
} from "@/src/tesera/modules/money";
import { formatDate, money } from "@/src/tesera/format";
import { AddTransactionForm } from "@/src/ui/AddTransactionForm";

export default async function MoneyPage() {
  const app = await getApp();
  const [txs, accounts] = await Promise.all([
    app.repo(Transaction).list({ orderBy: { field: "date", direction: "desc" } }),
    app.repo(Account).list(),
  ]);

  const accountBalance = new Map<string, number>();
  for (const t of txs) {
    const delta = t.direction === "in" ? t.amount : -t.amount;
    accountBalance.set(t.accountId, (accountBalance.get(t.accountId) ?? 0) + delta);
  }
  const accountName = (id: string) => accounts.find((a) => a.id === id)?.name ?? "—";

  const columns: Column<(typeof txs)[number]>[] = [
    { key: "date", header: "Дата", render: (r) => formatDate(r.date) },
    {
      key: "direction",
      header: "Тип",
      render: (r) => (
        <Badge tone={r.direction === "in" ? "green" : "neutral"}>
          {DIRECTION_LABELS[r.direction]}
        </Badge>
      ),
    },
    { key: "category", header: "Категория", render: (r) => CATEGORY_LABELS[r.category] ?? r.category },
    { key: "counterparty", header: "Контрагент", render: (r) => r.counterparty ?? "—" },
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
      <PageHeader title="Деньги" subtitle="Счета и операции" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {accounts.map((account) => (
          <StatCard
            key={account.id}
            label={account.name}
            value={money(accountBalance.get(account.id) ?? 0)}
            hint={`${ACCOUNT_KIND_LABELS[account.kind] ?? account.kind} · ${account.currency}`}
            tone={(accountBalance.get(account.id) ?? 0) < 0 ? "negative" : "default"}
          />
        ))}
      </div>

      <Card className="mt-6">
        <CardHeader title="Новая операция" />
        <div className="p-5">
          <AddTransactionForm accounts={accounts.map((a) => ({ id: a.id, name: a.name }))} />
        </div>
      </Card>

      <div className="mt-6">
        <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Операции
        </div>
        <DataTable columns={columns} rows={txs} empty="Операций пока нет" />
      </div>
    </>
  );
}
