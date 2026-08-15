import { Badge, PageHeader, type Column } from "@tesera/ui";
import { getApp } from "@/src/tesera/engine";
import { ACCESS_SECTIONS, Role, SECTION_LABELS, User } from "@/src/tesera/modules/admin";
import { createRole } from "@/src/tesera/actions";
import type { TableParams } from "@/src/tesera/table";
import { AddRecord } from "@/src/ui/AddRecord";
import { DataPanel } from "@/src/ui/DataPanel";
import type { FormFieldSpec } from "@/src/ui/RecordForm";
import { RowActions } from "@/src/ui/RowActions";

const SECTION_OPTIONS = ACCESS_SECTIONS.map((key) => ({
  value: key,
  label: SECTION_LABELS[key] ?? key,
}));

const roleFields = (role?: { name: string; sections: string[] }): FormFieldSpec[] => [
  {
    name: "name",
    label: "Название роли",
    placeholder: "Например, Бухгалтер",
    required: true,
    defaultValue: role?.name,
  },
  {
    name: "sections",
    label: "Доступные разделы",
    type: "checklist",
    hint: "Роль видит отмеченные разделы и может выполнять в них действия",
    options: SECTION_OPTIONS,
    defaultValues: role?.sections,
  },
];

export default async function RolesPage({
  searchParams,
}: {
  searchParams: TableParams;
}) {
  const app = await getApp();
  const [roles, users] = await Promise.all([
    app.repo(Role).list({ orderBy: { field: "name", direction: "asc" } }),
    app.repo(User).list(),
  ]);

  const holders = (roleId: string) => users.filter((u) => u.roleId === roleId).length;

  const columns: Column<(typeof roles)[number]>[] = [
    {
      key: "name",
      header: "Роль",
      value: (r) => r.name,
      render: (r) => <span className="font-medium text-ink">{r.name}</span>,
    },
    {
      key: "sections",
      header: "Доступ",
      value: (r) => r.sections.map((s) => SECTION_LABELS[s] ?? s).join(", "),
      render: (r) =>
        r.sections.length === ACCESS_SECTIONS.length ? (
          <Badge tone="brand">Полный доступ</Badge>
        ) : r.sections.length ? (
          <span className="flex flex-wrap gap-1">
            {r.sections.map((section) => (
              <Badge key={section}>{SECTION_LABELS[section] ?? section}</Badge>
            ))}
          </span>
        ) : (
          <span className="text-slate-400">Нет доступа</span>
        ),
    },
    { key: "users", header: "Пользователей", align: "right", value: (r) => holders(r.id), render: (r) => holders(r.id) },
    {
      key: "actions",
      header: "Действия",
      align: "right",
      className: "w-28",
      render: (r) => (
        <RowActions
          entity="role"
          id={r.id}
          title={r.name}
          fields={roleFields(r)}
          details={[
            { label: "Роль", value: r.name },
            {
              label: "Доступ",
              value: r.sections.length
                ? r.sections.map((s) => SECTION_LABELS[s] ?? s).join(", ")
                : "Нет доступа",
            },
            { label: "Пользователей", value: String(holders(r.id)) },
          ]}
        />
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Роли"
        subtitle="Что роль видит в системе, то она может и делать"
        actions={
          <AddRecord
            title="Новая роль"
            label="Новая роль"
            action={createRole}
            submitLabel="Создать роль"
            fields={roleFields()}
          />
        }
      />

      <DataPanel
          columns={columns}
          rows={roles}
          params={searchParams}
          filename="roles"
          empty="Ролей пока нет"
        />
    </>
  );
}
