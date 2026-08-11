import { createTesera, ForbiddenError, type Actor } from "@tesera/core";
import { createClient, inProcess } from "@tesera/sdk";
import {
  INVENTORY_SERVICE,
  type InventoryService,
  Product,
  StockItem,
  inventoryModule,
} from "./module";

async function main(): Promise<void> {
  const app = await createTesera({ modules: [inventoryModule] });

  const admin: Actor = { id: "u1", roles: ["admin"] };
  const viewer: Actor = { id: "u2", roles: ["viewer"] };

  console.log("Tesera ERP engine — inventory demo\n");

  // 1. Permissions
  console.log("admin may create products:", app.rbac.can(admin, "create", "product"));
  console.log("viewer may create products:", app.rbac.can(viewer, "create", "product"));

  // 2. Create products via the typed SDK client (in-process transport)
  const client = createClient(inProcess(app), { actor: admin });
  const products = client.resource(Product);

  const laptop = await products.create({
    sku: "LP-14",
    name: "Loomis Laptop 14",
    price: 1499,
  });
  const license = await products.create({
    sku: "OS-PRO",
    name: "Olympus Pro license",
    price: 49,
    category: "software",
  });
  console.log(
    `\ncreated: ${laptop.name} (${laptop.category}), ${license.name} (${license.category})`,
  );

  // 3. The module auto-created stock rows in reaction to "product.created"
  const stockRows = await client.resource(StockItem).list();
  console.log(`auto-seeded stock rows: ${stockRows.length}`);

  // 4. Receive stock through the domain service
  const inventory = app.get<InventoryService>(INVENTORY_SERVICE);
  await inventory.receive(laptop.id, 25);
  await inventory.receive(laptop.id, 10, "backup");
  console.log(`on hand for ${laptop.name}: ${await inventory.onHand(laptop.id)}`);

  // 5. Permission enforcement
  try {
    app.rbac.assert({ actor: viewer }, "create", "product");
  } catch (error) {
    if (error instanceof ForbiddenError) {
      console.log(`\nviewer blocked as expected: ${error.message}`);
    } else {
      throw error;
    }
  }

  console.log("\ndone.");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
