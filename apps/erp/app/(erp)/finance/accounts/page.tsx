import Link from "next/link";
import { Badge, DataTable, PageHeader, StatCard, type Column } from "@tesera/ui";
import { getApp } from "@/src/tesera/engine";
import { Account, ACCOUNT_KIND_LABELS, Transaction } from "@/src/tesera/modules/finance";
import { createAccount } from "@/src/tesera/actions";
import { balancesByAccount, turnoverByAccount } from "@/src/tesera/finance-calc";
import { money, signedMoney } from "@/src/tesera/format";
import { AddRecord } from "@/src/ui/AddRecord";
import type { FormFieldSpec } from "@/src/ui/RecordForm";
import { RowActions } from "@/src/ui/RowActions";

const KIND_TONES: Record<string, "brand" | "green" | "amber"> = {
  bank: "brand",
  cash: "green",
  card: "amber",
};

/** One field spec, used by both the create dialog and the edit dialog. */
const accountFields = (account?: {
  name: string;
  kind: string;
  currency: string;
}): FormFieldSpec[] => [
  {
    name: "name",
    label: "Название",
    placeholder: "Например, Карта",
    required: true,
    defaultValue: account?.name,
  },
  {
    name: "kind",
    label: "Тип",
    type: "select",
    defaultValue: account?.kind ?? "bank",
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
    defaultValue: account?.currency ?? "UZS",
    options: [
      { value: "UZS", label: "UZS" },
      { value: "USD", label: "USD" },
      { value: "EUR", label: "EUR" },
    ],
  },
];

export default async function AccountsPage() {
  const app = await getApp();
  const [accounts, txs] = await Promise.all([
    app.repo(Account).list({ orderBy: { field: "name", direction: "asc" } }),
    app.repo(Transaction).list(),
  ]);

  const balance = balancesByAccount(txs);
  const turnover = turnoverByAccount(txs);
  const operations = (id: string) =>
    txs.filter((t) => t.accountId === id || t.toAccountId === id).length;

  const total = accounts.reduce((sum, a) => sum + (balance.get(a.id) ?? 0), 0);
  const totalTurnover = accounts.reduce((sum, a) => sum + (turnover.get(a.id) ?? 0), 0);

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
      key: "turnover",
      header: "Оборот",
      align: "right",
      render: (a) => <span className="text-slate-500">{money(turnover.get(a.id) ?? 0)}</span>,
    },
    {
      key: "balance",
      header: "Баланс",
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
      key: "actions",
      header: "Действия",
      align: "right",
      className: "w-28",
      render: (a) => (
        <RowActions
          entity="account"
          id={a.id}
          title={a.name}
          viewHref={`/finance/accounts/${a.id}`}
          fields={accountFields(a)}
        />
      ),
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
            fields={accountFields()}
          />
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Баланс"
          value={signedMoney(total)}
          hint="Сумма остатков по всем счетам"
          tone={total < 0 ? "negative" : "positive"}
        />
        <StatCard label="Оборот" value={money(totalTurnover)} hint="Все поступления за всё время" />
        <StatCard label="Счетов" value={accounts.length} />
        <StatCard label="Всего операций" value={txs.length} />
      </div>

      <div className="mt-6">
        <DataTable columns={columns} rows={accounts} empty="Счетов пока нет" />
      </div>
    </>
  );
}
