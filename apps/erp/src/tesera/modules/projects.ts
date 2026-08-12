import { defineEntity, defineModule, t } from "@tesera/core";

/** A counterparty: client, supplier or partner. */
export const Counterparty = defineEntity({
  name: "counterparty",
  label: "Контрагент",
  fields: {
    name: t.string().label("Название"),
    kind: t.enum(["client", "supplier", "partner"]).default("client").label("Тип"),
    phone: t.string().optional().label("Телефон"),
    email: t.string().optional().label("Email"),
    note: t.string().optional().label("Заметка"),
  },
});

/** A client or internal project. */
export const Project = defineEntity({
  name: "project",
  label: "Проект",
  fields: {
    name: t.string().label("Название"),
    counterpartyId: t.relation("counterparty").optional().label("Контрагент"),
    status: t
      .enum(["planning", "active", "on_hold", "done"])
      .default("planning")
      .label("Статус"),
    budget: t.int().default(0).label("Бюджет"),
    lead: t.string().optional().label("Ответственный"),
    deadline: t.date().optional().label("Дедлайн"),
  },
});

export const PROJECT_STATUS_LABELS: Record<string, string> = {
  planning: "Планирование",
  active: "В работе",
  on_hold: "На паузе",
  done: "Завершён",
};

export const COUNTERPARTY_KIND_LABELS: Record<string, string> = {
  client: "Клиент",
  supplier: "Поставщик",
  partner: "Партнёр",
};

export const projectsModule = defineModule({
  name: "projects",
  description: "Проекты и контрагенты",
  entities: [Counterparty, Project],
  roles: [
    { name: "admin", permissions: [{ resource: "*", action: "*" }] },
    {
      name: "pm",
      permissions: [
        { resource: "project", action: "*" },
        { resource: "counterparty", action: "*" },
      ],
    },
  ],
});
