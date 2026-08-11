import type { EntityModel } from "../entity/entity";
import type { Role } from "../rbac/rbac";
import type { TeseraApp } from "./app";

/**
 * A Tesera module bundles one slice of the ERP domain: its entities, roles and
 * wiring. `setup` runs once at boot with the live {@link TeseraApp}, so a
 * module can register services, subscribe to events and seed data. Modules are
 * plain objects — compose, reuse and test them however you like.
 */
export interface TeseraModule {
  name: string;
  description?: string;
  /** Entities this module contributes. */
  entities?: EntityModel[];
  /** Roles this module contributes to the RBAC registry. */
  roles?: Role[];
  /** Names of modules that must boot before this one. */
  dependsOn?: string[];
  /** Wiring hook: register services, subscribe to events, seed data. */
  setup?: (app: TeseraApp) => void | Promise<void>;
}

/** Identity helper for type inference and readable definitions. */
export function defineModule(module: TeseraModule): TeseraModule {
  return module;
}
