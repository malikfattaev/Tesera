import {
  Badge,
  DataTable,
  PageHeader,
  StatCard,
  type Column,
} from "@tesera/ui";
import { getApp } from "@/src/tesera/engine";

export default async function AdminPage() {
  const app = await getApp();
  const entities = app.listEntities();
  const roles = app.rbac.listRoles();

  const entityRows = entities.map((e) => ({
    id: e.name,
    name: e.name,
    label: e.label,
    fields: Object.keys(e.fields).length,
  }));
  const entityCols: Column<(typeof entityRows)[number]>[] = [
    { key: "label", header: "Сущность", render: (r) => <span className="font-medium text-ink">{r.label}</span> },
    { key: "name", header: "Код", render: (r) => <span className="font-mono text-xs text-slate-500">{r.name}</span> },
    { key: "fields", header: "Полей", align: "right" },
  ];

  const roleRows = roles.map((r) => ({
    id: r.name,
    name: r.name,
    perms: r.permissions.map((p) => `${p.resource}:${p.action}`),
  }));
  const roleCols: Column<(typeof roleRows)[number]>[] = [
    { key: "name", header: "Роль", render: (r) => <span className="font-medium text-ink">{r.name}</span> },
    {
      key: "perms",
      header: "Права",
      render: (r) => (
        <div className="flex flex-wrap gap-1">
          {r.perms.map((p) => (
            <Badge key={p} tone="neutral">
              {p}
            </Badge>
          ))}
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Администрирование" subtitle="Движок Tesera: сущности и права доступа" />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Сущностей" value={entities.length} />
        <StatCard label="Ролей" value={roles.length} />
        <StatCard label="Адаптер данных" value="In-memory" />
      </div>

      <div className="mt-6">
        <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Сущности
        </div>
        <DataTable columns={entityCols} rows={entityRows} />
      </div>

      <div className="mt-6">
        <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Роли и права
        </div>
        <DataTable columns={roleCols} rows={roleRows} />
      </div>
    </>
  );
}
