import { Badge, DataTable, PageHeader, StatCard, type Column } from "@tesera/ui";
import { getApp } from "@/src/tesera/engine";
import { Counterparty, PROJECT_STATUS_LABELS, Project } from "@/src/tesera/modules/projects";
import { createProject } from "@/src/tesera/actions";
import { formatDate, money } from "@/src/tesera/format";
import { AddRecord } from "@/src/ui/AddRecord";

const STATUS_TONES: Record<string, "brand" | "green" | "amber" | "neutral"> = {
  planning: "neutral",
  active: "brand",
  on_hold: "amber",
  done: "green",
};

export default async function ProjectsPage() {
  const app = await getApp();
  const [projects, counterparties] = await Promise.all([
    app.repo(Project).list({ orderBy: { field: "name", direction: "asc" } }),
    app.repo(Counterparty).list({ orderBy: { field: "name", direction: "asc" } }),
  ]);

  const clientName = (id?: string) =>
    id ? (counterparties.find((c) => c.id === id)?.name ?? "—") : "—";
  const activeCount = projects.filter((p) => p.status === "active").length;
  const totalBudget = projects.reduce((s, p) => s + p.budget, 0);

  const columns: Column<(typeof projects)[number]>[] = [
    {
      key: "name",
      header: "Проект",
      render: (p) => <span className="font-medium text-ink">{p.name}</span>,
    },
    { key: "counterparty", header: "Контрагент", render: (p) => clientName(p.counterpartyId) },
    {
      key: "status",
      header: "Статус",
      render: (p) => (
        <Badge tone={STATUS_TONES[p.status] ?? "neutral"}>
          {PROJECT_STATUS_LABELS[p.status] ?? p.status}
        </Badge>
      ),
    },
    { key: "lead", header: "Ответственный", render: (p) => p.lead ?? "—" },
    { key: "deadline", header: "Дедлайн", render: (p) => (p.deadline ? formatDate(p.deadline) : "—") },
    { key: "budget", header: "Бюджет", align: "right", render: (p) => money(p.budget) },
  ];

  return (
    <>
      <PageHeader
        title="Проекты"
        subtitle="Клиентские и внутренние проекты"
        actions={
          <AddRecord
            title="Новый проект"
            action={createProject}
            submitLabel="Добавить проект"
            label="Новый проект"
            fields={[
              { name: "name", label: "Название", placeholder: "Название проекта", required: true },
              {
                name: "counterpartyId",
                label: "Контрагент",
                type: "select",
                options: [
                  { value: "", label: "Без контрагента" },
                  ...counterparties.map((c) => ({ value: c.id, label: c.name })),
                ],
              },
              {
                name: "status",
                label: "Статус",
                type: "select",
                defaultValue: "planning",
                options: [
                  { value: "planning", label: "Планирование" },
                  { value: "active", label: "В работе" },
                  { value: "on_hold", label: "На паузе" },
                  { value: "done", label: "Завершён" },
                ],
              },
              { name: "budget", label: "Бюджет", type: "number", step: "1000000", placeholder: "0" },
              { name: "lead", label: "Ответственный", placeholder: "Имя" },
              { name: "deadline", label: "Дедлайн", type: "date" },
            ]}
          />
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Всего проектов" value={projects.length} />
        <StatCard label="В работе" value={activeCount} />
        <StatCard label="Суммарный бюджет" value={money(totalBudget)} />
      </div>

      <div className="mt-6">
        <DataTable columns={columns} rows={projects} empty="Проектов пока нет" />
      </div>
    </>
  );
}
