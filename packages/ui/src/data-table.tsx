import type { ReactNode } from "react";
import { cn } from "./cn";
import { EmptyState } from "./primitives";

export interface Column<T> {
  key: string;
  header: ReactNode;
  render?: (row: T) => ReactNode;
  align?: "left" | "right";
  className?: string;
}

/**
 * A presentational, typed data table. Columns declare how each cell renders;
 * rows are plain records (e.g. Tesera entity records). Shows an empty state
 * when there are no rows.
 *
 * Rows are positioned, so a cell may host a link that covers the whole row
 * (`className="after:absolute after:inset-0"`). That keeps navigation in the
 * caller's hands (and its router) instead of coupling the table to one.
 */
export function DataTable<T extends { id?: string | number }>({
  columns,
  rows,
  empty,
}: {
  columns: Column<T>[];
  rows: T[];
  empty?: string;
}) {
  if (!rows.length) {
    return <EmptyState title={empty ?? "Нет данных"} />;
  }
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200/70 bg-white shadow-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "px-4 py-3 font-semibold",
                  col.align === "right" && "text-right",
                  col.className,
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {rows.map((row, index) => (
            <tr
              key={row.id ?? index}
              className="group relative transition hover:bg-slate-50/70"
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cn(
                    "px-4 py-3 text-slate-700",
                    col.align === "right" && "text-right tabular-nums",
                    col.className,
                  )}
                >
                  {col.render
                    ? col.render(row)
                    : String((row as Record<string, unknown>)[col.key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
