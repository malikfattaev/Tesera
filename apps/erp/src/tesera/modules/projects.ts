import { defineEntity, defineModule, t } from "@tesera/core";

/** A client or internal project. */
export const Project = defineEntity({
  name: "project",
  label: "Проект",
  fields: {
    name: t.string().label("Название"),
    client: t.string().optional().label("Клиент"),
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

export const projectsModule = defineModule({
  name: "projects",
  description: "Проекты и их статусы",
  entities: [Project],
  roles: [
    { name: "admin", permissions: [{ resource: "*", action: "*" }] },
    { name: "pm", permissions: [{ resource: "project", action: "*" }] },
  ],
});
