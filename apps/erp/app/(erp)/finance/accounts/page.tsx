import { Card, CardHeader, PageHeader, StatCard } from "@tesera/ui";
import { getApp } from "@/src/tesera/engine";
import { Account, ACCOUNT_KIND_LABELS, Transaction } from "@/src/tesera/modules/finance";
import { createAccount } from "@/src/tesera/actions";
import { money } from "@/src/tesera/format";
import { RecordForm } from "@/src/ui/RecordForm";

export default async function AccountsPage() {
  const app = await getApp();
  const [accounts, txs] = await Promise.all([
    app.repo(Account).list({ orderBy: { field: "name", direction: "asc" } }),
    app.repo(Transaction).list(),
  ]);

  const balance = new Map<string, number>();
  for (const t of txs) {
    const delta = t.direction === "in" ? t.amount : -t.amount;
    balance.set(t.accountId, (balance.get(t.accountId) ?? 0) + delta);
  }

  return (
    <>
      <PageHeader title="Расчётные счета" subtitle="Остатки по счетам компании" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {accounts.map((account) => (
          <StatCard
            key={account.id}
            label={account.name}
            value={money(balance.get(account.id) ?? 0)}
            hint={`${ACCOUNT_KIND_LABELS[account.kind] ?? account.kind} · ${account.currency}`}
            tone={(balance.get(account.id) ?? 0) < 0 ? "negative" : "default"}
          />
        ))}
      </div>

      <Card className="mt-6">
        <CardHeader title="Новый счёт" />
        <div className="p-5">
          <RecordForm
            action={createAccount}
            submitLabel="Добавить счёт"
            fields={[
              { name: "name", label: "Название", placeholder: "Например, Карта", required: true },
              {
                name: "kind",
                label: "Тип",
                type: "select",
                defaultValue: "bank",
                options: [
                  { value: "bank", label: "Банк" },
                  { value: "cash", label: "Касса" },
                  { value: "card", label: "Карта" },
                ],
              },
              {
                name: "currency",
                label: "Валюта",
                type: "select",
                defaultValue: "UZS",
                options: [
                  { value: "UZS", label: "UZS" },
                  { value: "USD", label: "USD" },
                  { value: "EUR", label: "EUR" },
                ],
              },
            ]}
          />
        </div>
      </Card>
    </>
  );
}
