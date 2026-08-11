import {
  Badge,
  Card,
  CardHeader,
  DataTable,
  PageHeader,
  type Column,
} from "@tesera/ui";
import { getApp } from "@/src/tesera/engine";
import {
  COUNTERPARTY_KIND_LABELS,
  Counterparty,
} from "@/src/tesera/modules/directories";
import { CATEGORY_LABELS } from "@/src/tesera/modules/money";
import { DEPARTMENT_LABELS } from "@/src/tesera/modules/people";
import { AddCounterpartyForm } from "@/src/ui/AddCounterpartyForm";

const KIND_TONE: Record<string, "green" | "amber" | "brand"> = {
  client: "green",
  supplier: "amber",
  partner: "brand",
};

type RefRow = { id: string; code: string; label: string };

export default async function DirectoriesPage() {
  const app = await getApp();
  const counterparties = await app
    .repo(Counterparty)
    .list({ orderBy: { field: "name", direction: "asc" } });

  const cpCols: Column<(typeof counterparties)[number]>[] = [
    { key: "name", header: "Название", render: (c) => <span className="font-medium text-ink">{c.name}</span> },
    {
      key: "kind",
      header: "Тип",
      render: (c) => (
        <Badge tone={KIND_TONE[c.kind] ?? "neutral"}>
          {COUNTERPARTY_KIND_LABELS[c.kind] ?? c.kind}
        </Badge>
      ),
    },
    { key: "phone", header: "Телефон", render: (c) => c.phone ?? "—" },
    { key: "email", header: "Email", render: (c) => c.email ?? "—" },
  ];

  const categoryRows: RefRow[] = Object.entries(CATEGORY_LABELS).map(([code, label]) => ({ id: code, code, label }));
  const departmentRows: RefRow[] = Object.entries(DEPARTMENT_LABELS).map(([code, label]) => ({ id: code, code, label }));
  const refCols: Column<RefRow>[] = [
    { key: "label", header: "Название" },
    { key: "code", header: "Код", render: (r) => <span className="font-mono text-xs text-slate-400">{r.code}</span> },
  ];

  return (
    <>
      <PageHeader title="Справочники" subtitle="Контрагенты и справочные данные" />

      <Card>
        <CardHeader title="Новый контрагент" />
        <div className="p-5">
          <AddCounterpartyForm />
        </div>
      </Card>

      <div className="mt-6">
        <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Контрагенты
        </div>
        <DataTable columns={cpCols} rows={counterparties} empty="Контрагентов пока нет" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div>
          <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Категории операций
          </div>
          <DataTable columns={refCols} rows={categoryRows} />
        </div>
        <div>
          <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Отделы
          </div>
          <DataTable columns={refCols} rows={departmentRows} />
        </div>
      </div>
    </>
  );
}
