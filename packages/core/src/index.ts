/**
 * @tesera/core — the Tesera ERP engine.
 *
 * Code-first, strongly-typed building blocks for ERP systems: entities and a
 * field DSL, a persistence-agnostic data layer with typed repositories, an
 * async domain event bus, role-based access control, and a module/kernel
 * that wires it all together.
 */

// Entity definition & field DSL
export * from "./entity/index";

// Data layer
export * from "./data/adapter";
export * from "./data/in-memory";
export * from "./data/repository";

// Domain events
export * from "./events/bus";

// Access control
export * from "./rbac/rbac";

// Request context
export * from "./context/context";

// Kernel
export * from "./kernel/module";
export * from "./kernel/app";

// Errors
export * from "./errors";
