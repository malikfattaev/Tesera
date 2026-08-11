/** The authenticated principal performing an operation. */
export interface Actor {
  id: string;
  /** Role names consumed by the RBAC layer. */
  roles: string[];
  /** Free-form attributes (tenant, locale, ...). */
  [attribute: string]: unknown;
}

/**
 * Request-scoped context threaded through services and repositories. Carries
 * the actor (for permission checks and auditing) plus an arbitrary bag for
 * cross-cutting data (tenant id, correlation id, a transaction handle, ...).
 */
export interface Context {
  actor?: Actor;
  data?: Record<string, unknown>;
}

/** A context with no actor — use for system / bootstrap operations. */
export const SYSTEM_CONTEXT: Context = { data: { system: true } };
