"use client";
import { useState } from "react";
import { Button, Field, Input } from "@tesera/ui";
import { signIn } from "@/src/tesera/auth-actions";

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      action={async (formData) => {
        const result = await signIn(formData);
        if (result && result.ok === false) setError(result.error);
      }}
      className="flex flex-col gap-4"
    >
      <Field label="Логин">
        <Input name="login" placeholder="malik" autoComplete="username" required />
      </Field>
      <Field label="Пароль">
        <Input
          type="password"
          name="password"
          placeholder="Введите пароль"
          autoComplete="current-password"
          required
        />
      </Field>

      {error && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
      )}

      <Button type="submit" className="mt-1 w-full justify-center">
        Войти
      </Button>
    </form>
  );
}
