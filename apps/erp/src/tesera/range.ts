/** Date-period filtering shared by operations and reports. */

export type RangeKey =
  | "all"
  | "today"
  | "week"
  | "month"
  | "quarter"
  | "year"
  | "custom";

export interface Range {
  key: RangeKey;
  /** Inclusive start of day; undefined means unbounded. */
  from?: Date;
  /** Inclusive end of day; undefined means unbounded. */
  to?: Date;
  label: string;
}

export const RANGE_PRESETS: { key: RangeKey; label: string }[] = [
  { key: "year", label: "Год" },
  { key: "quarter", label: "Квартал" },
  { key: "month", label: "Месяц" },
  { key: "week", label: "Неделя" },
  { key: "today", label: "Сегодня" },
  { key: "all", label: "Всё время" },
];

/** Default period: the whole current year. */
export const DEFAULT_PRESET: RangeKey = "year";

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

/** Turn URL search params into a concrete range. */
export function resolveRange(params: {
  period?: string;
  from?: string;
  to?: string;
}): Range {
  const now = new Date();

  // Explicit dates always win and mark the range as custom.
  if (params.from || params.to) {
    const from = params.from ? startOfDay(new Date(params.from)) : undefined;
    const to = params.to ? endOfDay(new Date(params.to)) : undefined;
    return { key: "custom", from, to, label: "Свой период" };
  }

  const key = (params.period ?? DEFAULT_PRESET) as RangeKey;
  const preset = RANGE_PRESETS.find((p) => p.key === key);
  if (!preset || key === "all") {
    return { key: "all", label: "Всё время" };
  }

  // Presets cover whole calendar periods, so a report shows every month of the
  // year (or quarter), not just the part that has already happened.
  const year = now.getFullYear();
  let from = startOfDay(now);
  let to = endOfDay(now);
  if (key === "week") {
    // Current week, Monday to Sunday.
    const weekday = (now.getDay() + 6) % 7;
    from = startOfDay(new Date(year, now.getMonth(), now.getDate() - weekday));
    to = endOfDay(new Date(year, now.getMonth(), now.getDate() - weekday + 6));
  } else if (key === "month") {
    from = startOfDay(new Date(year, now.getMonth(), 1));
    to = endOfDay(new Date(year, now.getMonth() + 1, 0));
  } else if (key === "quarter") {
    const firstMonth = Math.floor(now.getMonth() / 3) * 3;
    from = startOfDay(new Date(year, firstMonth, 1));
    to = endOfDay(new Date(year, firstMonth + 3, 0));
  } else if (key === "year") {
    from = startOfDay(new Date(year, 0, 1));
    to = endOfDay(new Date(year, 11, 31));
  }
  return { key, from, to, label: preset.label };
}

/** Whether a date falls inside the range. */
export function inRange(date: Date | string, range: Range): boolean {
  const value = new Date(date).getTime();
  if (range.from && value < range.from.getTime()) return false;
  if (range.to && value > range.to.getTime()) return false;
  return true;
}

/** Filter any dated rows by the range. */
export function filterByRange<T extends { date: Date | string }>(
  rows: T[],
  range: Range,
): T[] {
  if (range.key === "all") return rows;
  return rows.filter((row) => inRange(row.date, range));
}
