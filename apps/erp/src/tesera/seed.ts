import type { Context, TeseraApp } from "@tesera/core";
import { Account, Category, Transaction } from "./modules/finance";
import { Department, Employee, Position } from "./modules/people";
import { Counterparty, Project } from "./modules/projects";

const SYS: Context = { actor: { id: "seed", roles: ["admin"] } };

/** Populate the engine with demo data on first boot (idempotent). */
export async function seed(app: TeseraApp): Promise<void> {
  if ((await app.repo(Account).count()) > 0) return;

  // --- Финансы ---
  const cat = (name: string, direction: "in" | "out") =>
    app.repo(Category).create({ name, direction }, SYS);

  const sales = await cat("Продажи", "in");
  const salary = await cat("ФОТ (зарплата)", "out");
  const office = await cat("Офисные расходы", "out");
  await cat("Налоги", "out");
  await cat("Прочее", "out");

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
    categoryId: string,
    accountId: string,
    counterparty: string,
  ) =>
    app
      .repo(Transaction)
      .create(
        { date: new Date(date), direction, amount, categoryId, accountId, counterparty },
        SYS,
      );

  await tx("2026-03-10", "out", 9_000_000, salary.id, main.id, "Зарплаты март");
  await tx("2026-08-05", "in", 10_000_000, sales.id, main.id, "Оплата от клиента");
  await tx("2026-08-07", "out", 4_994_000, office.id, main.id, "Аренда офиса");
  await tx("2026-08-09", "out", 3_000, office.id, cash.id, "Канцелярия");
  await tx("2026-08-11", "out", 3_000, office.id, cash.id, "Кофе в офис");

  // --- Люди ---
  const dep = (name: string, head?: string) =>
    app.repo(Department).create({ name, head }, SYS);

  const management = await dep("Руководство", "Азиз Каримов");
  const engineering = await dep("Разработка", "Тимур Рахимов");
  const salesDep = await dep("Продажи", "Дилноза Юсупова");
  await dep("Финансы");

  const pos = (name: string, departmentId: string) =>
    app.repo(Position).create({ name, departmentId }, SYS);

  const ceo = await pos("CEO", management.id);
  const founder = await pos("Основатель", management.id);
  const headOfSales = await pos("Head of Sales", salesDep.id);
  const seniorEngineer = await pos("Senior Engineer", engineering.id);

  const emp = (
    fullName: string,
    positionId: string,
    departmentId: string,
    email: string,
    salaryAmount: number,
    hiredAt: string,
  ) =>
    app
      .repo(Employee)
      .create(
        { fullName, positionId, departmentId, email, salary: salaryAmount, hiredAt: new Date(hiredAt) },
        SYS,
      );

  await emp("Азиз Каримов", ceo.id, management.id, "aziz@tesera.dev", 20_000_000, "2025-01-15");
  await emp("Малик Фаттаев", founder.id, management.id, "malik@tesera.dev", 20_000_000, "2025-01-15");
  await emp("Дилноза Юсупова", headOfSales.id, salesDep.id, "dilnoza@tesera.dev", 12_000_000, "2025-03-01");
  await emp("Тимур Рахимов", seniorEngineer.id, engineering.id, "timur@tesera.dev", 15_000_000, "2025-04-20");

  // --- Проекты ---
  const cp = (
    name: string,
    kind: "client" | "supplier" | "partner",
    phone: string,
    email: string,
  ) => app.repo(Counterparty).create({ name, kind, phone, email }, SYS);

  const romashka = await cp("ООО Ромашка", "client", "+998 90 123 45 67", "hello@romashka.uz");
  await cp("Hosting Provider", "supplier", "+998 71 200 00 00", "billing@host.uz");
  const school = await cp("Школа №42", "client", "+998 90 555 44 33", "info@school42.uz");

  const proj = (
    name: string,
    counterpartyId: string | undefined,
    status: "planning" | "active" | "on_hold" | "done",
    budget: number,
    lead: string,
    deadline: string,
  ) =>
    app
      .repo(Project)
      .create({ name, counterpartyId, status, budget, lead, deadline: new Date(deadline) }, SYS);

  await proj("Портал Olympus", school.id, "active", 120_000_000, "Тимур Рахимов", "2026-10-01");
  await proj("CRM Klio для клиента", romashka.id, "planning", 45_000_000, "Дилноза Юсупова", "2026-09-15");
  await proj("Сайт Loomis", undefined, "done", 15_000_000, "Малик Фаттаев", "2026-06-01");
}
