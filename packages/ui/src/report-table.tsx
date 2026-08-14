import type { ReactNode } from "react";
import { cn } from "./cn";

export type ReportRowKind = "section" | "item" | "subtotal" | "total";
export type ReportTone = "income" | "expense" | "neutral";

export interface ReportColumn {
  key: string;
  label: string;
}

export interface ReportRow {
  id: string;
  label: string;
  kind: ReportRowKind;
  /** One value per column, in the same order as `columns`. */
  values: number[];
  /** Row total; rendered in the trailing "Итого" column. */
  total: number;
  tone?: ReportTone;
}

function formatAmount(value: number): string {
  return new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * A period report laid out as a matrix: named rows down the side, periods
 * across the top, and a trailing total. Rows carry a kind so sections,
 * subtotals and the bottom line read differently without callers styling
 * anything. The first column sticks while the periods scroll sideways.
 */
export function ReportTable({
  columns,
  rows,
  rowHeader,
  caption,
}: {
  columns: ReportColumn[];
  rows: ReportRow[];
  /** Header text for the sticky first column. */
  rowHeader: string;
  /** Small note under the table, e.g. the currency. */
  caption?: ReactNode;
}) {
  const cellTone = (row: ReportRow, value: number) => {
    if (value === 0) return "text-slate-300";
    if (row.tone === "income" || (row.kind === "total" && value > 0)) return "text-emerald-600";
    if (row.kind === "total" && value < 0) return "text-rose-600";
    return "text-slate-700";
  };

  const rowClass = (row: ReportRow) => {
    if (row.kind === "section") {
      return row.tone === "income"
        ? "bg-emerald-50/70 text-emerald-700"
        : row.tone === "expense"
          ? "bg-rose-50/70 text-rose-700"
          : "bg-slate-50 text-slate-600";
    }
    if (row.kind === "subtotal") {
      return row.tone === "income" ? "bg-emerald-50/40 font-medium" : "bg-slate-50 font-medium";
    }
    if (row.kind === "total") return "border-t-2 border-slate-200 bg-white font-semibold";
    return "bg-white";
  };

  const stickyBg = (row: ReportRow) => {
    if (row.kind === "section") {
      return row.tone === "income"
        ? "bg-emerald-50"
        : row.tone === "expense"
          ? "bg-rose-50"
          : "bg-slate-50";
    }
    if (row.kind === "subtotal") return row.tone === "income" ? "bg-emerald-50" : "bg-slate-50";
    return "bg-white";
  };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200/70 bg-white shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-max border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
              <th className="sticky left-0 z-10 bg-white px-4 py-3 text-left font-semibold">
                {rowHeader}
              </th>
              {columns.map((column) => (
                <th key={column.key} className="whitespace-nowrap px-4 py-3 text-right font-semibold">
                  {column.label}
                </th>
              ))}
              <th className="whitespace-nowrap bg-slate-50/60 px-4 py-3 text-right font-semibold text-slate-500">
                Итого
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {rows.map((row) => (
              <tr key={row.id} className={rowClass(row)}>
                <td
                  className={cn(
                    "sticky left-0 z-10 whitespace-nowrap px-4 py-2.5",
                    stickyBg(row),
                    row.kind === "section" && "text-xs font-semibold uppercase tracking-wide",
                    row.kind === "item" && "pl-8 text-slate-600",
                    (row.kind === "subtotal" || row.kind === "total") && "text-ink",
                  )}
                >
                  {row.label}
                </td>
                {row.values.map((value, index) => (
                  <td
                    key={columns[index]?.key ?? index}
                    className={cn(
                      "whitespace-nowrap px-4 py-2.5 text-right tabular-nums",
                      row.kind === "section" ? "text-transparent" : cellTone(row, value),
                    )}
                  >
                    {row.kind === "section" ? "" : formatAmount(value)}
                  </td>
                ))}
                <td
                  className={cn(
                    "whitespace-nowrap bg-slate-50/60 px-4 py-2.5 text-right font-medium tabular-nums",
                    row.kind === "section" ? "text-transparent" : cellTone(row, row.total),
                  )}
                >
                  {row.kind === "section" ? "" : formatAmount(row.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {caption ? (
        <div className="border-t border-slate-100 px-4 py-2.5 text-xs text-slate-400">{caption}</div>
      ) : null}
    </div>
  );
}
