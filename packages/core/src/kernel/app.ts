import type { DataAdapter } from "../data/adapter";
import { InMemoryAdapter } from "../data/in-memory";
import { Repository } from "../data/repository";
import type { EntityModel } from "../entity/entity";
import { EventBus } from "../events/bus";
import { Rbac } from "../rbac/rbac";
import type { TeseraModule } from "./module";

export interface CreateAppOptions {
  /** Persistence adapter. Defaults to an in-memory store. */
  adapter?: DataAdapter;
  /** Modules to load. Boot order is resolved from `dependsOn`. */
  modules?: TeseraModule[];
}

/**
 * The Tesera application: the composition root that wires the adapter, event
 * bus, RBAC registry and modules together, and hands out typed repositories
 * and services. Create one per process (or per tenant) via {@link createTesera}.
 */
export class TeseraApp {
  readonly events = new EventBus();
  readonly rbac = new Rbac();
  readonly adapter: DataAdapter;

  private readonly entities = new Map<string, EntityModel>();
  private readonly repositories = new Map<string, Repository<EntityModel>>();
  private readonly services = new Map<string | symbol, unknown>();
  private readonly modules: TeseraModule[];
  private booted = false;

  constructor(options: CreateAppOptions = {}) {
    this.adapter = options.adapter ?? new InMemoryAdapter();
    this.modules = options.modules ?? [];
  }

  /** Register an entity so a repository can be resolved for it. */
  registerEntity(model: EntityModel): void {
    this.entities.set(model.name, model);
  }

  /** Resolve (and cache) the typed repository for an entity model. */
  repo<E extends EntityModel>(model: E): Repository<E> {
    let repo = this.repositories.get(model.name);
    if (!repo) {
      if (!this.entities.has(model.name)) this.registerEntity(model);
      repo = new Repository(model, this.adapter, this.events);
      this.repositories.set(model.name, repo);
    }
    return repo as Repository<E>;
  }

  /** Register a service instance under a token (string or symbol). */
  provide<T>(token: string | symbol, value: T): T {
    this.services.set(token, value);
    return value;
  }

  /** Resolve a previously provided service; throws if it was never provided. */
  get<T>(token: string | symbol): T {
    if (!this.services.has(token)) {
      throw new Error(`Service "${String(token)}" was not provided`);
    }
    return this.services.get(token) as T;
  }

  /** Whether a service token is registered. */
  has(token: string | symbol): boolean {
    return this.services.has(token);
  }

  /** All registered entity models. */
  listEntities(): EntityModel[] {
    return [...this.entities.values()];
  }

  /** Boot all modules: register entities/roles, then run setup hooks in order. */
  async boot(): Promise<void> {
    if (this.booted) return;

    const ordered = orderModules(this.modules);
    for (const module of ordered) {
      for (const entity of module.entities ?? []) this.registerEntity(entity);
      for (const role of module.roles ?? []) this.rbac.define(role);
    }
    for (const module of ordered) {
      await module.setup?.(this);
    }

    this.booted = true;
  }
}

/** Topologically order modules by `dependsOn`, detecting missing deps & cycles. */
function orderModules(modules: TeseraModule[]): TeseraModule[] {
  const byName = new Map(modules.map((m) => [m.name, m]));
  const ordered: TeseraModule[] = [];
  const state = new Map<string, "visiting" | "done">();

  const visit = (module: TeseraModule): void => {
    const current = state.get(module.name);
    if (current === "done") return;
    if (current === "visiting") {
      throw new Error(`Circular module dependency involving "${module.name}"`);
    }
    state.set(module.name, "visiting");
    for (const dep of module.dependsOn ?? []) {
      const depModule = byName.get(dep);
      if (!depModule) {
        throw new Error(
          `Module "${module.name}" depends on missing module "${dep}"`,
        );
      }
      visit(depModule);
    }
    state.set(module.name, "done");
    ordered.push(module);
  };

  for (const module of modules) visit(module);
  return ordered;
}

/** Create and boot a Tesera application in one call. */
export async function createTesera(
  options: CreateAppOptions = {},
): Promise<TeseraApp> {
  const app = new TeseraApp(options);
  await app.boot();
  return app;
}
