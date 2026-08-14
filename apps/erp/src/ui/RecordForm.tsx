"use client";
import { useRef, useState } from "react";
import { Button, Field, Input, Select } from "@tesera/ui";
import type { ActionResult } from "@/src/tesera/action-result";

export interface FormFieldOption {
  value: string;
  label: string;
}

export interface FormFieldSpec {
  name: string;
  label: string;
  type?: "text" | "number" | "date" | "email" | "select";
  options?: FormFieldOption[];
  placeholder?: string;
  required?: boolean;
  defaultValue?: string;
  step?: string;
}

/**
 * A generic create/edit form driven by a field spec. Pages describe their
 * fields and hand over a server action; the form renders, submits, resets and
 * surfaces business errors (say, insufficient funds) without losing the input.
 */
export function RecordForm({
  action,
  fields,
  submitLabel,
  onDone,
}: {
  action: (formData: FormData) => Promise<ActionResult | void>;
  fields: FormFieldSpec[];
  submitLabel: string;
  /** Called after a successful submit, e.g. to close the surrounding dialog. */
  onDone?: () => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        const result = await action(formData);
        if (result && result.ok === false) {
          setError(result.error);
          return; // keep the entered values so they can be corrected
        }
        setError(null);
        formRef.current?.reset();
        onDone?.();
      }}
      className="grid gap-4 sm:grid-cols-2"
    >
      {fields.map((field) => (
        <Field key={field.name} label={field.label}>
          {field.type === "select" ? (
            <Select
              name={field.name}
              defaultValue={field.defaultValue ?? field.options?.[0]?.value}
              required={field.required}
            >
              {(field.options ?? []).map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          ) : (
            <Input
              type={field.type ?? "text"}
              name={field.name}
              placeholder={field.placeholder}
              required={field.required}
              defaultValue={field.defaultValue}
              step={field.step}
              min={field.type === "number" ? "0" : undefined}
            />
          )}
        </Field>
      ))}

      {error && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 sm:col-span-2">
          {error}
        </p>
      )}

      <div className="mt-1 flex justify-end sm:col-span-2">
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
