import { defineEntity, defineModule, t } from "@tesera/core";

/** A counterparty: client, supplier or partner. */
export const Counterparty = defineEntity({
  name: "counterparty",
  label: "Контрагент",
  fields: {
    name: t.string().label("Название"),
    kind: t
      .enum(["client", "supplier", "partner"])
      .default("client")
      .label("Тип"),
    phone: t.string().optional().label("Телефон"),
    email: t.string().optional().label("Email"),
    note: t.string().optional().label("Заметка"),
  },
});

export const COUNTERPARTY_KIND_LABELS: Record<string, string> = {
  client: "Клиент",
  supplier: "Поставщик",
  partner: "Партнёр",
};

export const directoriesModule = defineModule({
  name: "directories",
  description: "Справочники: контрагенты и справочные данные",
  entities: [Counterparty],
  roles: [{ name: "admin", permissions: [{ resource: "*", action: "*" }] }],
});
