import { randomUUID } from "node:crypto";
import { NotFoundError } from "../errors";
import type { DataAdapter, ListOptions, Row, Where } from "./adapter";

function matches(row: Row, where?: Where): boolean {
  if (!where) return true;
  return Object.entries(where).every(([key, value]) => row[key] === value);
}

/**
 * Zero-dependency in-memory adapter. Ideal for tests, prototyping and the
 * default developer experience: an app boots with no database. Data lives for
 * the lifetime of the process only. Returned rows are shallow copies, so
 * callers can't mutate the store by reference.
 */
export class InMemoryAdapter implements DataAdapter {
  private readonly stores = new Map<string, Map<string, Row>>();

  private store(entity: string): Map<string, Row> {
    let store = this.stores.get(entity);
    if (!store) {
      store = new Map();
      this.stores.set(entity, store);
    }
    return store;
  }

  async create(entity: string, data: Record<string, unknown>): Promise<Row> {
    const id = typeof data.id === "string" && data.id ? data.id : randomUUID();
    const row: Row = { ...data, id };
    this.store(entity).set(id, row);
    return { ...row };
  }

  async findById(entity: string, id: string): Promise<Row | null> {
    const row = this.store(entity).get(id);
    return row ? { ...row } : null;
  }

  async findOne(entity: string, where: Where): Promise<Row | null> {
    for (const row of this.store(entity).values()) {
      if (matches(row, where)) return { ...row };
    }
    return null;
  }

  async list(entity: string, options: ListOptions = {}): Promise<Row[]> {
    let rows = [...this.store(entity).values()].filter((row) =>
      matches(row, options.where),
    );

    if (options.orderBy) {
      const { field, direction = "asc" } = options.orderBy;
      const sign = direction === "desc" ? -1 : 1;
      rows = [...rows].sort((a, b) => {
        const av = a[field] as never;
        const bv = b[field] as never;
        if (av === bv) return 0;
        return (av > bv ? 1 : -1) * sign;
      });
    }

    const start = options.skip ?? 0;
    const end = options.take === undefined ? undefined : start + options.take;
    return rows.slice(start, end).map((row) => ({ ...row }));
  }

  async update(
    entity: string,
    id: string,
    patch: Record<string, unknown>,
  ): Promise<Row> {
    const store = this.store(entity);
    const existing = store.get(id);
    if (!existing) throw new NotFoundError(entity, id);
    const next: Row = { ...existing, ...patch, id };
    store.set(id, next);
    return { ...next };
  }

  async delete(entity: string, id: string): Promise<void> {
    const store = this.store(entity);
    if (!store.has(id)) throw new NotFoundError(entity, id);
    store.delete(id);
  }

  async count(entity: string, where?: Where): Promise<number> {
    if (!where) return this.store(entity).size;
    let n = 0;
    for (const row of this.store(entity).values()) if (matches(row, where)) n++;
    return n;
  }
}
