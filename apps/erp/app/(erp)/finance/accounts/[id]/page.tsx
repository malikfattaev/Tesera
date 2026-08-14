import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Badge, DataTable, PageHeader, StatCard, type Column } from "@tesera/ui";
import { getApp } from "@/src/tesera/engine";
import {
  Account,
  ACCOUNT_KIND_LABELS,
  Category,
  Transaction,
} from "@/src/tesera/modules/finance";
import { Counterparty } from "@/src/tesera/modules/projects";
import { accountDelta } from "@/src/tesera/finance-calc";
import { formatDate, isoDate, money, signedMoney } from "@/src/tesera/format";
import { inRange, resolveRange } from "@/src/tesera/range";
import { DateRangeFilter } from "@/src/ui/DateRangeFilter";

export default async function AccountPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { period?: string; from?: string; to?: string };
}) {
  const app = await getApp();
  const account = await app.repo(Account).findById(params.id);
  if (!account) notFound();

  const [txs, accounts, categories, counterparties] = await Promise.all([
    app.repo(Transaction).list(),
    app.repo(Account).list(),
    app.repo(Category).list(),
    app.repo(Counterparty).list(),
  ]);

  const range = resolveRange(searchParams);
  const accountName = (id?: string) =>
    id ? (accounts.find((a) => a.id === id)?.name ?? "—") : "—";
  const categoryName = (id?: string) =>
    id ? (categories.find((c) => c.id === id)?.name ?? "—") : "—";
  const counterpartyName = (id?: string) =>
    id ? (counterparties.find((c) => c.id === id)?.name ?? "—") : "—";

  /**
   * Statement lines for this account. The running balance is accumulated over
   * the account's whole history (oldest first) so it stays correct even when
   * the view is narrowed to a period, then the list is shown newest first.
   */
  const history = txs
    .filter((t) => t.accountId === account.id || t.toAccountId === account.id)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let running = 0;
  const lines = history.map((tx) => {
    const delta = accountDelta(tx, account.id);
    running += delta;

    const incoming = delta > 0;
    let kind: string;
    let description: string;
    if (tx.direction === "transfer") {
      kind = "Перевод";
      description = incoming
        ? `Со счёта: ${accountName(tx.accountId)}`
        : `На счёт: ${accountName(tx.toAccountId)}`;
    } else if (tx.direction === "in") {
      kind = "Доход";
      description = counterpartyName(tx.counterpartyId);
    } else {
      kind = "Расход";
      description = categoryName(tx.categoryId);
    }

    return {
      id: tx.id,
      date: tx.date,
      kind,
      description,
      note: tx.note,
      delta,
      balance: running,
    };
  });

  const visible = lines.filter((line) => inRange(line.date, range)).reverse();
  const incoming = visible.filter((l) => l.delta > 0).reduce((s, l) => s + l.delta, 0);
  const outgoing = visible.filter((l) => l.delta < 0).reduce((s, l) => s - l.delta, 0);

  const KIND_TONES: Record<string, "green" | "neutral" | "brand"> = {
    Доход: "green",
    Расход: "neutral",
    Перевод: "brand",
  };

  const columns: Column<(typeof visible)[number]>[] = [
    { key: "date", header: "Дата", render: (l) => formatDate(l.date) },
    {
      key: "kind",
      header: "Тип",
      render: (l) => <Badge tone={KIND_TONES[l.kind] ?? "neutral"}>{l.kind}</Badge>,
    },
    {
      key: "description",
      header: "Описание",
      render: (l) => (
        <span className="text-slate-700">
          {l.description}
          {l.note ? <span className="text-slate-400"> · {l.note}</span> : null}
        </span>
      ),
    },
    {
      key: "delta",
      header: "Сумма",
      align: "right",
      render: (l) => (
        <span className={l.delta > 0 ? "font-medium text-emerald-600" : "font-medium text-ink"}>
          {l.delta > 0 ? `+${money(l.delta)}` : `−${money(-l.delta)}`}
        </span>
      ),
    },
    {
      key: "balance",
      header: "Остаток после",
      align: "right",
      render: (l) => (
        <span className={l.balance < 0 ? "text-rose-600" : "text-slate-500"}>
          {signedMoney(l.balance)}
        </span>
      ),
    },
  ];

  return (
    <>
      <Link
        href="/finance/accounts"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        Все счета
      </Link>

      <PageHeader
        title={account.name}
        subtitle={`${ACCOUNT_KIND_LABELS[account.kind] ?? account.kind} · ${account.currency}`}
      />

      <div className="mb-5">
        <DateRangeFilter
          resolvedFrom={range.from ? isoDate(range.from) : undefined}
          resolvedTo={range.to ? isoDate(range.to) : undefined}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Текущий остаток"
          value={signedMoney(running)}
          tone={running < 0 ? "negative" : "positive"}
        />
        <StatCard label="Поступления за период" value={money(incoming)} tone="positive" />
        <StatCard label="Списания за период" value={money(outgoing)} />
        <StatCard label="Операций за период" value={visible.length} />
      </div>

      <div className="mt-6">
        <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
          История операций
        </div>
        <DataTable columns={columns} rows={visible} empty="За выбранный период операций нет" />
      </div>
    </>
  );
}
