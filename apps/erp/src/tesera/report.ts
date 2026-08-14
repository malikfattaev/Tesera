import type { ReportColumn } from "@tesera/ui";
import type { Range } from "./range";
import { monthKey } from "./format";

const MONTHS = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
];

const MONTHS_SHORT = [
  "янв",
  "фев",
  "мар",
  "апр",
  "май",
  "июн",
  "июл",
  "авг",
  "сен",
  "окт",
  "ноя",
  "дек",
];

/** Never render more columns than this, however wide the range is. */
const MAX_COLUMNS = 36;

/**
 * Month columns for a report. Bounded ranges use their own edges; "всё время"
 * falls back to the span of the data, so the report never shows empty columns
 * for months nothing happened in.
 */
export function monthColumns(range: Range, dates: (Date | string)[]): ReportColumn[] {
  let start: Date;
  let end: Date;

  if (range.from && range.to) {
    start = new Date(range.from);
    end = new Date(range.to);
  } else if (dates.length) {
    const times = dates.map((d) => new Date(d).getTime());
    start = new Date(range.from ?? Math.min(...times));
    end = new Date(range.to ?? Math.max(...times));
  } else {
    const now = new Date();
    start = now;
    end = now;
  }

  const columns: ReportColumn[] = [];
  const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
  const last = new Date(end.getFullYear(), end.getMonth(), 1);
  const multiYear = start.getFullYear() !== end.getFullYear();

  while (cursor <= last && columns.length < MAX_COLUMNS) {
    const month = cursor.getMonth();
    const year = cursor.getFullYear();
    columns.push({
      key: `${year}-${String(month + 1).padStart(2, "0")}`,
      label: multiYear ? `${MONTHS_SHORT[month]} ${year}` : (MONTHS[month] ?? ""),
    });
    cursor.setMonth(month + 1);
  }
  return columns;
}

/** Index of the column a date belongs to, or -1 when outside the report. */
export function columnIndex(columns: ReportColumn[], date: Date | string): number {
  return columns.findIndex((column) => column.key === monthKey(date));
}

/** Human period label, e.g. "Январь - Август 2026". */
export function periodLabel(columns: ReportColumn[]): string {
  if (!columns.length) return "Нет данных";
  const first = columns[0]!;
  const last = columns[columns.length - 1]!;
  if (first.key === last.key) return `${first.label} ${first.key.slice(0, 4)}`;
  const sameYear = first.key.slice(0, 4) === last.key.slice(0, 4);
  return sameYear
    ? `${first.label} - ${last.label} ${first.key.slice(0, 4)}`
    : `${first.label} - ${last.label}`;
}
