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
  return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(value);
}

/**
 * A period report laid out as a matrix: named rows down the side, periods
 * across the top, a trailing total. Both the row name and the total stay pinned
 * while the months scroll, so a wide report never loses its context. Rows carry
 * a kind, so sections, subtotals and the bottom line read differently without
 * callers styling anything.
 */
export function ReportTable({
  columns,
  rows,
  rowHeader,
  title,
  period,
  caption,
}: {
  columns: ReportColumn[];
  rows: ReportRow[];
  /** Header text for the pinned first column. */
  rowHeader: string;
  /** Report name, shown above the table. */
  title?: ReactNode;
  /** Period description, shown under the title. */
  period?: ReactNode;
  /** Small note under the table, e.g. the currency. */
  caption?: ReactNode;
}) {
  /** Opaque background per row: sticky cells must not let content show through. */
  const rowBg = (row: ReportRow) => {
    if (row.kind === "section") {
      return row.tone === "income"
        ? "bg-emerald-100"
        : row.tone === "expense"
          ? "bg-rose-100"
          : "bg-slate-200";
    }
    if (row.kind === "subtotal") return "bg-slate-100";
    if (row.kind === "total") return "bg-brand-50";
    return "bg-white";
  };

  const valueClass = (row: ReportRow, value: number) => {
    if (row.kind === "section") return "text-transparent";
    if (value === 0) return "text-slate-300";
    if (row.kind === "total") return value < 0 ? "text-rose-600" : "text-emerald-700";
    if (row.tone === "income") return "text-emerald-700";
    return "text-ink";
  };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
      {(title || period) && (
        <div className="border-b border-slate-200 px-5 py-4">
          {title && <h2 className="text-lg font-semibold text-ink">{title}</h2>}
          {period && <p className="mt-0.5 text-sm text-slate-500">Период: {period}</p>}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-max border-collapse text-[15px]">
          <thead>
            <tr className="border-b-2 border-slate-200 bg-slate-50">
              <th className="sticky left-0 z-20 border-r border-slate-200 bg-slate-50 px-5 py-3.5 text-left text-sm font-semibold text-slate-600">
                {rowHeader}
              </th>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="whitespace-nowrap border-l border-slate-100 px-5 py-3.5 text-right text-sm font-semibold text-slate-600"
                >
                  {column.label}
                </th>
              ))}
              <th className="sticky right-0 z-20 border-l-2 border-slate-200 bg-slate-100 px-5 py-3.5 text-right text-sm font-bold text-ink">
                Итого
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className={cn(
                  "border-b border-slate-100",
                  rowBg(row),
                  row.kind === "total" && "border-t-2 border-slate-300",
                )}
              >
                <td
                  className={cn(
                    "sticky left-0 z-10 whitespace-nowrap border-r border-slate-200 px-5 py-3",
                    rowBg(row),
                    row.kind === "section" &&
                      cn(
                        "text-sm font-bold uppercase tracking-wide",
                        row.tone === "income"
                          ? "text-emerald-800"
                          : row.tone === "expense"
                            ? "text-rose-800"
                            : "text-slate-700",
                      ),
                    row.kind === "item" && "pl-8 text-slate-700",
                    row.kind === "subtotal" && "font-semibold text-ink",
                    row.kind === "total" && "text-base font-bold text-ink",
                  )}
                >
                  {row.label}
                </td>

                {row.values.map((value, index) => (
                  <td
                    key={columns[index]?.key ?? index}
                    className={cn(
                      "whitespace-nowrap border-l border-slate-100 px-5 py-3 text-right tabular-nums",
                      valueClass(row, value),
                      row.kind === "subtotal" && "font-semibold",
                      row.kind === "total" && "font-bold",
                    )}
                  >
                    {row.kind === "section" ? "" : formatAmount(value)}
                  </td>
                ))}

                <td
                  className={cn(
                    "sticky right-0 z-10 whitespace-nowrap border-l-2 border-slate-200 px-5 py-3 text-right font-semibold tabular-nums",
                    row.kind === "total" ? "bg-brand-50 text-base font-bold" : "bg-slate-50",
                    valueClass(row, row.total),
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
        <div className="border-t border-slate-200 bg-slate-50/60 px-5 py-3 text-xs text-slate-500">
          {caption}
        </div>
      ) : null}
    </div>
  );
}
