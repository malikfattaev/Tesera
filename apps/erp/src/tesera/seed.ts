import type { Context, TeseraApp } from "@tesera/core";
import { Account, Transaction } from "./modules/money";
import { Employee } from "./modules/people";
import { Project } from "./modules/projects";
import { Counterparty } from "./modules/directories";

const SYS: Context = { actor: { id: "seed", roles: ["admin"] } };

/** Populate the engine with demo data on first boot (idempotent). */
export async function seed(app: TeseraApp): Promise<void> {
  if ((await app.repo(Account).count()) > 0) return;

  const main = await app
    .repo(Account)
    .create({ name: "Основной счёт", kind: "bank", currency: "UZS" }, SYS);
  const cash = await app
    .repo(Account)
    .create({ name: "Касса", kind: "cash", currency: "UZS" }, SYS);

  const tx = (
    date: string,
    direction: "in" | "out",
    amount: number,
    category: "sales" | "salary" | "office" | "tax" | "other",
    accountId: string,
    counterparty: string,
  ) =>
    app
      .repo(Transaction)
      .create(
        { date: new Date(date), direction, amount, category, accountId, counterparty },
        SYS,
      );

  // Март — ФОТ
  await tx("2026-03-10", "out", 9_000_000, "salary", main.id, "Зарплаты март");
  // Август — приход и офисные расходы
  await tx("2026-08-05", "in", 10_000_000, "sales", main.id, "Оплата от клиента");
  await tx("2026-08-07", "out", 4_994_000, "office", main.id, "Аренда офиса");
  await tx("2026-08-09", "out", 3_000, "office", cash.id, "Канцелярия");
  await tx("2026-08-11", "out", 3_000, "office", cash.id, "Кофе в офис");

  const emp = (
    fullName: string,
    position: string,
    department: "management" | "engineering" | "sales" | "finance" | "operations",
    email: string,
    salary: number,
    hiredAt: string,
  ) =>
    app
      .repo(Employee)
      .create(
        { fullName, position, department, email, salary, hiredAt: new Date(hiredAt) },
        SYS,
      );

  await emp("Азиз Каримов", "CEO", "management", "aziz@tesera.dev", 20_000_000, "2025-01-15");
  await emp("Малик Фаттаев", "Основатель", "management", "malik@tesera.dev", 20_000_000, "2025-01-15");
  await emp("Дилноза Юсупова", "Head of Sales", "sales", "dilnoza@tesera.dev", 12_000_000, "2025-03-01");
  await emp("Тимур Рахимов", "Senior Engineer", "engineering", "timur@tesera.dev", 15_000_000, "2025-04-20");

  const proj = (
    name: string,
    client: string,
    status: "planning" | "active" | "on_hold" | "done",
    budget: number,
    lead: string,
    deadline: string,
  ) =>
    app
      .repo(Project)
      .create({ name, client, status, budget, lead, deadline: new Date(deadline) }, SYS);

  await proj("Портал Olympus", "Школа №42", "active", 120_000_000, "Тимур Рахимов", "2026-10-01");
  await proj("CRM Klio для клиента", "ООО Ромашка", "planning", 45_000_000, "Дилноза Юсупова", "2026-09-15");
  await proj("Сайт Loomis", "Внутренний", "done", 15_000_000, "Малик Фаттаев", "2026-06-01");

  const cp = (
    name: string,
    kind: "client" | "supplier" | "partner",
    phone: string,
    email: string,
  ) => app.repo(Counterparty).create({ name, kind, phone, email }, SYS);

  await cp("ООО Ромашка", "client", "+998 90 123 45 67", "hello@romashka.uz");
  await cp("Hosting Provider", "supplier", "+998 71 200 00 00", "billing@host.uz");
  await cp("Школа №42", "client", "+998 90 555 44 33", "info@school42.uz");
}
