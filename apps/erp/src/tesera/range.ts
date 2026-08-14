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
  { key: "all", label: "Всё время" },
  { key: "today", label: "Сегодня" },
  { key: "week", label: "Неделя" },
  { key: "month", label: "Месяц" },
  { key: "quarter", label: "Квартал" },
  { key: "year", label: "Год" },
];

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

  const key = (params.period ?? "all") as RangeKey;
  const preset = RANGE_PRESETS.find((p) => p.key === key);
  if (!preset || key === "all") {
    return { key: "all", label: "Всё время" };
  }

  const to = endOfDay(now);
  const from = startOfDay(now);
  if (key === "today") {
    // from/to already cover today
  } else if (key === "week") {
    from.setDate(from.getDate() - 6);
  } else if (key === "month") {
    from.setMonth(from.getMonth(), 1);
  } else if (key === "quarter") {
    from.setMonth(Math.floor(from.getMonth() / 3) * 3, 1);
  } else if (key === "year") {
    from.setMonth(0, 1);
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
