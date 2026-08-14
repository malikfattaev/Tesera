/** Shared money math, so every page agrees on what a balance or a total means. */

export interface TxLike {
  direction: "in" | "out" | "transfer";
  amount: number;
  accountId: string;
  toAccountId?: string;
}

/** Effect of one transaction on a given account. Transfers move both sides. */
export function accountDelta(tx: TxLike, accountId: string): number {
  if (tx.direction === "transfer") {
    if (tx.accountId === accountId) return -tx.amount;
    if (tx.toAccountId === accountId) return tx.amount;
    return 0;
  }
  if (tx.accountId !== accountId) return 0;
  return tx.direction === "in" ? tx.amount : -tx.amount;
}

/** Closing balance per account id. */
export function balancesByAccount(txs: TxLike[]): Map<string, number> {
  const balances = new Map<string, number>();
  const add = (id: string, delta: number) =>
    balances.set(id, (balances.get(id) ?? 0) + delta);
  for (const tx of txs) {
    if (tx.direction === "transfer") {
      add(tx.accountId, -tx.amount);
      if (tx.toAccountId) add(tx.toAccountId, tx.amount);
    } else {
      add(tx.accountId, tx.direction === "in" ? tx.amount : -tx.amount);
    }
  }
  return balances;
}

/**
 * Income / expense totals. Transfers are deliberately excluded: moving money
 * between own accounts is neither income nor spending.
 */
export function totals(txs: TxLike[]): { income: number; expense: number; net: number } {
  let income = 0;
  let expense = 0;
  for (const tx of txs) {
    if (tx.direction === "in") income += tx.amount;
    else if (tx.direction === "out") expense += tx.amount;
  }
  return { income, expense, net: income - expense };
}
