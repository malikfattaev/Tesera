import { createTesera, type Context, type TeseraApp } from "@tesera/core";
import { dataModules } from "./registry";
import { seed } from "./seed";

// Persist the engine across dev-server hot reloads via a global.
const globalForTesera = globalThis as unknown as {
  __teseraApp_v2?: Promise<TeseraApp>;
};

/** Boot (once) and return the shared Tesera engine instance. */
export function getApp(): Promise<TeseraApp> {
  if (!globalForTesera.__teseraApp_v2) {
    globalForTesera.__teseraApp_v2 = (async () => {
      const app = await createTesera({ modules: dataModules });
      await seed(app);
      return app;
    })();
  }
  return globalForTesera.__teseraApp_v2;
}

/** Context for operations initiated from the web app (dev default: admin). */
export const WEB_CONTEXT: Context = { actor: { id: "web", roles: ["admin"] } };
