import { Badge, PageHeader, StatCard, type Column } from "@tesera/ui";
import { getApp } from "@/src/tesera/engine";
import { Role, SECTION_LABELS, User } from "@/src/tesera/modules/admin";
import { createUser } from "@/src/tesera/actions";
import type { TableParams } from "@/src/tesera/table";
import { AddRecord } from "@/src/ui/AddRecord";
import { DataPanel } from "@/src/ui/DataPanel";
import type { FormFieldSpec } from "@/src/ui/RecordForm";
import { RowActions } from "@/src/ui/RowActions";

export default async function UsersPage({
  searchParams,
}: {
  searchParams: TableParams;
}) {
  const app = await getApp();
  const [users, roles] = await Promise.all([
    app.repo(User).list({ orderBy: { field: "fullName", direction: "asc" } }),
    app.repo(Role).list({ orderBy: { field: "name", direction: "asc" } }),
  ]);

  const role = (id: string) => roles.find((r) => r.id === id);
  const roleOptions = roles.map((r) => ({ value: r.id, label: r.name }));

  /**
   * The password is write-only: it is stored hashed and never read back, so the
   * field is empty on edit and only changes the password when filled in.
   */
  const userFields = (user?: (typeof users)[number]): FormFieldSpec[] => [
    {
      name: "fullName",
      label: "Имя",
      placeholder: "Имя Фамилия",
      required: true,
      defaultValue: user?.fullName,
    },
    {
      name: "login",
      label: "Логин",
      placeholder: "malik",
      required: true,
      defaultValue: user?.login,
    },
    {
      name: "password",
      label: user ? "Новый пароль" : "Пароль",
      type: "password",
      placeholder: user ? "Оставьте пустым, чтобы не менять" : "Минимум 6 символов",
      required: !user,
      hint: user ? "Заполните, только если нужно сменить пароль" : undefined,
    },
    {
      name: "roleId",
      label: "Роль",
      type: "select",
      required: true,
      defaultValue: user?.roleId,
      options: roleOptions,
    },
  ];

  const columns: Column<(typeof users)[number]>[] = [
    {
      key: "fullName",
      header: "Пользователь",
      value: (u) => u.fullName,
      render: (u) => <span className="font-medium text-ink">{u.fullName}</span>,
    },
    {
      key: "login",
      header: "Логин",
      value: (u) => u.login,
      render: (u) => <span className="text-slate-600">{u.login}</span>,
    },
    {
      key: "role",
      header: "Роль",
      value: (u) => role(u.roleId)?.name ?? "",
      render: (u) => <Badge tone="brand">{role(u.roleId)?.name ?? "—"}</Badge>,
    },
    {
      key: "access",
      header: "Доступ",
      value: (u) => (role(u.roleId)?.sections ?? []).map((s) => SECTION_LABELS[s] ?? s).join(", "),
      render: (u) => {
        const sections = role(u.roleId)?.sections ?? [];
        return sections.length ? (
          <span className="text-slate-500">
            {sections.map((s) => SECTION_LABELS[s] ?? s).join(", ")}
          </span>
        ) : (
          <span className="text-slate-400">Нет доступа</span>
        );
      },
    },
    {
      key: "active",
      header: "Статус",
      value: (u) => (u.active ? "Активен" : "Отключён"),
      render: (u) =>
        u.active ? <Badge tone="green">Активен</Badge> : <Badge tone="red">Отключён</Badge>,
    },
    {
      key: "actions",
      header: "Действия",
      align: "right",
      className: "w-28",
      render: (u) => (
        <RowActions
          entity="user"
          id={u.id}
          title={u.fullName}
          fields={userFields(u)}
          details={[
            { label: "Имя", value: u.fullName },
            { label: "Логин", value: u.login },
            { label: "Роль", value: role(u.roleId)?.name ?? "—" },
            { label: "Статус", value: u.active ? "Активен" : "Отключён" },
          ]}
        />
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Пользователи"
        subtitle="Доступ в систему по логину и паролю"
        actions={
          <AddRecord
            title="Новый пользователь"
            label="Новый пользователь"
            action={createUser}
            submitLabel="Создать пользователя"
            fields={userFields()}
          />
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Пользователей" value={users.length} />
        <StatCard label="Активных" value={users.filter((u) => u.active).length} />
        <StatCard label="Ролей" value={roles.length} />
      </div>

      <div className="mt-6">
        <DataPanel
          columns={columns}
          rows={users}
          params={searchParams}
          filename="users"
          empty="Пользователей пока нет"
        />
      </div>
    </>
  );
}
