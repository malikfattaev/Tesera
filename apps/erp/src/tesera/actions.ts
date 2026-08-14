"use server";
import { revalidatePath } from "next/cache";
import { getApp, WEB_CONTEXT } from "./engine";
import { Account, Category, Transaction } from "./modules/finance";
import { Department, Employee, Position } from "./modules/people";
import { Counterparty, Project } from "./modules/projects";

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function optionalText(formData: FormData, key: string): string | undefined {
  const value = text(formData, key);
  return value.length ? value : undefined;
}

function date(formData: FormData, key: string): Date | undefined {
  const value = text(formData, key);
  return value ? new Date(value) : undefined;
}

// --- Финансы ---

export async function createCategory(formData: FormData): Promise<void> {
  const app = await getApp();
  await app.repo(Category).create(
    {
      name: text(formData, "name"),
      direction: (text(formData, "direction") || "out") as "in" | "out",
      note: optionalText(formData, "note"),
    },
    WEB_CONTEXT,
  );
  revalidatePath("/finance/categories");
}

export async function createAccount(formData: FormData): Promise<void> {
  const app = await getApp();
  await app.repo(Account).create(
    {
      name: text(formData, "name"),
      kind: (text(formData, "kind") || "bank") as "cash" | "bank" | "card",
      currency: (text(formData, "currency") || "UZS") as "UZS" | "USD" | "EUR",
    },
    WEB_CONTEXT,
  );
  revalidatePath("/finance/accounts");
}

/** Paths whose numbers depend on transactions. */
function revalidateMoney(): void {
  revalidatePath("/finance/transactions/expenses");
  revalidatePath("/finance/transactions/income");
  revalidatePath("/finance/transactions/transfers");
  revalidatePath("/finance/accounts");
  revalidatePath("/reports/cashflow");
  revalidatePath("/dashboard");
}

/** Расход: money leaves an account. Expenses carry no counterparty. */
export async function createExpense(formData: FormData): Promise<void> {
  const app = await getApp();
  await app.repo(Transaction).create(
    {
      date: date(formData, "date") ?? new Date(),
      direction: "out",
      amount: Number(formData.get("amount") ?? 0),
      categoryId: text(formData, "categoryId"),
      accountId: text(formData, "accountId"),
      note: optionalText(formData, "note"),
    },
    WEB_CONTEXT,
  );
  revalidateMoney();
}

/** Доход: money arrives, optionally attributed to a counterparty. */
export async function createIncome(formData: FormData): Promise<void> {
  const app = await getApp();
  await app.repo(Transaction).create(
    {
      date: date(formData, "date") ?? new Date(),
      direction: "in",
      amount: Number(formData.get("amount") ?? 0),
      categoryId: text(formData, "categoryId"),
      accountId: text(formData, "accountId"),
      counterpartyId: optionalText(formData, "counterpartyId"),
      note: optionalText(formData, "note"),
    },
    WEB_CONTEXT,
  );
  revalidateMoney();
}

/** Перевод: money moves between two own accounts. */
export async function createTransfer(formData: FormData): Promise<void> {
  const app = await getApp();
  const accountId = text(formData, "accountId");
  const toAccountId = text(formData, "toAccountId");
  if (accountId === toAccountId) {
    throw new Error("Счёт списания и счёт зачисления должны отличаться");
  }
  await app.repo(Transaction).create(
    {
      date: date(formData, "date") ?? new Date(),
      direction: "transfer",
      amount: Number(formData.get("amount") ?? 0),
      accountId,
      toAccountId,
      note: optionalText(formData, "note"),
    },
    WEB_CONTEXT,
  );
  revalidateMoney();
}

// --- Люди ---

export async function createDepartment(formData: FormData): Promise<void> {
  const app = await getApp();
  await app.repo(Department).create(
    {
      name: text(formData, "name"),
      head: optionalText(formData, "head"),
      note: optionalText(formData, "note"),
    },
    WEB_CONTEXT,
  );
  revalidatePath("/people/departments");
}

export async function createPosition(formData: FormData): Promise<void> {
  const app = await getApp();
  await app.repo(Position).create(
    {
      name: text(formData, "name"),
      departmentId: optionalText(formData, "departmentId"),
      note: optionalText(formData, "note"),
    },
    WEB_CONTEXT,
  );
  revalidatePath("/people/positions");
}

export async function createEmployee(formData: FormData): Promise<void> {
  const app = await getApp();
  await app.repo(Employee).create(
    {
      fullName: text(formData, "fullName"),
      positionId: text(formData, "positionId"),
      departmentId: text(formData, "departmentId"),
      email: optionalText(formData, "email"),
      salary: Number(formData.get("salary") ?? 0),
      hiredAt: date(formData, "hiredAt"),
    },
    WEB_CONTEXT,
  );
  revalidatePath("/people");
  revalidatePath("/reports/payroll");
}

// --- Проекты ---

export async function createCounterparty(formData: FormData): Promise<void> {
  const app = await getApp();
  await app.repo(Counterparty).create(
    {
      name: text(formData, "name"),
      inn: text(formData, "inn"),
      kind: (text(formData, "kind") || "client") as "client" | "supplier" | "partner",
      phone: optionalText(formData, "phone"),
      email: optionalText(formData, "email"),
      note: optionalText(formData, "note"),
    },
    WEB_CONTEXT,
  );
  revalidatePath("/projects/counterparties");
}

export async function createProject(formData: FormData): Promise<void> {
  const app = await getApp();
  await app.repo(Project).create(
    {
      name: text(formData, "name"),
      counterpartyId: optionalText(formData, "counterpartyId"),
      status: (text(formData, "status") || "planning") as
        | "planning"
        | "active"
        | "on_hold"
        | "done",
      budget: Number(formData.get("budget") ?? 0),
      lead: optionalText(formData, "lead"),
      deadline: date(formData, "deadline"),
    },
    WEB_CONTEXT,
  );
  revalidatePath("/projects");
}
