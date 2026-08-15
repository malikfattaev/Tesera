"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Download, Search, X } from "lucide-react";
import { cn } from "@tesera/ui";

/** Update table state in the URL, always returning to the first page. */
function useTableUrl() {
  const router = useRouter();
  const params = useSearchParams();
  return (next: Record<string, string>) => {
    const query = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value) query.set(key, value);
      else query.delete(key);
    }
    router.replace(`?${query.toString()}`, { scroll: false });
  };
}

export function TableToolbar({
  q,
  total,
  grandTotal,
  csv,
  filename,
}: {
  q: string;
  total: number;
  grandTotal: number;
  csv: string;
  filename: string;
}) {
  const apply = useTableUrl();
  const [value, setValue] = useState(q);

  // Keep the field in step with the URL (back button, cleared filters).
  useEffect(() => setValue(q), [q]);

  // Search as you type, but only once typing pauses.
  useEffect(() => {
    if (value === q) return;
    const timer = setTimeout(() => apply({ q: value, page: "" }), 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const download = () => {
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="relative w-full max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Поиск по таблице"
          className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-8 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
        />
        {value && (
          <button
            type="button"
            onClick={() => setValue("")}
            aria-label="Очистить поиск"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs text-slate-400">
          {q ? `Найдено ${total} из ${grandTotal}` : `Всего ${grandTotal}`}
        </span>
        <button
          type="button"
          onClick={download}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-ink transition hover:bg-slate-50"
        >
          <Download className="h-4 w-4 text-slate-400" />
          Экспорт
        </button>
      </div>
    </div>
  );
}

export function SortHeader({
  columnKey,
  label,
  active,
  dir,
  align,
}: {
  columnKey: string;
  label: string;
  active: boolean;
  dir: "asc" | "desc";
  align?: "left" | "right";
}) {
  const apply = useTableUrl();
  const nextDir = active && dir === "asc" ? "desc" : "asc";

  return (
    <button
      type="button"
      onClick={() => apply({ sort: columnKey, dir: nextDir, page: "" })}
      className={cn(
        "inline-flex items-center gap-1 uppercase tracking-wide transition hover:text-slate-600",
        active && "text-slate-600",
        align === "right" && "flex-row-reverse",
      )}
    >
      {label}
      {active ? (
        dir === "asc" ? (
          <ArrowUp className="h-3 w-3" />
        ) : (
          <ArrowDown className="h-3 w-3" />
        )
      ) : null}
    </button>
  );
}

export function TablePagination({
  page,
  pages,
  total,
}: {
  page: number;
  pages: number;
  total: number;
}) {
  const apply = useTableUrl();
  if (pages <= 1) return null;

  const button = (targetPage: number, disabled: boolean, children: React.ReactNode) => (
    <button
      type="button"
      disabled={disabled}
      onClick={() => apply({ page: String(targetPage) })}
      className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );

  return (
    <div className="flex items-center justify-between px-1">
      <span className="text-xs text-slate-400">
        Страница {page} из {pages}, всего {total}
      </span>
      <div className="flex items-center gap-1.5">
        {button(page - 1, page <= 1, <ChevronLeft className="h-4 w-4" />)}
        {button(page + 1, page >= pages, <ChevronRight className="h-4 w-4" />)}
      </div>
    </div>
  );
}
