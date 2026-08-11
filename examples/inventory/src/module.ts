import {
  defineEntity,
  defineModule,
  t,
  type EntityRecord,
  type TeseraApp,
} from "@tesera/core";

/** A product in the catalog. */
export const Product = defineEntity({
  name: "product",
  label: "Product",
  fields: {
    sku: t.string().unique().label("SKU"),
    name: t.string().label("Name"),
    price: t.number().label("Price"),
    category: t.enum(["hardware", "software", "service"]).default("hardware"),
    active: t.boolean().default(true),
  },
});

/** Stock held for a product in a given warehouse. */
export const StockItem = defineEntity({
  name: "stock_item",
  label: "Stock item",
  fields: {
    productId: t.relation("product").label("Product"),
    warehouse: t.string().default("main"),
    quantity: t.int().default(0),
  },
});

export const INVENTORY_SERVICE = "inventory.service";

/** Business logic for the inventory domain. */
export class InventoryService {
  constructor(private readonly app: TeseraApp) {}

  /** Ensure a product has a stock row in `warehouse`, then add `quantity`. */
  async receive(
    productId: string,
    quantity: number,
    warehouse = "main",
  ): Promise<EntityRecord<typeof StockItem>> {
    const repo = this.app.repo(StockItem);
    let stock = await repo.findOne({ productId, warehouse });
    if (!stock) {
      stock = await repo.create({ productId, warehouse, quantity: 0 });
    }
    const updated = await repo.update(stock.id, {
      quantity: stock.quantity + quantity,
    });
    await this.app.events.emit({
      type: "stock.received",
      entity: StockItem.name,
      data: { productId, warehouse, quantity, stockId: updated.id },
      at: new Date(),
    });
    return updated;
  }

  /** Total quantity on hand for a product across all warehouses. */
  async onHand(productId: string): Promise<number> {
    const rows = await this.app.repo(StockItem).list({ where: { productId } });
    return rows.reduce((sum, row) => sum + row.quantity, 0);
  }
}

/**
 * The inventory module: products + stock, three roles, and a rule that every
 * new product automatically gets a zero-quantity stock row in the main
 * warehouse — a small demonstration of cross-entity reactions via the event
 * bus and of registering a domain service on the app.
 */
export const inventoryModule = defineModule({
  name: "inventory",
  description: "Products and stock management",
  entities: [Product, StockItem],
  roles: [
    { name: "admin", permissions: [{ resource: "*", action: "*" }] },
    {
      name: "manager",
      permissions: [
        { resource: "product", action: "*" },
        { resource: "stock_item", action: "*" },
      ],
    },
    {
      name: "viewer",
      permissions: [
        { resource: "product", action: "read" },
        { resource: "stock_item", action: "read" },
      ],
    },
  ],
  setup(app) {
    app.provide(INVENTORY_SERVICE, new InventoryService(app));

    // When a product is created, seed a main-warehouse stock row for it.
    app.events.on<EntityRecord<typeof Product>>(
      "product.created",
      async (event) => {
        const exists = await app
          .repo(StockItem)
          .findOne({ productId: event.data.id, warehouse: "main" });
        if (!exists) {
          await app
            .repo(StockItem)
            .create({ productId: event.data.id, warehouse: "main", quantity: 0 });
        }
      },
    );
  },
});
