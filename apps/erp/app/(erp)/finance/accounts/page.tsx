import { PageHeader, StatCard } from "@tesera/ui";
import { getApp } from "@/src/tesera/engine";
import { Account, ACCOUNT_KIND_LABELS, Transaction } from "@/src/tesera/modules/finance";
import { createAccount } from "@/src/tesera/actions";
import { balancesByAccount } from "@/src/tesera/finance-calc";
import { money } from "@/src/tesera/format";
import { AddRecord } from "@/src/ui/AddRecord";

export default async function AccountsPage() {
  const app = await getApp();
  const [accounts, txs] = await Promise.all([
    app.repo(Account).list({ orderBy: { field: "name", direction: "asc" } }),
    app.repo(Transaction).list(),
  ]);

  const balance = balancesByAccount(txs);

  return (
    <>
      <PageHeader
        title="Расчётные счета"
        subtitle="Остатки по счетам компании"
        actions={
          <AddRecord
            title="Новый счёт"
            action={createAccount}
            submitLabel="Добавить счёт"
            label="Новый счёт"
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
        }
      />

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

    </>
  );
}
