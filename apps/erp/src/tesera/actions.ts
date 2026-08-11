"use server";
import { revalidatePath } from "next/cache";
import { getApp, WEB_CONTEXT } from "./engine";
import { Transaction } from "./modules/money";
import { Employee } from "./modules/people";
import { Project } from "./modules/projects";
import { Counterparty } from "./modules/directories";

function emptyToUndefined(value: FormDataEntryValue | null): string | undefined {
  const s = value == null ? "" : String(value).trim();
  return s.length ? s : undefined;
}

export async function createTransaction(formData: FormData): Promise<void> {
  const app = await getApp();
  const date = String(formData.get("date") ?? "");
  await app.repo(Transaction).create(
    {
      date: date ? new Date(date) : new Date(),
      direction: String(formData.get("direction") ?? "out") as "in" | "out",
      amount: Number(formData.get("amount") ?? 0),
      category: String(formData.get("category") ?? "other") as
        | "sales"
        | "salary"
        | "office"
        | "tax"
        | "other",
      accountId: String(formData.get("accountId") ?? ""),
      counterparty: emptyToUndefined(formData.get("counterparty")),
      note: emptyToUndefined(formData.get("note")),
    },
    WEB_CONTEXT,
  );
  revalidatePath("/money");
  revalidatePath("/dashboard");
}

export async function createEmployee(formData: FormData): Promise<void> {
  const app = await getApp();
  const hiredAt = String(formData.get("hiredAt") ?? "");
  await app.repo(Employee).create(
    {
      fullName: String(formData.get("fullName") ?? ""),
      position: String(formData.get("position") ?? ""),
      department: String(formData.get("department") ?? "engineering") as
        | "management"
        | "engineering"
        | "sales"
        | "finance"
        | "operations",
      email: emptyToUndefined(formData.get("email")),
      salary: Number(formData.get("salary") ?? 0),
      hiredAt: hiredAt ? new Date(hiredAt) : undefined,
    },
    WEB_CONTEXT,
  );
  revalidatePath("/people");
  revalidatePath("/dashboard");
}

export async function createProject(formData: FormData): Promise<void> {
  const app = await getApp();
  const deadline = String(formData.get("deadline") ?? "");
  await app.repo(Project).create(
    {
      name: String(formData.get("name") ?? ""),
      client: emptyToUndefined(formData.get("client")),
      status: String(formData.get("status") ?? "planning") as
        | "planning"
        | "active"
        | "on_hold"
        | "done",
      budget: Number(formData.get("budget") ?? 0),
      lead: emptyToUndefined(formData.get("lead")),
      deadline: deadline ? new Date(deadline) : undefined,
    },
    WEB_CONTEXT,
  );
  revalidatePath("/projects");
  revalidatePath("/reports");
}

export async function createCounterparty(formData: FormData): Promise<void> {
  const app = await getApp();
  await app.repo(Counterparty).create(
    {
      name: String(formData.get("name") ?? ""),
      kind: String(formData.get("kind") ?? "client") as
        | "client"
        | "supplier"
        | "partner",
      phone: emptyToUndefined(formData.get("phone")),
      email: emptyToUndefined(formData.get("email")),
      note: emptyToUndefined(formData.get("note")),
    },
    WEB_CONTEXT,
  );
  revalidatePath("/directories");
}
