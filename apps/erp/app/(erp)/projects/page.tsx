import { Badge, PageHeader, StatCard, type Column } from "@tesera/ui";
import { getApp } from "@/src/tesera/engine";
import { Counterparty, PROJECT_STATUS_LABELS, Project } from "@/src/tesera/modules/projects";
import { createProject } from "@/src/tesera/actions";
import { formatDate, isoDate, money } from "@/src/tesera/format";
import type { TableParams } from "@/src/tesera/table";
import { AddRecord } from "@/src/ui/AddRecord";
import { DataPanel } from "@/src/ui/DataPanel";
import type { FormFieldSpec } from "@/src/ui/RecordForm";
import { RowActions } from "@/src/ui/RowActions";

const STATUS_TONES: Record<string, "brand" | "green" | "amber" | "neutral"> = {
  planning: "neutral",
  active: "brand",
  on_hold: "amber",
  done: "green",
};

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: TableParams;
}) {
  const app = await getApp();
  const [projects, counterparties] = await Promise.all([
    app.repo(Project).list({ orderBy: { field: "name", direction: "asc" } }),
    app.repo(Counterparty).list({ orderBy: { field: "name", direction: "asc" } }),
  ]);

  const clientName = (id?: string) =>
    id ? (counterparties.find((c) => c.id === id)?.name ?? "—") : "—";
  const activeCount = projects.filter((p) => p.status === "active").length;
  const totalBudget = projects.reduce((s, p) => s + p.budget, 0);

  const projectFields = (project?: (typeof projects)[number]): FormFieldSpec[] => [
    {
      name: "name",
      label: "Название",
      placeholder: "Название проекта",
      required: true,
      defaultValue: project?.name,
    },
    {
      name: "counterpartyId",
      label: "Контрагент",
      type: "select",
      defaultValue: project?.counterpartyId ?? "",
      options: [
        { value: "", label: "Без контрагента" },
        ...counterparties.map((c) => ({ value: c.id, label: c.name })),
      ],
    },
    {
      name: "status",
      label: "Статус",
      type: "select",
      defaultValue: project?.status ?? "planning",
      options: [
        { value: "planning", label: "Планирование" },
        { value: "active", label: "В работе" },
        { value: "on_hold", label: "На паузе" },
        { value: "done", label: "Завершён" },
      ],
    },
    {
      name: "budget",
      label: "Бюджет",
      type: "number",
      step: "1000000",
      placeholder: "0",
      defaultValue: project ? String(project.budget) : undefined,
    },
    {
      name: "lead",
      label: "Ответственный",
      placeholder: "Имя",
      defaultValue: project?.lead,
    },
    {
      name: "deadline",
      label: "Дедлайн",
      type: "date",
      defaultValue: project?.deadline ? isoDate(new Date(project.deadline)) : undefined,
    },
  ];

  const columns: Column<(typeof projects)[number]>[] = [
    {
      key: "name",
      header: "Проект",
      value: (p) => p.name,
      render: (p) => <span className="font-medium text-ink">{p.name}</span>,
    },
    { key: "counterparty", header: "Контрагент", value: (p) => clientName(p.counterpartyId), render: (p) => clientName(p.counterpartyId) },
    {
      key: "status",
      header: "Статус",
      value: (p) => PROJECT_STATUS_LABELS[p.status] ?? p.status,
      render: (p) => (
        <Badge tone={STATUS_TONES[p.status] ?? "neutral"}>
          {PROJECT_STATUS_LABELS[p.status] ?? p.status}
        </Badge>
      ),
    },
    { key: "lead", header: "Ответственный", value: (p) => p.lead ?? "", render: (p) => p.lead ?? "—" },
    {
      key: "deadline",
      header: "Дедлайн",
      value: (p) => (p.deadline ? isoDate(new Date(p.deadline)) : ""),
      render: (p) => (p.deadline ? formatDate(p.deadline) : "—"),
    },
    { key: "budget", header: "Бюджет", align: "right", value: (p) => p.budget, render: (p) => money(p.budget) },
    {
      key: "actions",
      header: "Действия",
      align: "right",
      className: "w-28",
      render: (p) => (
        <RowActions
          entity="project"
          id={p.id}
          title={p.name}
          fields={projectFields(p)}
          details={[
            { label: "Проект", value: p.name },
            { label: "Контрагент", value: clientName(p.counterpartyId) },
            { label: "Статус", value: PROJECT_STATUS_LABELS[p.status] ?? p.status },
            { label: "Ответственный", value: p.lead ?? "—" },
            { label: "Дедлайн", value: p.deadline ? formatDate(p.deadline) : "—" },
            { label: "Бюджет", value: money(p.budget) },
          ]}
        />
      ),
    },
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
            fields={projectFields()}
          />
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Всего проектов" value={projects.length} />
        <StatCard label="В работе" value={activeCount} />
        <StatCard label="Суммарный бюджет" value={money(totalBudget)} />
      </div>

      <div className="mt-6">
        <DataPanel
          columns={columns}
          rows={projects}
          params={searchParams}
          filename="projects"
          empty="Проектов пока нет"
        />
      </div>
    </>
  );
}
