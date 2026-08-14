"use client";
import { useState } from "react";
import Link from "next/link";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { Button, Modal } from "@tesera/ui";
import { deleteRecord, updateRecord } from "@/src/tesera/actions";
import { RecordForm, type FormFieldSpec } from "./RecordForm";

export interface DetailItem {
  label: string;
  value: string;
}

const iconButton =
  "rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700";

/**
 * View / edit / delete for one table row. Edit reuses the same field spec the
 * create form uses, so a module describes its fields once; update and delete go
 * through the generic engine actions, so no per-entity plumbing is needed.
 */
export function RowActions({
  entity,
  id,
  title,
  fields,
  details,
  viewHref,
}: {
  /** Entity name registered in the engine, e.g. "account". */
  entity: string;
  id: string;
  /** Record name, shown in dialog headers. */
  title: string;
  /** Edit-form fields, pre-filled with the row's current values. */
  fields: FormFieldSpec[];
  /** Read-only rows for the quick-view dialog. */
  details?: DetailItem[];
  /** When the record has its own page, the eye links there instead. */
  viewHref?: string;
}) {
  const [dialog, setDialog] = useState<null | "view" | "edit" | "delete">(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const close = () => {
    setDialog(null);
    setError(null);
  };

  const remove = async () => {
    setBusy(true);
    const result = await deleteRecord(entity, id);
    setBusy(false);
    if (result.ok) close();
    else setError(result.error);
  };

  return (
    // Above the row-wide link overlay some tables use.
    <div className="relative z-10 flex items-center justify-end gap-1">
      {viewHref ? (
        <Link href={viewHref} className={iconButton} title="Посмотреть">
          <Eye className="h-4 w-4" />
        </Link>
      ) : (
        details && (
          <button type="button" onClick={() => setDialog("view")} className={iconButton} title="Посмотреть">
            <Eye className="h-4 w-4" />
          </button>
        )
      )}

      <button type="button" onClick={() => setDialog("edit")} className={iconButton} title="Редактировать">
        <Pencil className="h-4 w-4" />
      </button>

      <button
        type="button"
        onClick={() => setDialog("delete")}
        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
        title="Удалить"
      >
        <Trash2 className="h-4 w-4" />
      </button>

      <Modal open={dialog === "view"} onClose={close} title={title}>
        <dl className="divide-y divide-slate-100">
          {(details ?? []).map((item) => (
            <div key={item.label} className="flex justify-between gap-6 py-2.5">
              <dt className="text-sm text-slate-500">{item.label}</dt>
              <dd className="text-right text-sm font-medium text-ink">{item.value}</dd>
            </div>
          ))}
        </dl>
      </Modal>

      <Modal open={dialog === "edit"} onClose={close} title={`Редактирование: ${title}`}>
        <RecordForm
          action={updateRecord.bind(null, entity, id)}
          fields={fields}
          submitLabel="Сохранить"
          onDone={close}
        />
      </Modal>

      <Modal open={dialog === "delete"} onClose={close} title="Удалить запись?">
        <p className="text-sm text-slate-600">
          Запись <span className="font-medium text-ink">{title}</span> будет удалена без
          возможности восстановления.
        </p>
        {error && (
          <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
        )}
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={close} disabled={busy}>
            Отмена
          </Button>
          <Button variant="danger" onClick={remove} disabled={busy}>
            {busy ? "Удаление..." : "Удалить"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
