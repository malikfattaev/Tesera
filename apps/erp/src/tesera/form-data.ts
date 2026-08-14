import type { EntityModel } from "@tesera/core";

/**
 * Turn a submitted form into entity values, using the entity's own field
 * metadata to decide how each input is parsed. One conversion for every module:
 * define a field in the model and forms, updates and validation follow.
 *
 * Fields absent from the form are left untouched, so this is safe for partial
 * updates as well as creates.
 */
export function valuesFromForm(
  model: EntityModel,
  formData: FormData,
): Record<string, unknown> {
  const values: Record<string, unknown> = {};

  for (const [name, field] of Object.entries(model.fields)) {
    if (!formData.has(name)) continue;
    const meta = field.meta;
    const raw = formData.get(name);

    if (meta.kind === "boolean") {
      values[name] = raw === "on" || raw === "true";
      continue;
    }

    const text = raw == null ? "" : String(raw).trim();
    if (!text) continue; // empty input: keep the stored value

    if (meta.kind === "number") values[name] = Number(text);
    else if (meta.kind === "date") values[name] = new Date(text);
    else values[name] = text;
  }

  return values;
}
