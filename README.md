# Tesera

**Tesera** is a code-first TypeScript **engine and SDK for building ERP systems**.
It is the foundation the Tesera ERP product is built on: you describe your
domain in typed TypeScript and get validated data access, domain events,
role-based access control and a module system out of the box, with no runtime
magic and no code generation step.

- **`@tesera/core`** — the engine: entities, the field DSL, typed repositories,
  a persistence-agnostic data layer, a domain event bus, RBAC and the kernel.
- **`@tesera/sdk`** — a typed client with pluggable transports (in-process or
  HTTP), so the same API works in a monolith or against a remote Tesera server.

> Engine vs SDK: the **engine** is the core you build an ERP *on*; the **SDK**
> is the thin, typed client integrators and frontends talk *to* it with.

## Quick start

```bash
cd Tesera
pnpm install
pnpm demo        # run the inventory example
pnpm test        # run the core test suite
pnpm typecheck   # type-check the whole workspace
```

## Concepts

### Entities & the field DSL

Fields are declared once and drive validation, TypeScript types and (later)
generated APIs. Each field wraps a [zod](https://zod.dev) schema plus metadata.

```ts
import { defineEntity, t } from "@tesera/core";

export const Product = defineEntity({
  name: "product",
  fields: {
    sku: t.string().unique(),
    name: t.string(),
    price: t.number(),
    category: t.enum(["hardware", "software", "service"]).default("hardware"),
    active: t.boolean().default(true),
  },
});
```

`EntityInput<typeof Product>` (what `create` accepts) and
`EntityRecord<typeof Product>` (a stored row, with `id/createdAt/updatedAt`) are
inferred automatically.

### Repositories

Typed CRUD over any adapter. Repositories validate input, stamp system fields
and emit domain events after every write.

```ts
const repo = app.repo(Product);
const product = await repo.create({ sku: "LP-14", name: "Laptop 14", price: 1499 });
await repo.update(product.id, { price: 1399 });
const cheap = await repo.list({ where: { active: true } });
```

### Data adapters

The engine ships an `InMemoryAdapter` so apps boot with **no database**. Swap in
another store by implementing the `DataAdapter` interface — adapters only move
rows; validation, events and permissions live above them.

> **Roadmap:** a Prisma/Postgres adapter is the next milestone (see below).

### Domain events

An async, in-process event bus. Repositories emit `<entity>.created|updated|deleted`;
modules react to wire cross-entity behaviour.

```ts
app.events.on("product.created", async (event) => {
  await app.repo(StockItem).create({ productId: event.data.id, quantity: 0 });
});
```

### RBAC

Explicit role-based access control with `*` wildcards. The engine never checks
permissions implicitly — services call `rbac.can(...)` / `rbac.assert(...)`.

```ts
app.rbac.assert({ actor }, "create", "product"); // throws ForbiddenError if denied
```

### Modules & the kernel

A module bundles a slice of the domain (entities, roles, wiring). `createTesera`
boots modules in dependency order and hands out typed repositories and services.

```ts
import { createTesera } from "@tesera/core";
import { inventoryModule } from "./inventory";

const app = await createTesera({ modules: [inventoryModule] });
```

### SDK client

The same typed client, two transports:

```ts
import { createClient, inProcess, http } from "@tesera/sdk";

const local = createClient(inProcess(app), { actor });      // monolith / SSR
const remote = createClient(http({ baseUrl: "https://erp.tesera.dev/api" }));

const products = local.resource(Product);
await products.create({ sku: "LP-14", name: "Laptop 14", price: 1499 });
```

## Layout

```
Tesera/
  packages/
    core/     @tesera/core — the engine
    sdk/      @tesera/sdk  — typed client + transports
  examples/
    inventory/  a runnable module: products, stock, events, roles
```

## Roadmap

- **Prisma/Postgres adapter** — production persistence behind the same `DataAdapter`.
- **HTTP server** — expose modules over the REST convention the SDK's `http`
  transport already speaks; generated from entity metadata.
- **Workflows / state machines** — declarative status transitions with guards.
- **Audit log & soft-delete** — first-class, driven by the event bus.
- **Field-level permissions & multi-tenancy** — scoped via the request context.

## Design principles

1. **Code-first, typed end to end.** Definitions are TypeScript; types are
   inferred, never generated.
2. **Thin adapters, rich core.** Storage is swappable; business rules are not
   coupled to it.
3. **Explicit over implicit.** Permissions and side effects are visible in code.
4. **Composable modules.** An ERP is assembled from independent domain modules.
