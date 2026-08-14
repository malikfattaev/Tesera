import { Card } from "@tesera/ui";
import { DateRangeFilter } from "./DateRangeFilter";

/**
 * Report parameters card. Unlike a classic "построить отчёт" form, changing the
 * period applies immediately: the numbers below re-render on the server, so
 * there is no extra button to press.
 */
export function ReportPeriod({ period }: { period: string }) {
  return (
    <Card className="mb-6">
      <div className="flex flex-wrap items-end justify-between gap-4 p-5">
        <div>
          <div className="mb-2 text-xs font-medium text-slate-500">Период отчёта</div>
          <DateRangeFilter />
        </div>
        <div className="text-sm text-slate-500">
          Показан период: <span className="font-medium text-ink">{period}</span>
        </div>
      </div>
    </Card>
  );
}
