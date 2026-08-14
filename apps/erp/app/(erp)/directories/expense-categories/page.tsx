import { DataTable, PageHeader, type Column } from "@tesera/ui";
import { getApp } from "@/src/tesera/engine";
import { Category, Transaction } from "@/src/tesera/modules/finance";
import { createExpenseCategory } from "@/src/tesera/actions";
import { money } from "@/src/tesera/format";
import { AddRecord } from "@/src/ui/AddRecord";
import { RowActions } from "@/src/ui/RowActions";

export default async function ExpenseCategoriesPage() {
  const app = await getApp();
  const [categories, txs] = await Promise.all([
    app.repo(Category).list({ orderBy: { field: "name", direction: "asc" } }),
    app.repo(Transaction).list(),
  ]);

  const rows = categories.filter((c) => c.direction === "out");
  const used = (id: string) => txs.filter((t) => t.categoryId === id);

  const columns: Column<(typeof rows)[number]>[] = [
    {
      key: "name",
      header: "Категория",
      render: (c) => <span className="font-medium text-ink">{c.name}</span>,
    },
    { key: "count", header: "Операций", align: "right", render: (c) => used(c.id).length },
    {
      key: "total",
      header: "Сумма расходов",
      align: "right",
      render: (c) => money(used(c.id).reduce((s, t) => s + t.amount, 0)),
    },
    {
      key: "actions",
      header: "Действия",
      align: "right",
      className: "w-28",
      render: (c) => (
        <RowActions
          entity="category"
          id={c.id}
          title={c.name}
          fields={[
            { name: "name", label: "Название", required: true, defaultValue: c.name },
          ]}
          details={[
            { label: "Категория", value: c.name },
            { label: "Операций", value: String(used(c.id).length) },
            {
              label: "Сумма расходов",
              value: money(used(c.id).reduce((s, t) => s + t.amount, 0)),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Категории расходов"
        subtitle="На что компания тратит деньги"
        actions={
          <AddRecord
            title="Новая категория расхода"
            label="Новая категория"
            action={createExpenseCategory}
            submitLabel="Добавить категорию"
            fields={[
              { name: "name", label: "Название", placeholder: "Например, Реклама", required: true },
            ]}
          />
        }
      />

      <DataTable columns={columns} rows={rows} empty="Категорий расходов пока нет" />
    </>
  );
}
