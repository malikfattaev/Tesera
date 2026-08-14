import { defineEntity, defineModule, t } from "@tesera/core";

/** A company department. */
export const Department = defineEntity({
  name: "department",
  label: "Отдел",
  fields: {
    name: t.string().label("Название"),
    head: t.string().optional().label("Руководитель"),
  },
});

/** A job position. */
export const Position = defineEntity({
  name: "position",
  label: "Должность",
  fields: {
    name: t.string().label("Название"),
    departmentId: t.relation("department").optional().label("Отдел"),
  },
});

/** An employee record. */
export const Employee = defineEntity({
  name: "employee",
  label: "Сотрудник",
  fields: {
    fullName: t.string().label("ФИО"),
    positionId: t.relation("position").label("Должность"),
    departmentId: t.relation("department").label("Отдел"),
    email: t.string().optional().label("Email"),
    salary: t.int().default(0).label("Оклад"),
    active: t.boolean().default(true).label("Активен"),
    hiredAt: t.date().optional().label("Дата найма"),
  },
});

export const peopleModule = defineModule({
  name: "people",
  description: "Сотрудники, должности и отделы",
  entities: [Department, Position, Employee],
  roles: [
    { name: "admin", permissions: [{ resource: "*", action: "*" }] },
    {
      name: "hr",
      permissions: [
        { resource: "employee", action: "*" },
        { resource: "position", action: "*" },
        { resource: "department", action: "*" },
      ],
    },
  ],
});
