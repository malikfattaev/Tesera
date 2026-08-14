"use client";
import { useState } from "react";
import { Check, LogOut } from "lucide-react";
import { Button, Field, Input, cn } from "@tesera/ui";
import { signOut, updateMenuVisibility, updateProfile } from "@/src/tesera/auth-actions";

/** Small shared state: submit, then confirm inline for a moment. */
function useSaveState() {
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const run = async (action: () => Promise<{ ok: boolean; error?: string }>) => {
    const result = await action();
    if (!result.ok) {
      setError(result.error ?? "Не удалось сохранить.");
      setSaved(false);
      return;
    }
    setError(null);
    setSaved(true);
  };
  return { error, saved, run, reset: () => setSaved(false) };
}

export function ProfileForm({
  fullName,
  login,
}: {
  fullName: string;
  login: string;
}) {
  const { error, saved, run, reset } = useSaveState();

  return (
    <form
      action={async (formData) => run(() => updateProfile(formData))}
      onChange={reset}
      className="grid gap-4 sm:grid-cols-2"
    >
      <Field label="Имя">
        <Input name="fullName" defaultValue={fullName} required />
      </Field>
      <Field label="Логин">
        <Input name="login" defaultValue={login} required />
      </Field>
      <Field
        label="Новый пароль"
        hint="Заполните, только если хотите сменить пароль"
        className="sm:col-span-2"
      >
        <Input type="password" name="password" placeholder="Минимум 6 символов" />
      </Field>

      {error && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 sm:col-span-2">
          {error}
        </p>
      )}

      <div className="flex items-center justify-end gap-3 sm:col-span-2">
        {saved && (
          <span className="flex items-center gap-1.5 text-sm text-emerald-600">
            <Check className="h-4 w-4" />
            Сохранено
          </span>
        )}
        <Button type="submit">Сохранить</Button>
      </div>
    </form>
  );
}

export function MenuSettingsForm({
  sections,
  hidden,
}: {
  /** Sections the role allows, with labels. */
  sections: { key: string; label: string }[];
  hidden: string[];
}) {
  const { error, saved, run, reset } = useSaveState();

  return (
    <form
      action={async (formData) => run(() => updateMenuVisibility(formData))}
      onChange={reset}
    >
      <div className="grid gap-2 sm:grid-cols-2">
        {sections.map((section) => {
          const visible = !hidden.includes(section.key);
          return (
            <label
              key={section.key}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition",
                visible
                  ? "border-brand-200 bg-brand-50/60 text-ink"
                  : "border-slate-200 bg-white text-slate-500",
              )}
            >
              <input
                type="checkbox"
                name="sections"
                value={section.key}
                defaultChecked={visible}
                className="h-4 w-4 rounded border-slate-300 text-[#7c3aed] focus:ring-[#7c3aed]"
              />
              {section.label}
            </label>
          );
        })}
      </div>

      {error && (
        <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
      )}

      <div className="mt-4 flex items-center justify-end gap-3">
        {saved && (
          <span className="flex items-center gap-1.5 text-sm text-emerald-600">
            <Check className="h-4 w-4" />
            Сохранено
          </span>
        )}
        <Button type="submit">Сохранить меню</Button>
      </div>
    </form>
  );
}

export function SignOutButton() {
  return (
    <form action={signOut}>
      <Button type="submit" variant="outline">
        <LogOut className="h-4 w-4" />
        Выйти из аккаунта
      </Button>
    </form>
  );
}
