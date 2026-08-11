import { z } from "zod";
import type { FieldMap } from "./field";

/** Reserved system fields present on every persisted record. */
export interface SystemFields {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

type ZodShapeOf<F extends FieldMap> = { [K in keyof F]: F[K]["zod"] };

export interface EntityConfig<F extends FieldMap> {
  /** Unique machine name, e.g. "product". Used as the collection key. */
  name: string;
  /** Human-readable label; defaults to `name`. */
  label?: string;
  /** Field definitions. */
  fields: F;
}

/**
 * A compiled entity model — the single source of truth used by repositories,
 * the event bus and the SDK. `In`/`Out` are phantom types carrying the inferred
 * *input* (accepted by `create`) and *output* (stored field values) shapes, so
 * everything downstream stays fully typed without re-deriving object types.
 */
export interface EntityModel<
  F extends FieldMap = FieldMap,
  In = unknown,
  Out = unknown,
> {
  readonly name: string;
  readonly label: string;
  readonly fields: F;
  /** zod schema of the user-defined fields (no system fields). */
  readonly fieldsSchema: z.ZodTypeAny;
  /** zod schema of a full stored record (fields + system fields). */
  readonly recordSchema: z.ZodTypeAny;
  /** @internal phantom — never populated at runtime. */
  readonly __in?: In;
  /** @internal phantom — never populated at runtime. */
  readonly __out?: Out;
}

/** Input accepted by `repo.create` for an entity. */
export type EntityInput<E> = E extends EntityModel<FieldMap, infer In, unknown>
  ? In
  : never;

/** Field values of a stored entity (without system fields). */
export type EntityValues<E> = E extends EntityModel<FieldMap, unknown, infer Out>
  ? Out
  : never;

/** A full stored record: field values + system fields. */
export type EntityRecord<E> = EntityValues<E> & SystemFields;

/**
 * Define an entity from a field map. Returns an {@link EntityModel} whose
 * phantom types are inferred from the fields' zod schemas.
 */
export function defineEntity<F extends FieldMap>(
  config: EntityConfig<F>,
): EntityModel<
  F,
  z.input<z.ZodObject<ZodShapeOf<F>>>,
  z.output<z.ZodObject<ZodShapeOf<F>>>
> {
  const shape: z.ZodRawShape = {};
  for (const [key, field] of Object.entries(config.fields)) {
    shape[key] = field.zod;
  }

  const fieldsSchema = z.object(shape);
  const recordSchema = fieldsSchema.extend({
    id: z.string(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
  });

  return {
    name: config.name,
    label: config.label ?? config.name,
    fields: config.fields,
    fieldsSchema,
    recordSchema,
  };
}
