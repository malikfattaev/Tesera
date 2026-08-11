import { z } from "zod";

export type FieldKind =
  | "string"
  | "number"
  | "boolean"
  | "date"
  | "enum"
  | "json"
  | "relation";

export interface RelationMeta {
  /** Target entity name. */
  target: string;
  /** "one" stores a foreign-key id; "many" stores an array of ids. */
  cardinality: "one" | "many";
}

export interface FieldMeta {
  kind: FieldKind;
  label?: string;
  description?: string;
  /** Value is unique across the entity's collection. */
  unique?: boolean;
  /** Optional on input — set by `.optional()` and `.default()`. */
  optional?: boolean;
  /** Allowed values, present when `kind === "enum"`. */
  options?: readonly string[];
  /** Relation descriptor, present when `kind === "relation"`. */
  relation?: RelationMeta;
}

/**
 * A single field on an entity. Wraps a zod schema (the source of truth for
 * validation *and* TypeScript inference) together with Tesera metadata used by
 * the data layer, admin tooling and generated APIs. Immutable: every modifier
 * returns a new Field, so definitions read top-to-bottom without side effects.
 */
export class Field<Z extends z.ZodTypeAny = z.ZodTypeAny> {
  constructor(
    readonly zod: Z,
    readonly meta: FieldMeta,
  ) {}

  private derive<NZ extends z.ZodTypeAny>(
    zod: NZ,
    meta: Partial<FieldMeta> = {},
  ): Field<NZ> {
    return new Field<NZ>(zod, { ...this.meta, ...meta });
  }

  /** Human-readable label for UIs. */
  label(label: string): Field<Z> {
    return this.derive(this.zod, { label });
  }

  /** Longer description / help text. */
  describe(description: string): Field<Z> {
    return this.derive(this.zod, { description });
  }

  /** Mark the field unique within its collection. */
  unique(): Field<Z> {
    return this.derive(this.zod, { unique: true });
  }

  /** May be omitted from input. */
  optional(): Field<z.ZodOptional<Z>> {
    return this.derive(this.zod.optional(), { optional: true });
  }

  /** May be explicitly null. */
  nullable(): Field<z.ZodNullable<Z>> {
    return this.derive(this.zod.nullable());
  }

  /** Default applied when the input omits this field. */
  default(value: z.input<Z> | (() => z.input<Z>)): Field<z.ZodDefault<Z>> {
    return this.derive(this.zod.default(value as z.input<Z>), { optional: true });
  }
}

function field<Z extends z.ZodTypeAny>(zod: Z, meta: FieldMeta): Field<Z> {
  return new Field(zod, meta);
}

/**
 * The field DSL. Each helper returns a strongly-typed {@link Field} carrying
 * both a zod schema and metadata — one declaration drives validation,
 * TypeScript types, persistence and generated APIs alike.
 */
export const t = {
  string() {
    return field(z.string(), { kind: "string" });
  },
  /** Multi-line string (semantically distinct for UIs). */
  text() {
    return field(z.string(), { kind: "string", description: "multiline" });
  },
  number() {
    return field(z.number(), { kind: "number" });
  },
  int() {
    return field(z.number().int(), { kind: "number" });
  },
  boolean() {
    return field(z.boolean(), { kind: "boolean" });
  },
  date() {
    return field(z.coerce.date(), { kind: "date" });
  },
  enum<const V extends readonly [string, ...string[]]>(values: V) {
    return field(z.enum(values), { kind: "enum" });
  },
  json<T = unknown>() {
    return field(z.custom<T>(() => true), { kind: "json" });
  },
  /** Foreign-key relation to another entity (stores the target id/ids). */
  relation(target: string, cardinality: "one" | "many" = "one") {
    const base = cardinality === "one" ? z.string() : z.array(z.string());
    return field(base, { kind: "relation", relation: { target, cardinality } });
  },
} as const;

export type AnyField = Field<z.ZodTypeAny>;
export type FieldMap = Record<string, AnyField>;
