import { randomUUID } from "node:crypto";
import type { Context } from "../context/context";
import { SYSTEM_CONTEXT } from "../context/context";
import type { EntityInput, EntityModel, EntityRecord } from "../entity/entity";
import { NotFoundError, ValidationError } from "../errors";
import type { EventBus } from "../events/bus";
import type { DataAdapter, ListOptions, Where } from "./adapter";

interface Parseable {
  safeParse(value: unknown): { success: true; data: unknown } | { success: false; error: { flatten(): unknown } };
}

function parseOrThrow(entity: string, schema: Parseable, data: unknown): Record<string, unknown> {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ValidationError(`Invalid ${entity}`, result.error.flatten());
  }
  return result.data as Record<string, unknown>;
}

/**
 * Typed data access for a single entity. Wraps a {@link DataAdapter} and adds
 * what every ERP entity needs: input validation, system fields (`id`,
 * `createdAt`, `updatedAt`) and domain events
 * (`<entity>.created | updated | deleted`) emitted *after* each write.
 */
export class Repository<E extends EntityModel> {
  constructor(
    private readonly model: E,
    private readonly adapter: DataAdapter,
    private readonly events: EventBus,
  ) {}

  /** The entity name this repository serves. */
  get entity(): string {
    return this.model.name;
  }

  async create(
    input: EntityInput<E>,
    context: Context = SYSTEM_CONTEXT,
  ): Promise<EntityRecord<E>> {
    const values = parseOrThrow(this.model.name, this.model.fieldsSchema, input);
    const now = new Date();
    const row = await this.adapter.create(this.model.name, {
      id: randomUUID(),
      ...values,
      createdAt: now,
      updatedAt: now,
    });
    const record = row as EntityRecord<E>;
    await this.events.emit({
      type: `${this.model.name}.created`,
      entity: this.model.name,
      data: record,
      at: now,
      context,
    });
    return record;
  }

  async findById(
    id: string,
    _context: Context = SYSTEM_CONTEXT,
  ): Promise<EntityRecord<E> | null> {
    const row = await this.adapter.findById(this.model.name, id);
    return (row as EntityRecord<E> | null) ?? null;
  }

  /** Like {@link findById} but throws {@link NotFoundError} when absent. */
  async get(
    id: string,
    context: Context = SYSTEM_CONTEXT,
  ): Promise<EntityRecord<E>> {
    const record = await this.findById(id, context);
    if (!record) throw new NotFoundError(this.model.name, id);
    return record;
  }

  async findOne(
    where: Where,
    _context: Context = SYSTEM_CONTEXT,
  ): Promise<EntityRecord<E> | null> {
    const row = await this.adapter.findOne(this.model.name, where);
    return (row as EntityRecord<E> | null) ?? null;
  }

  async list(
    options?: ListOptions,
    _context: Context = SYSTEM_CONTEXT,
  ): Promise<EntityRecord<E>[]> {
    const rows = await this.adapter.list(this.model.name, options);
    return rows as EntityRecord<E>[];
  }

  async count(
    where?: Where,
    _context: Context = SYSTEM_CONTEXT,
  ): Promise<number> {
    return this.adapter.count(this.model.name, where);
  }

  async update(
    id: string,
    patch: Partial<EntityInput<E>>,
    context: Context = SYSTEM_CONTEXT,
  ): Promise<EntityRecord<E>> {
    const partialSchema = (
      this.model.fieldsSchema as unknown as { partial(): Parseable }
    ).partial();
    const values = parseOrThrow(this.model.name, partialSchema, patch);
    const now = new Date();
    const row = await this.adapter.update(this.model.name, id, {
      ...values,
      updatedAt: now,
    });
    const record = row as EntityRecord<E>;
    await this.events.emit({
      type: `${this.model.name}.updated`,
      entity: this.model.name,
      data: record,
      at: now,
      context,
    });
    return record;
  }

  async delete(id: string, context: Context = SYSTEM_CONTEXT): Promise<void> {
    const existing = await this.get(id, context);
    await this.adapter.delete(this.model.name, id);
    await this.events.emit({
      type: `${this.model.name}.deleted`,
      entity: this.model.name,
      data: existing,
      at: new Date(),
      context,
    });
  }
}
