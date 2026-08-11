/**
 * @tesera/sdk — a typed client for the Tesera engine.
 *
 * The same `TeseraClient` API works whether the engine runs in the same
 * process (monolith / SSR) or behind HTTP (a separate API service). Pick a
 * transport, wrap your entity models, and get fully-typed CRUD.
 */
import type {
  Context,
  EntityInput,
  EntityModel,
  EntityRecord,
  ListOptions,
  TeseraApp,
} from "@tesera/core";

/**
 * Abstracts *how* a resource operation reaches the engine. Implementations are
 * intentionally untyped (`unknown`) — the typed surface lives in
 * {@link Resource}, which binds an entity model to a transport.
 */
export interface Transport {
  create(entity: string, input: unknown, context?: Context): Promise<unknown>;
  findById(entity: string, id: string, context?: Context): Promise<unknown>;
  list(entity: string, options?: ListOptions, context?: Context): Promise<unknown[]>;
  update(entity: string, id: string, patch: unknown, context?: Context): Promise<unknown>;
  delete(entity: string, id: string, context?: Context): Promise<void>;
}

/**
 * In-process transport: calls the engine's repositories directly. Use it for a
 * monolith or server-rendered app where the engine and UI share a process.
 */
export function inProcess(app: TeseraApp): Transport {
  const models = new Map(app.listEntities().map((model) => [model.name, model]));
  const modelFor = (entity: string): EntityModel => {
    const model = models.get(entity);
    if (!model) throw new Error(`Unknown entity "${entity}"`);
    return model;
  };
  return {
    create: (entity, input, ctx) => app.repo(modelFor(entity)).create(input as never, ctx),
    findById: (entity, id, ctx) => app.repo(modelFor(entity)).findById(id, ctx),
    list: (entity, options, ctx) => app.repo(modelFor(entity)).list(options, ctx),
    update: (entity, id, patch, ctx) => app.repo(modelFor(entity)).update(id, patch as never, ctx),
    delete: (entity, id, ctx) => app.repo(modelFor(entity)).delete(id, ctx),
  };
}

export interface HttpTransportOptions {
  baseUrl: string;
  /** Custom fetch implementation (defaults to global `fetch`). */
  fetch?: typeof fetch;
  /** Extra headers, e.g. an Authorization bearer token. */
  headers?: Record<string, string>;
}

/**
 * HTTP transport following a simple REST convention:
 *
 * ```
 * POST   /:entity           create
 * GET    /:entity/:id       findById
 * POST   /:entity/query     list (filter/paging in the body)
 * PATCH  /:entity/:id       update
 * DELETE /:entity/:id       delete
 * ```
 *
 * Point it at a Tesera HTTP server (on the roadmap) or any compatible API.
 */
export function http(options: HttpTransportOptions): Transport {
  const doFetch = options.fetch ?? fetch;
  const base = options.baseUrl.replace(/\/$/, "");
  const headers = { "content-type": "application/json", ...options.headers };

  const request = async (
    method: string,
    path: string,
    body?: unknown,
  ): Promise<unknown> => {
    const response = await doFetch(`${base}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => response.statusText);
      throw new Error(
        `Tesera HTTP ${method} ${path} failed (${response.status}): ${detail}`,
      );
    }
    if (response.status === 204) return undefined;
    return response.json();
  };

  const id = (value: string) => encodeURIComponent(value);
  return {
    create: (entity, input) => request("POST", `/${entity}`, input),
    findById: (entity, key) => request("GET", `/${entity}/${id(key)}`),
    list: (entity, opts) => request("POST", `/${entity}/query`, opts ?? {}) as Promise<unknown[]>,
    update: (entity, key, patch) => request("PATCH", `/${entity}/${id(key)}`, patch),
    delete: async (entity, key) => {
      await request("DELETE", `/${entity}/${id(key)}`);
    },
  };
}

/** A typed resource handle bound to one entity model + transport (+ context). */
export class Resource<E extends EntityModel> {
  constructor(
    private readonly model: E,
    private readonly transport: Transport,
    private readonly context?: Context,
  ) {}

  create(input: EntityInput<E>): Promise<EntityRecord<E>> {
    return this.transport.create(this.model.name, input, this.context) as Promise<EntityRecord<E>>;
  }
  findById(id: string): Promise<EntityRecord<E> | null> {
    return this.transport.findById(this.model.name, id, this.context) as Promise<EntityRecord<E> | null>;
  }
  list(options?: ListOptions): Promise<EntityRecord<E>[]> {
    return this.transport.list(this.model.name, options, this.context) as Promise<EntityRecord<E>[]>;
  }
  update(id: string, patch: Partial<EntityInput<E>>): Promise<EntityRecord<E>> {
    return this.transport.update(this.model.name, id, patch, this.context) as Promise<EntityRecord<E>>;
  }
  delete(id: string): Promise<void> {
    return this.transport.delete(this.model.name, id, this.context);
  }
}

export interface TeseraClient {
  /** A typed handle for an entity model. */
  resource<E extends EntityModel>(model: E): Resource<E>;
  /** A client scoped to a context (actor, tenant, ...). */
  withContext(context: Context): TeseraClient;
}

/** Create a typed client over any transport. */
export function createClient(transport: Transport, context?: Context): TeseraClient {
  return {
    resource: (model) => new Resource(model, transport, context),
    withContext: (ctx) => createClient(transport, ctx),
  };
}
