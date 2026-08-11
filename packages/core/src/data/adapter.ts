/** A stored record as seen by the persistence layer (an untyped bag + id). */
export type Row = Record<string, unknown> & { id: string };

/** Simple equality filter: every listed field must match exactly. */
export type Where = Record<string, unknown>;

export interface ListOptions {
  where?: Where;
  skip?: number;
  take?: number;
  orderBy?: { field: string; direction?: "asc" | "desc" };
}

/**
 * The persistence contract. The engine ships an in-memory adapter; swap in a
 * Prisma/Postgres adapter (or any store) by implementing this interface.
 *
 * Adapters only move rows — validation, events and permissions live *above*
 * them in the repository/service layers — so adapters stay thin, testable and
 * interchangeable.
 */
export interface DataAdapter {
  create(entity: string, data: Record<string, unknown>): Promise<Row>;
  findById(entity: string, id: string): Promise<Row | null>;
  findOne(entity: string, where: Where): Promise<Row | null>;
  list(entity: string, options?: ListOptions): Promise<Row[]>;
  update(entity: string, id: string, patch: Record<string, unknown>): Promise<Row>;
  delete(entity: string, id: string): Promise<void>;
  count(entity: string, where?: Where): Promise<number>;
}
