"use client";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button, Modal } from "@tesera/ui";
import { RecordForm, type FormFieldSpec } from "./RecordForm";

/**
 * The standard "add a record" affordance: a compact button in the page header
 * that opens a centered dialog with the create form, and closes once the record
 * is saved. Pages stay clean and every module gets the same interaction.
 */
export function AddRecord({
  title,
  action,
  fields,
  submitLabel,
  label = "Добавить",
}: {
  title: string;
  action: (formData: FormData) => Promise<void>;
  fields: FormFieldSpec[];
  submitLabel: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        {label}
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title={title}>
        <RecordForm
          action={action}
          fields={fields}
          submitLabel={submitLabel}
          onDone={() => setOpen(false)}
        />
      </Modal>
    </>
  );
}
