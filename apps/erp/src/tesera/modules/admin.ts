import { defineEntity, defineModule, t } from "@tesera/core";

/**
 * What a role may open. Access is granted per section: if a role sees a
 * section, it can also act inside it (create, edit, delete).
 */
export const ACCESS_SECTIONS = [
  "dashboard",
  "directories",
  "finance",
  "projects",
  "people",
  "reports",
  "admin",
] as const;

export const SECTION_LABELS: Record<string, string> = {
  dashboard: "Панель управления",
  directories: "Справочники",
  finance: "Финансы",
  projects: "Проекты",
  people: "Люди",
  reports: "Отчёты",
  admin: "Администрирование",
};

/** A named set of accessible sections. */
export const Role = defineEntity({
  name: "role",
  label: "Роль",
  fields: {
    name: t.string().label("Название"),
    sections: t.multiEnum(ACCESS_SECTIONS).default([]).label("Доступ"),
  },
});

/**
 * A person who signs in. The password is never stored as typed: only a salted
 * hash is kept, and it is never sent back to the interface.
 */
export const User = defineEntity({
  name: "user",
  label: "Пользователь",
  fields: {
    fullName: t.string().label("Имя"),
    login: t.string().unique().label("Логин"),
    passwordHash: t.string().label("Пароль"),
    roleId: t.relation("role").label("Роль"),
    active: t.boolean().default(true).label("Активен"),
    /** Sections the user chose to hide from their own menu. */
    hiddenSections: t.multiEnum(ACCESS_SECTIONS).default([]).label("Скрытые разделы"),
  },
});

export const adminModule = defineModule({
  name: "admin",
  description: "Пользователи и роли",
  entities: [Role, User],
  roles: [{ name: "admin", permissions: [{ resource: "*", action: "*" }] }],
});
