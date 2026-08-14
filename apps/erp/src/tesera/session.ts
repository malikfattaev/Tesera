import { cookies } from "next/headers";
import type { EntityRecord } from "@tesera/core";
import { getApp } from "./engine";
import { Role, User } from "./modules/admin";

export const SESSION_COOKIE = "tesera_session";

export interface CurrentUser {
  user: EntityRecord<typeof User>;
  role: EntityRecord<typeof Role> | null;
}

/**
 * The signed-in user, resolved from the session cookie. Returns null when there
 * is no session or the account no longer exists / was disabled, so callers can
 * send the visitor to the login screen.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const userId = cookies().get(SESSION_COOKIE)?.value;
  if (!userId) return null;

  const app = await getApp();
  const user = await app.repo(User).findById(userId);
  if (!user || !user.active) return null;

  const role = await app.repo(Role).findById(user.roleId);
  return { user, role };
}
