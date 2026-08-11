import {
  DataTable,
  PageHeader,
  StatCard,
  type Column,
} from "@tesera/ui";
import { getApp } from "@/src/tesera/engine";
import { CATEGORY_LABELS, Transaction } from "@/src/tesera/modules/money";
import { DEPARTMENT_LABELS, Employee } from "@/src/tesera/modules/people";
import { PROJECT_STATUS_LABELS, Project } from "@/src/tesera/modules/projects";
import { money, signedMoney } from "@/src/tesera/format";

export default async function ReportsPage() {
  const app = await getApp();
  const [txs, employees, projects] = await Promise.all([
    app.repo(Transaction).list(),
    app.repo(Employee).list(),
    app.repo(Project).list(),
  ]);

  const income = txs.filter((t) => t.direction === "in").reduce((s, t) => s + t.amount, 0);
  const expense = txs.filter((t) => t.direction === "out").reduce((s, t) => s + t.amount, 0);
  const profit = income - expense;

  const byCategory = new Map<string, number>();
  for (const t of txs) {
    if (t.direction === "out") byCategory.set(t.category, (byCategory.get(t.category) ?? 0) + t.amount);
  }
  const catRows = [...byCategory.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([key, value]) => ({
      id: key,
      category: CATEGORY_LABELS[key] ?? key,
      amount: value,
      share: expense ? Math.round((value / expense) * 100) : 0,
    }));

  const byDept = new Map<string, { count: number; payroll: number }>();
  for (const e of employees) {
    const cur = byDept.get(e.department) ?? { count: 0, payroll: 0 };
    cur.count += 1;
    cur.payroll += e.salary;
    byDept.set(e.department, cur);
  }
  const deptRows = [...byDept.entries()].map(([key, v]) => ({
    id: key,
    dept: DEPARTMENT_LABELS[key] ?? key,
    count: v.count,
    payroll: v.payroll,
  }));

  const byStatus = new Map<string, { count: number; budget: number }>();
  for (const p of projects) {
    const cur = byStatus.get(p.status) ?? { count: 0, budget: 0 };
    cur.count += 1;
    cur.budget += p.budget;
    byStatus.set(p.status, cur);
  }
  const statusRows = [...byStatus.entries()].map(([key, v]) => ({
    id: key,
    status: PROJECT_STATUS_LABELS[key] ?? key,
    count: v.count,
    budget: v.budget,
  }));

  const catCols: Column<(typeof catRows)[number]>[] = [
    { key: "category", header: "Категория" },
    { key: "amount", header: "Сумма", align: "right", render: (r) => money(r.amount) },
    { key: "share", header: "Доля", align: "right", render: (r) => `${r.share}%` },
  ];
  const deptCols: Column<(typeof deptRows)[number]>[] = [
    { key: "dept", header: "Отдел" },
    { key: "count", header: "Людей", align: "right" },
    { key: "payroll", header: "ФОТ", align: "right", render: (r) => money(r.payroll) },
  ];
  const statusCols: Column<(typeof statusRows)[number]>[] = [
    { key: "status", header: "Статус" },
    { key: "count", header: "Проектов", align: "right" },
    { key: "budget", header: "Бюджет", align: "right", render: (r) => money(r.budget) },
  ];

  return (
    <>
      <PageHeader title="Отчёты" subtitle="Сводка по данным движка" />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Доходы" value={money(income)} tone="positive" />
        <StatCard label="Расходы" value={money(expense)} />
        <StatCard label="Прибыль" value={signedMoney(profit)} tone={profit < 0 ? "negative" : "positive"} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div>
          <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Расходы по категориям
          </div>
          <DataTable columns={catCols} rows={catRows} empty="Нет расходов" />
        </div>
        <div>
          <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Сотрудники по отделам
          </div>
          <DataTable columns={deptCols} rows={deptRows} empty="Нет сотрудников" />
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Проекты по статусам
        </div>
        <DataTable columns={statusCols} rows={statusRows} empty="Нет проектов" />
      </div>
    </>
  );
}
