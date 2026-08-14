import { DataTable, StatCard, type Column } from "@tesera/ui";
import { getApp } from "@/src/tesera/engine";
import { Account, Category, Transaction } from "@/src/tesera/modules/finance";
import { Counterparty } from "@/src/tesera/modules/projects";
import { createIncome } from "@/src/tesera/actions";
import { formatDate, isoDate, money, today } from "@/src/tesera/format";
import { filterByRange, resolveRange } from "@/src/tesera/range";
import { AddRecord } from "@/src/ui/AddRecord";
import { DateRangeFilter } from "@/src/ui/DateRangeFilter";

export default async function IncomePage({
  searchParams,
}: {
  searchParams: { period?: string; from?: string; to?: string };
}) {
  const app = await getApp();
  const [all, accounts, categories, counterparties] = await Promise.all([
    app.repo(Transaction).list({ orderBy: { field: "date", direction: "desc" } }),
    app.repo(Account).list(),
    app.repo(Category).list({ orderBy: { field: "name", direction: "asc" } }),
    app.repo(Counterparty).list({ orderBy: { field: "name", direction: "asc" } }),
  ]);

  const range = resolveRange(searchParams);
  const rows = filterByRange(all.filter((t) => t.direction === "in"), range);
  const total = rows.reduce((sum, t) => sum + t.amount, 0);

  const accountName = (id: string) => accounts.find((a) => a.id === id)?.name ?? "—";
  const categoryName = (id?: string) =>
    id ? (categories.find((c) => c.id === id)?.name ?? "—") : "—";
  const counterpartyName = (id?: string) =>
    id ? (counterparties.find((c) => c.id === id)?.name ?? "—") : "—";

  const columns: Column<(typeof rows)[number]>[] = [
    { key: "date", header: "Дата", render: (t) => formatDate(t.date) },
    { key: "counterparty", header: "Контрагент", render: (t) => counterpartyName(t.counterpartyId) },
    { key: "category", header: "Категория", render: (t) => categoryName(t.categoryId) },
    { key: "account", header: "Счёт", render: (t) => accountName(t.accountId) },
    {
      key: "amount",
      header: "Сумма",
      align: "right",
      render: (t) => <span className="font-medium text-emerald-600">+{money(t.amount)}</span>,
    },
  ];

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <DateRangeFilter
          resolvedFrom={range.from ? isoDate(range.from) : undefined}
          resolvedTo={range.to ? isoDate(range.to) : undefined}
        />
        <AddRecord
          title="Новый доход"
          label="Новый доход"
          action={createIncome}
          submitLabel="Добавить доход"
          fields={[
            { name: "date", label: "Дата", type: "date", defaultValue: today(), required: true },
            { name: "amount", label: "Сумма", type: "number", step: "1000", placeholder: "0", required: true },
            {
              name: "counterpartyId",
              label: "Контрагент",
              type: "select",
              options: [
                { value: "", label: "Без контрагента" },
                ...counterparties.map((c) => ({ value: c.id, label: c.name })),
              ],
            },
            {
              name: "categoryId",
              label: "Категория",
              type: "select",
              required: true,
              options: categories
                .filter((c) => c.direction === "in")
                .map((c) => ({ value: c.id, label: c.name })),
            },
            {
              name: "accountId",
              label: "Счёт зачисления",
              type: "select",
              required: true,
              options: accounts.map((a) => ({ value: a.id, label: a.name })),
            },
            { name: "note", label: "Комментарий", placeholder: "Необязательно" },
          ]}
        />
      </div>

      <div className="mb-4 grid gap-4 sm:grid-cols-2">
        <StatCard label={`Доходы, ${range.label.toLowerCase()}`} value={money(total)} tone="positive" />
        <StatCard label="Операций" value={rows.length} />
      </div>

      <DataTable columns={columns} rows={rows} empty="За выбранный период доходов нет" />
    </>
  );
}
