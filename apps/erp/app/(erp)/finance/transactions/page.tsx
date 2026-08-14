import { Badge, DataTable, PageHeader, type Column } from "@tesera/ui";
import { getApp } from "@/src/tesera/engine";
import {
  Account,
  Category,
  DIRECTION_LABELS,
  Transaction,
} from "@/src/tesera/modules/finance";
import { createTransaction } from "@/src/tesera/actions";
import { formatDate, money } from "@/src/tesera/format";
import { AddRecord } from "@/src/ui/AddRecord";

export default async function TransactionsPage() {
  const app = await getApp();
  const [txs, accounts, categories] = await Promise.all([
    app.repo(Transaction).list({ orderBy: { field: "date", direction: "desc" } }),
    app.repo(Account).list(),
    app.repo(Category).list({ orderBy: { field: "name", direction: "asc" } }),
  ]);

  const accountName = (id: string) => accounts.find((a) => a.id === id)?.name ?? "—";
  const categoryName = (id: string) => categories.find((c) => c.id === id)?.name ?? "—";

  const columns: Column<(typeof txs)[number]>[] = [
    { key: "date", header: "Дата", render: (t) => formatDate(t.date) },
    {
      key: "direction",
      header: "Тип",
      render: (t) => (
        <Badge tone={t.direction === "in" ? "green" : "neutral"}>
          {DIRECTION_LABELS[t.direction]}
        </Badge>
      ),
    },
    { key: "category", header: "Категория", render: (t) => categoryName(t.categoryId) },
    { key: "counterparty", header: "Контрагент", render: (t) => t.counterparty ?? "—" },
    { key: "account", header: "Счёт", render: (t) => accountName(t.accountId) },
    {
      key: "amount",
      header: "Сумма",
      align: "right",
      render: (t) => (
        <span className={t.direction === "in" ? "font-medium text-emerald-600" : "font-medium text-ink"}>
          {(t.direction === "in" ? "+" : "−") + money(t.amount)}
        </span>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Операции"
        subtitle="Все движения денег"
        actions={
          <AddRecord
            title="Новая операция"
            action={createTransaction}
            submitLabel="Добавить операцию"
            label="Новая операция"
            fields={[
              { name: "date", label: "Дата", type: "date", defaultValue: "2026-08-12", required: true },
              {
                name: "direction",
                label: "Направление",
                type: "select",
                defaultValue: "out",
                options: [
                  { value: "out", label: "Расход" },
                  { value: "in", label: "Приход" },
                ],
              },
              { name: "amount", label: "Сумма", type: "number", step: "1000", placeholder: "0", required: true },
              {
                name: "categoryId",
                label: "Категория",
                type: "select",
                required: true,
                options: categories.map((c) => ({ value: c.id, label: c.name })),
              },
              {
                name: "accountId",
                label: "Счёт",
                type: "select",
                required: true,
                options: accounts.map((a) => ({ value: a.id, label: a.name })),
              },
              { name: "counterparty", label: "Контрагент", placeholder: "Например, клиент" },
            ]}
          />
        }
      />

      <DataTable columns={columns} rows={txs} empty="Операций пока нет" />
    </>
  );
}
