import type { TeseraModule } from "@tesera/core";
import { adminModule } from "./modules/admin";
import { financeModule } from "./modules/finance";
import { peopleModule } from "./modules/people";
import { projectsModule } from "./modules/projects";

export interface NavLink {
  label: string;
  href: string;
}

export interface NavItem {
  label: string;
  /** Icon key resolved to a Lucide icon in the Sidebar. */
  icon: string;
  /** Access section this item belongs to; roles and menu settings use it. */
  section: string;
  /** Set for a plain link; omit when the item is a group. */
  href?: string;
  /** Set for a collapsible group; omit for a plain link. */
  children?: NavLink[];
}

/**
 * Sidebar navigation. A module is either a single link or a group that expands
 * into its sections; adding one means adding a page under app/(erp) and an
 * entry here — the shell renders the rest.
 */
export const nav: NavItem[] = [
  { label: "Панель управления", href: "/dashboard", icon: "dashboard", section: "dashboard" },
  {
    label: "Администрирование",
    section: "admin",
    icon: "settings",
    children: [
      { label: "Пользователи", href: "/admin/users" },
      { label: "Роли", href: "/admin/roles" },
    ],
  },
  {
    label: "Справочники",
    section: "directories",
    icon: "book",
    children: [
      { label: "Категории расходов", href: "/directories/expense-categories" },
      { label: "Категории доходов", href: "/directories/income-categories" },
    ],
  },
  {
    label: "Финансы",
    section: "finance",
    icon: "wallet",
    children: [
      { label: "Расчётные счета", href: "/finance/accounts" },
      { label: "Операции", href: "/finance/transactions" },
    ],
  },
  {
    label: "Проекты",
    section: "projects",
    icon: "projects",
    children: [
      { label: "Проекты", href: "/projects" },
      { label: "Контрагенты", href: "/projects/counterparties" },
    ],
  },
  {
    label: "Люди",
    section: "people",
    icon: "users",
    children: [
      { label: "Сотрудники", href: "/people" },
      { label: "Должности", href: "/people/positions" },
      { label: "Отделы", href: "/people/departments" },
    ],
  },
  {
    label: "Отчёты",
    section: "reports",
    icon: "reports",
    children: [
      { label: "Движения по деньгам", href: "/reports/cashflow" },
      { label: "Зарплатные ведомости", href: "/reports/payroll" },
    ],
  },
];

/** Core data modules booted into the engine. */
export const dataModules: TeseraModule[] = [
  financeModule,
  peopleModule,
  projectsModule,
  adminModule,
];
