import type { Column } from "@tesera/ui";

export interface TableParams {
  q?: string;
  sort?: string;
  dir?: string;
  page?: string;
}

export const PAGE_SIZE = 20;

/** The raw value behind a cell, or null when the column holds no data. */
function rawValue<T>(column: Column<T>, row: T): string | number | null {
  if (column.value) return column.value(row);
  const direct = (row as Record<string, unknown>)[column.key];
  if (typeof direct === "string" || typeof direct === "number") return direct;
  return null;
}

/** Columns that carry data, so can be searched, sorted and exported. */
export function dataColumns<T>(columns: Column<T>[], sample?: T): Column<T>[] {
  return columns.filter(
    (column) => column.value !== undefined || (sample ? rawValue(column, sample) !== null : false),
  );
}

export interface TableView<T> {
  /** Rows for the current page. */
  rows: T[];
  /** Rows after search, before paging. */
  total: number;
  /** Rows before search. */
  grandTotal: number;
  page: number;
  pages: number;
  q: string;
  sort?: string;
  dir: "asc" | "desc";
  /** Everything that matched the search, as CSV. */
  csv: string;
}

function toCsv<T>(columns: Column<T>[], rows: T[]): string {
  const escape = (value: string) =>
    /[";\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;

  const header = columns.map((c) => escape(typeof c.header === "string" ? c.header : c.key));
  const lines = rows.map((row) =>
    columns.map((column) => escape(String(rawValue(column, row) ?? ""))).join(";"),
  );
  // Semicolons and a BOM keep Excel happy with Cyrillic and ru number formats.
  return "﻿" + [header.join(";"), ...lines].join("\n");
}

/**
 * Apply search, sorting and paging to a table. Everything happens on the server
 * from URL state, so tables stay server-rendered and links remain shareable.
 */
export function applyTableState<T>(
  columns: Column<T>[],
  rows: T[],
  params: TableParams,
): TableView<T> {
  const searchable = dataColumns(columns, rows[0]);
  const q = (params.q ?? "").trim().toLowerCase();

  let filtered = rows;
  if (q) {
    filtered = rows.filter((row) =>
      searchable.some((column) =>
        String(rawValue(column, row) ?? "")
          .toLowerCase()
          .includes(q),
      ),
    );
  }

  const dir = params.dir === "desc" ? "desc" : "asc";
  const sortColumn = params.sort
    ? columns.find((column) => column.key === params.sort)
    : undefined;

  if (sortColumn) {
    const sign = dir === "desc" ? -1 : 1;
    filtered = [...filtered].sort((a, b) => {
      const av = rawValue(sortColumn, a);
      const bv = rawValue(sortColumn, b);
      if (av === bv) return 0;
      if (av === null) return 1;
      if (bv === null) return -1;
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * sign;
      return String(av).localeCompare(String(bv), "ru") * sign;
    });
  }

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(Math.max(1, Number(params.page ?? 1) || 1), pages);
  const start = (page - 1) * PAGE_SIZE;

  return {
    rows: filtered.slice(start, start + PAGE_SIZE),
    total: filtered.length,
    grandTotal: rows.length,
    page,
    pages,
    q: params.q ?? "",
    sort: params.sort,
    dir,
    csv: toCsv(searchable, filtered),
  };
}
