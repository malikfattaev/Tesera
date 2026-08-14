"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "./action-result";
import { getApp, WEB_CONTEXT } from "./engine";
import { User } from "./modules/admin";
import { hashPassword, verifyPassword } from "./password";
import { SESSION_COOKIE, getCurrentUser } from "./session";

const SESSION_DAYS = 7;

/** Sign in with the login and password created in Администрирование. */
export async function signIn(formData: FormData): Promise<ActionResult> {
  const login = String(formData.get("login") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const app = await getApp();
  const user = (await app.repo(User).list()).find((u) => u.login === login);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return { ok: false, error: "Неверный логин или пароль." };
  }
  if (!user.active) {
    return { ok: false, error: "Учётная запись отключена." };
  }

  cookies().set(SESSION_COOKIE, user.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
  redirect("/dashboard");
}

/** Sign out and return to the login screen. */
export async function signOut(): Promise<void> {
  cookies().delete(SESSION_COOKIE);
  redirect("/login");
}

/** Update the signed-in user's own name, login and (optionally) password. */
export async function updateProfile(formData: FormData): Promise<ActionResult> {
  const current = await getCurrentUser();
  if (!current) return { ok: false, error: "Сессия истекла, войдите заново." };

  const app = await getApp();
  const login = String(formData.get("login") ?? "").trim();
  const fullName = String(formData.get("fullName") ?? "").trim();
  const password = String(formData.get("password") ?? "").trim();

  if (!fullName) return { ok: false, error: "Укажите имя." };
  if (!login) return { ok: false, error: "Укажите логин." };

  const taken = (await app.repo(User).list()).some(
    (u) => u.login === login && u.id !== current.user.id,
  );
  if (taken) return { ok: false, error: `Логин «${login}» уже занят.` };
  if (password && password.length < 6) {
    return { ok: false, error: "Пароль должен быть не короче 6 символов." };
  }

  await app.repo(User).update(
    current.user.id,
    {
      fullName,
      login,
      ...(password ? { passwordHash: hashPassword(password) } : {}),
    },
    WEB_CONTEXT,
  );
  revalidatePath("/", "layout");
  return { ok: true };
}

/**
 * Save which sections the user wants in their own menu. The form submits the
 * visible ones; everything else the role allows is stored as hidden.
 */
export async function updateMenuVisibility(formData: FormData): Promise<ActionResult> {
  const current = await getCurrentUser();
  if (!current) return { ok: false, error: "Сессия истекла, войдите заново." };

  const allowed = current.role?.sections ?? [];
  const visible = formData.getAll("sections").map(String);
  const hidden = allowed.filter((section) => !visible.includes(section));

  const app = await getApp();
  await app.repo(User).update(
    current.user.id,
    { hiddenSections: hidden as never },
    WEB_CONTEXT,
  );
  revalidatePath("/", "layout");
  return { ok: true };
}
