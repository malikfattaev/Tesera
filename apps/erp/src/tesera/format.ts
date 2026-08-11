/** Format a number with ru-RU grouping, e.g. 10 000 000. */
export function money(n: number): string {
  return new Intl.NumberFormat("ru-RU").format(Math.round(n));
}

/** Signed money, e.g. -3 994 000. */
export function signedMoney(n: number): string {
  return (n < 0 ? "-" : "") + money(Math.abs(n));
}

/** "YYYY-MM" key for grouping by month. */
export function monthKey(date: Date | string): string {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/** "MM.YYYY" label from a month key. */
export function monthLabel(key: string): string {
  const [year, month] = key.split("-");
  return `${month}.${year}`;
}

/** Localised date, e.g. 05.08.2026. */
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("ru-RU");
}
