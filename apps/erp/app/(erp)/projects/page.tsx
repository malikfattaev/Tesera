import {
  Badge,
  Card,
  CardHeader,
  DataTable,
  PageHeader,
  StatCard,
  type Column,
} from "@tesera/ui";
import { getApp } from "@/src/tesera/engine";
import { PROJECT_STATUS_LABELS, Project } from "@/src/tesera/modules/projects";
import { formatDate, money } from "@/src/tesera/format";
import { AddProjectForm } from "@/src/ui/AddProjectForm";

const STATUS_TONE: Record<string, "green" | "amber" | "neutral" | "brand"> = {
  active: "green",
  planning: "brand",
  on_hold: "amber",
  done: "neutral",
};

export default async function ProjectsPage() {
  const app = await getApp();
  const projects = await app
    .repo(Project)
    .list({ orderBy: { field: "name", direction: "asc" } });
  const active = projects.filter((p) => p.status === "active").length;
  const totalBudget = projects.reduce((s, p) => s + p.budget, 0);

  const columns: Column<(typeof projects)[number]>[] = [
    { key: "name", header: "Проект", render: (p) => <span className="font-medium text-ink">{p.name}</span> },
    { key: "client", header: "Клиент", render: (p) => p.client ?? "—" },
    {
      key: "status",
      header: "Статус",
      render: (p) => (
        <Badge tone={STATUS_TONE[p.status] ?? "neutral"}>
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
      <PageHeader title="Проекты" subtitle="Портфель проектов" />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Всего проектов" value={projects.length} />
        <StatCard label="В работе" value={active} />
        <StatCard label="Сумма бюджетов" value={money(totalBudget)} />
      </div>

      <Card className="mt-6">
        <CardHeader title="Новый проект" />
        <div className="p-5">
          <AddProjectForm />
        </div>
      </Card>

      <div className="mt-6">
        <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Список
        </div>
        <DataTable columns={columns} rows={projects} empty="Проектов пока нет" />
      </div>
    </>
  );
}
