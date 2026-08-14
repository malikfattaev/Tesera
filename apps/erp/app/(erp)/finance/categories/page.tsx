import { Badge, DataTable, PageHeader, type Column } from "@tesera/ui";
import { getApp } from "@/src/tesera/engine";
import { Category, DIRECTION_LABELS } from "@/src/tesera/modules/finance";
import { createCategory } from "@/src/tesera/actions";
import { AddRecord } from "@/src/ui/AddRecord";
import type { FormFieldSpec } from "@/src/ui/RecordForm";
import { RowActions } from "@/src/ui/RowActions";

const categoryFields = (category?: { name: string; direction: string }): FormFieldSpec[] => [
  {
    name: "name",
    label: "Название",
    placeholder: "Например, Реклама",
    required: true,
    defaultValue: category?.name,
  },
  {
    name: "direction",
    label: "Направление",
    type: "select",
    defaultValue: category?.direction ?? "out",
    options: [
      { value: "out", label: "Расход" },
      { value: "in", label: "Доход" },
    ],
  },
];

export default async function CategoriesPage() {
  const app = await getApp();
  const categories = await app
    .repo(Category)
    .list({ orderBy: { field: "name", direction: "asc" } });

  const columns: Column<(typeof categories)[number]>[] = [
    {
      key: "name",
      header: "Название",
      render: (c) => <span className="font-medium text-ink">{c.name}</span>,
    },
    {
      key: "direction",
      header: "Направление",
      render: (c) => (
        <Badge tone={c.direction === "in" ? "green" : "neutral"}>
          {DIRECTION_LABELS[c.direction]}
        </Badge>
      ),
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
          fields={categoryFields(c)}
          details={[
            { label: "Название", value: c.name },
            { label: "Направление", value: DIRECTION_LABELS[c.direction] ?? c.direction },
          ]}
        />
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Категории расходов"
        subtitle="Классификация приходов и расходов"
        actions={
          <AddRecord
            title="Новая категория"
            action={createCategory}
            submitLabel="Добавить категорию"
            label="Новая категория"
            fields={categoryFields()}
          />
        }
      />

      <DataTable columns={columns} rows={categories} empty="Категорий пока нет" />
    </>
  );
}
