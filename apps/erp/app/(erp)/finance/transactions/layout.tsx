import type { ReactNode } from "react";
import { getApp } from "@/src/tesera/engine";
import { Transaction } from "@/src/tesera/modules/finance";
import { SegmentedNav } from "@/src/ui/SegmentedNav";

/**
 * Operations are split into three screens (расходы, доходы, переводы) that
 * share this header. Counts come from the engine so the tabs show how much is
 * behind each one.
 */
export default async function TransactionsLayout({ children }: { children: ReactNode }) {
  const app = await getApp();
  const txs = await app.repo(Transaction).list();
  const count = (direction: string) => txs.filter((t) => t.direction === direction).length;

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-ink">Операции</h1>
        <p className="mt-1 text-sm text-slate-500">Все движения денег компании</p>
      </div>

      <div className="mb-6">
        <SegmentedNav
          items={[
            { href: "/finance/transactions/expenses", label: "Расходы", count: count("out") },
            { href: "/finance/transactions/income", label: "Доходы", count: count("in") },
            { href: "/finance/transactions/transfers", label: "Переводы", count: count("transfer") },
          ]}
        />
      </div>

      {children}
    </>
  );
}
