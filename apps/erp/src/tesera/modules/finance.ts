import { defineEntity, defineModule, t } from "@tesera/core";

/** A money category (used to classify income and expenses). */
export const Category = defineEntity({
  name: "category",
  label: "Категория",
  fields: {
    name: t.string().label("Название"),
    direction: t.enum(["in", "out"]).default("out").label("Направление"),
    note: t.string().optional().label("Заметка"),
  },
});

/** A settlement account (bank, cash register, card). */
export const Account = defineEntity({
  name: "account",
  label: "Расчётный счёт",
  fields: {
    name: t.string().label("Название"),
    kind: t.enum(["cash", "bank", "card"]).default("bank").label("Тип"),
    currency: t.enum(["UZS", "USD", "EUR"]).default("UZS").label("Валюта"),
  },
});

/**
 * A single money movement. `direction` decides which fields apply:
 * - "out" (расход): spends from `accountId`, no counterparty.
 * - "in" (доход): lands on `accountId`, may name a `counterpartyId`.
 * - "transfer" (перевод): moves from `accountId` to `toAccountId`, no category.
 */
export const Transaction = defineEntity({
  name: "transaction",
  label: "Операция",
  fields: {
    date: t.date().label("Дата"),
    direction: t.enum(["in", "out", "transfer"]).label("Тип"),
    amount: t.int().label("Сумма"),
    categoryId: t.relation("category").optional().label("Категория"),
    accountId: t.relation("account").label("Счёт"),
    toAccountId: t.relation("account").optional().label("Счёт зачисления"),
    counterpartyId: t.relation("counterparty").optional().label("Контрагент"),
    note: t.string().optional().label("Комментарий"),
  },
});

export const DIRECTION_LABELS: Record<string, string> = {
  in: "Доход",
  out: "Расход",
  transfer: "Перевод",
};

export const ACCOUNT_KIND_LABELS: Record<string, string> = {
  cash: "Касса",
  bank: "Банк",
  card: "Карта",
};

export const financeModule = defineModule({
  name: "finance",
  description: "Категории, расчётные счета и операции",
  entities: [Category, Account, Transaction],
  roles: [
    { name: "admin", permissions: [{ resource: "*", action: "*" }] },
    {
      name: "finance",
      permissions: [
        { resource: "category", action: "*" },
        { resource: "account", action: "*" },
        { resource: "transaction", action: "*" },
      ],
    },
  ],
});
