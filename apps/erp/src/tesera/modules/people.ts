import { defineEntity, defineModule, t } from "@tesera/core";

/** An employee record. */
export const Employee = defineEntity({
  name: "employee",
  label: "Сотрудник",
  fields: {
    fullName: t.string().label("ФИО"),
    position: t.string().label("Должность"),
    department: t
      .enum(["management", "engineering", "sales", "finance", "operations"])
      .default("engineering")
      .label("Отдел"),
    email: t.string().optional().label("Email"),
    salary: t.int().default(0).label("Оклад"),
    active: t.boolean().default(true).label("Активен"),
    hiredAt: t.date().optional().label("Дата найма"),
  },
});

export const DEPARTMENT_LABELS: Record<string, string> = {
  management: "Руководство",
  engineering: "Разработка",
  sales: "Продажи",
  finance: "Финансы",
  operations: "Операции",
};

export const peopleModule = defineModule({
  name: "people",
  description: "Сотрудники",
  entities: [Employee],
  roles: [
    { name: "admin", permissions: [{ resource: "*", action: "*" }] },
    { name: "hr", permissions: [{ resource: "employee", action: "*" }] },
  ],
});
