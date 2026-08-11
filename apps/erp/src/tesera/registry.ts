import type { TeseraModule } from "@tesera/core";
import { moneyModule } from "./modules/money";
import { peopleModule } from "./modules/people";
import { projectsModule } from "./modules/projects";
import { directoriesModule } from "./modules/directories";

export interface NavItem {
  label: string;
  href: string;
  /** Icon key resolved to a Lucide icon in the Sidebar. */
  icon: string;
}

/**
 * Sidebar navigation. Adding a module means adding a page under app/(erp) and
 * one entry here — the shell renders the rest.
 */
export const nav: NavItem[] = [
  { label: "Панель управления", href: "/dashboard", icon: "dashboard" },
  { label: "Деньги", href: "/money", icon: "wallet" },
  { label: "Люди", href: "/people", icon: "users" },
  { label: "Проекты", href: "/projects", icon: "projects" },
  { label: "Отчёты", href: "/reports", icon: "reports" },
  { label: "Справочники", href: "/directories", icon: "book" },
  { label: "Администрирование", href: "/admin", icon: "settings" },
];

/** Core data modules booted into the engine. */
export const dataModules: TeseraModule[] = [
  moneyModule,
  peopleModule,
  projectsModule,
  directoriesModule,
];
