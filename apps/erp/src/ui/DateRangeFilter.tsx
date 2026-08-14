"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { CalendarDays, X } from "lucide-react";
import { cn } from "@tesera/ui";
import { DEFAULT_PRESET, RANGE_PRESETS, type RangeKey } from "@/src/tesera/range";

/**
 * Period picker used by operations and reports. Presets cover the common
 * questions ("за месяц", "за квартал"), and the two date inputs handle anything
 * else. State lives in the URL, so the server components re-render filtered and
 * the view stays shareable and back-button friendly.
 */
export function DateRangeFilter({
  resolvedFrom,
  resolvedTo,
}: {
  /** Dates the active preset resolves to, shown in the inputs for clarity. */
  resolvedFrom?: string;
  resolvedTo?: string;
} = {}) {
  const router = useRouter();
  const params = useSearchParams();

  const period = (params.get("period") ?? DEFAULT_PRESET) as RangeKey;
  const from = params.get("from") ?? "";
  const to = params.get("to") ?? "";
  const custom = Boolean(from || to);

  const apply = (next: { period?: string; from?: string; to?: string }) => {
    const query = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value) query.set(key, value);
      else query.delete(key);
    }
    router.replace(`?${query.toString()}`, { scroll: false });
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="inline-flex rounded-xl bg-slate-100 p-1">
        {RANGE_PRESETS.map((preset) => {
          const active = !custom && period === preset.key;
          return (
            <button
              key={preset.key}
              type="button"
              onClick={() => apply({ period: preset.key, from: "", to: "" })}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-medium transition",
                active ? "bg-white text-ink shadow-sm" : "text-slate-500 hover:text-ink",
              )}
            >
              {preset.label}
            </button>
          );
        })}
      </div>

      <div
        className={cn(
          "flex items-center gap-2 rounded-xl border bg-white px-3 py-1.5 transition",
          custom ? "border-brand-300 ring-2 ring-brand-100" : "border-slate-200",
        )}
      >
        <CalendarDays className="h-4 w-4 shrink-0 text-slate-400" />
        <input
          type="date"
          value={from || resolvedFrom || ""}
          onChange={(event) => apply({ from: event.target.value, period: "" })}
          className="w-[128px] bg-transparent text-sm font-medium text-ink outline-none"
        />
        <span className="text-slate-400">→</span>
        <input
          type="date"
          value={to || resolvedTo || ""}
          onChange={(event) => apply({ to: event.target.value, period: "" })}
          className="w-[128px] bg-transparent text-sm font-medium text-ink outline-none"
        />
        {custom && (
          <button
            type="button"
            onClick={() => apply({ period: "all", from: "", to: "" })}
            aria-label="Сбросить период"
            className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
