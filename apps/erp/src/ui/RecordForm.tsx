"use client";
import { useRef } from "react";
import { Button, Field, Input, Select } from "@tesera/ui";

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
 * A generic create-form driven by a field spec. Pages describe their fields and
 * hand over a server action; the form renders, submits and resets itself, so
 * every module gets the same look without hand-rolling markup.
 */
export function RecordForm({
  action,
  fields,
  submitLabel,
}: {
  action: (formData: FormData) => Promise<void>;
  fields: FormFieldSpec[];
  submitLabel: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await action(formData);
        formRef.current?.reset();
      }}
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
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
      <div className="flex items-end sm:col-span-2 lg:col-span-3">
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
