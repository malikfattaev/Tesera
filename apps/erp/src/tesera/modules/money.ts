import { defineEntity, defineModule, t } from "@tesera/core";

/** A money account (bank, cash register, card). */
export const Account = defineEntity({
  name: "account",
  label: "Счёт",
  fields: {
    name: t.string().label("Название"),
    kind: t.enum(["cash", "bank", "card"]).default("bank").label("Тип"),
    currency: t.enum(["UZS", "USD", "EUR"]).default("UZS").label("Валюта"),
  },
});

/** A single money movement in or out of an account. */
export const Transaction = defineEntity({
  name: "transaction",
  label: "Операция",
  fields: {
    date: t.date().label("Дата"),
    direction: t.enum(["in", "out"]).label("Направление"),
    amount: t.int().label("Сумма"),
    category: t
      .enum(["sales", "salary", "office", "tax", "other"])
      .default("other")
      .label("Категория"),
    accountId: t.relation("account").label("Счёт"),
    counterparty: t.string().optional().label("Контрагент"),
    note: t.string().optional().label("Комментарий"),
  },
});

export const DIRECTION_LABELS: Record<string, string> = {
  in: "Приход",
  out: "Расход",
};

export const CATEGORY_LABELS: Record<string, string> = {
  sales: "Продажи",
  salary: "ФОТ (зарплата)",
  office: "Офисные расходы",
  tax: "Налоги",
  other: "Прочее",
};

export const ACCOUNT_KIND_LABELS: Record<string, string> = {
  cash: "Касса",
  bank: "Банк",
  card: "Карта",
};

export const moneyModule = defineModule({
  name: "money",
  description: "Счета и денежные операции",
  entities: [Account, Transaction],
  roles: [
    { name: "admin", permissions: [{ resource: "*", action: "*" }] },
    {
      name: "finance",
      permissions: [
        { resource: "account", action: "*" },
        { resource: "transaction", action: "*" },
      ],
    },
  ],
});
