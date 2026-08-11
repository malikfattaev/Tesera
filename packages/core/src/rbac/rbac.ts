import type { Actor, Context } from "../context/context";
import { ForbiddenError } from "../errors";

export type Action = "create" | "read" | "update" | "delete" | (string & {});

export interface Permission {
  /** Entity/resource name, or "*" for any. */
  resource: string;
  /** Action name, or "*" for any. */
  action: Action;
}

export interface Role {
  name: string;
  description?: string;
  permissions: Permission[];
}

/**
 * Minimal, explicit role-based access control. Roles hold permissions; a
 * permission matches a resource + action, with "*" as a wildcard for either.
 * Services call {@link Rbac.assert} / {@link Rbac.can} with the request
 * context's actor — the engine never checks permissions implicitly, so access
 * rules live where the domain logic can see them.
 */
export class Rbac {
  private readonly roles = new Map<string, Role>();

  define(role: Role): this {
    this.roles.set(role.name, role);
    return this;
  }

  getRole(name: string): Role | undefined {
    return this.roles.get(name);
  }

  listRoles(): Role[] {
    return [...this.roles.values()];
  }

  /** Whether any of the actor's roles grants `action` on `resource`. */
  can(actor: Actor | undefined, action: Action, resource: string): boolean {
    if (!actor) return false;
    for (const roleName of actor.roles) {
      const role = this.roles.get(roleName);
      if (!role) continue;
      for (const permission of role.permissions) {
        const resourceOk =
          permission.resource === "*" || permission.resource === resource;
        const actionOk = permission.action === "*" || permission.action === action;
        if (resourceOk && actionOk) return true;
      }
    }
    return false;
  }

  /** Throw {@link ForbiddenError} unless the context's actor is permitted. */
  assert(
    context: Context | undefined,
    action: Action,
    resource: string,
  ): void {
    if (!this.can(context?.actor, action, resource)) {
      throw new ForbiddenError(action, resource);
    }
  }
}
