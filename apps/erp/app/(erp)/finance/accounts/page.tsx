import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Badge, DataTable, PageHeader, StatCard, type Column } from "@tesera/ui";
import { getApp } from "@/src/tesera/engine";
import { Account, ACCOUNT_KIND_LABELS, Transaction } from "@/src/tesera/modules/finance";
import { createAccount } from "@/src/tesera/actions";
import { balancesByAccount } from "@/src/tesera/finance-calc";
import { money, signedMoney } from "@/src/tesera/format";
import { AddRecord } from "@/src/ui/AddRecord";

const KIND_TONES: Record<string, "brand" | "green" | "amber"> = {
  bank: "brand",
  cash: "green",
  card: "amber",
};

export default async function AccountsPage() {
  const app = await getApp();
  const [accounts, txs] = await Promise.all([
    app.repo(Account).list({ orderBy: { field: "name", direction: "asc" } }),
    app.repo(Transaction).list(),
  ]);

  const balance = balancesByAccount(txs);
  const operations = (id: string) =>
    txs.filter((t) => t.accountId === id || t.toAccountId === id).length;

  const total = accounts.reduce((sum, a) => sum + (balance.get(a.id) ?? 0), 0);

  const columns: Column<(typeof accounts)[number]>[] = [
    {
      key: "name",
      header: "Счёт",
      render: (a) => (
        // Covers the whole row, so clicking anywhere opens the account.
        <Link
          href={`/finance/accounts/${a.id}`}
          className="font-medium text-ink after:absolute after:inset-0 hover:text-brand-700"
        >
          {a.name}
        </Link>
      ),
    },
    {
      key: "kind",
      header: "Тип",
      render: (a) => (
        <Badge tone={KIND_TONES[a.kind] ?? "neutral"}>
          {ACCOUNT_KIND_LABELS[a.kind] ?? a.kind}
        </Badge>
      ),
    },
    { key: "currency", header: "Валюта", render: (a) => a.currency },
    { key: "operations", header: "Операций", align: "right", render: (a) => operations(a.id) },
    {
      key: "balance",
      header: "Остаток",
      align: "right",
      render: (a) => {
        const value = balance.get(a.id) ?? 0;
        return (
          <span className={value < 0 ? "font-medium text-rose-600" : "font-medium text-ink"}>
            {signedMoney(value)}
          </span>
        );
      },
    },
    {
      key: "chevron",
      header: "",
      align: "right",
      className: "w-10",
      render: () => <ChevronRight className="ml-auto h-4 w-4 text-slate-300" />,
    },
  ];

  return (
    <>
      <PageHeader
        title="Расчётные счета"
        subtitle="Счета компании и остатки по ним"
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

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Счетов" value={accounts.length} />
        <StatCard label="Всего операций" value={txs.length} />
        <StatCard
          label="Общий остаток"
          value={signedMoney(total)}
          tone={total < 0 ? "negative" : "positive"}
        />
      </div>

      <div className="mt-6">
        <DataTable columns={columns} rows={accounts} empty="Счетов пока нет" />
      </div>
    </>
  );
}
