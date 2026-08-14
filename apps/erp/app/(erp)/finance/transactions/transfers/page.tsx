import { ArrowRight } from "lucide-react";
import { DataTable, StatCard, type Column } from "@tesera/ui";
import { getApp } from "@/src/tesera/engine";
import { Account, Transaction } from "@/src/tesera/modules/finance";
import { createTransfer } from "@/src/tesera/actions";
import { formatDate, money, today } from "@/src/tesera/format";
import { filterByRange, resolveRange } from "@/src/tesera/range";
import { AddRecord } from "@/src/ui/AddRecord";
import { DateRangeFilter } from "@/src/ui/DateRangeFilter";

export default async function TransfersPage({
  searchParams,
}: {
  searchParams: { period?: string; from?: string; to?: string };
}) {
  const app = await getApp();
  const [all, accounts] = await Promise.all([
    app.repo(Transaction).list({ orderBy: { field: "date", direction: "desc" } }),
    app.repo(Account).list(),
  ]);

  const range = resolveRange(searchParams);
  const rows = filterByRange(all.filter((t) => t.direction === "transfer"), range);
  const total = rows.reduce((sum, t) => sum + t.amount, 0);

  const accountName = (id?: string) =>
    id ? (accounts.find((a) => a.id === id)?.name ?? "—") : "—";

  const columns: Column<(typeof rows)[number]>[] = [
    { key: "date", header: "Дата", render: (t) => formatDate(t.date) },
    {
      key: "route",
      header: "Откуда и куда",
      render: (t) => (
        <span className="inline-flex items-center gap-2">
          <span>{accountName(t.accountId)}</span>
          <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
          <span className="font-medium text-ink">{accountName(t.toAccountId)}</span>
        </span>
      ),
    },
    { key: "note", header: "Комментарий", render: (t) => t.note ?? "—" },
    {
      key: "amount",
      header: "Сумма",
      align: "right",
      render: (t) => <span className="font-medium text-ink">{money(t.amount)}</span>,
    },
  ];

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <DateRangeFilter />
        <AddRecord
          title="Новый перевод"
          label="Новый перевод"
          action={createTransfer}
          submitLabel="Добавить перевод"
          fields={[
            { name: "date", label: "Дата", type: "date", defaultValue: today(), required: true },
            { name: "amount", label: "Сумма", type: "number", step: "1000", placeholder: "0", required: true },
            {
              name: "accountId",
              label: "Счёт списания",
              type: "select",
              required: true,
              options: accounts.map((a) => ({ value: a.id, label: a.name })),
            },
            {
              name: "toAccountId",
              label: "Счёт зачисления",
              type: "select",
              required: true,
              defaultValue: accounts[1]?.id,
              options: accounts.map((a) => ({ value: a.id, label: a.name })),
            },
            { name: "note", label: "Комментарий", placeholder: "Необязательно" },
          ]}
        />
      </div>

      <div className="mb-4 grid gap-4 sm:grid-cols-2">
        <StatCard label={`Переводы, ${range.label.toLowerCase()}`} value={money(total)} />
        <StatCard label="Операций" value={rows.length} />
      </div>

      <DataTable columns={columns} rows={rows} empty="За выбранный период переводов нет" />
    </>
  );
}
