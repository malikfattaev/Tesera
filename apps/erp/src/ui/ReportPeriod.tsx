import { Card } from "@tesera/ui";
import { isoDate } from "@/src/tesera/format";
import type { Range } from "@/src/tesera/range";
import { DateRangeFilter } from "./DateRangeFilter";

/**
 * Report parameters card. Unlike a classic "построить отчёт" form, changing the
 * period applies immediately: the numbers below re-render on the server, so
 * there is no extra button to press. The date inputs always show the dates the
 * active preset resolves to.
 */
export function ReportPeriod({ range }: { range: Range }) {
  return (
    <Card className="mb-6">
      <div className="p-5">
        <div className="mb-3 text-sm font-semibold text-ink">Период отчёта</div>
        <DateRangeFilter
          resolvedFrom={range.from ? isoDate(range.from) : undefined}
          resolvedTo={range.to ? isoDate(range.to) : undefined}
        />
      </div>
    </Card>
  );
}
