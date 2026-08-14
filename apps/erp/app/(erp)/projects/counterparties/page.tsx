import { Badge, DataTable, PageHeader, type Column } from "@tesera/ui";
import { getApp } from "@/src/tesera/engine";
import { COUNTERPARTY_KIND_LABELS, Counterparty } from "@/src/tesera/modules/projects";
import { createCounterparty } from "@/src/tesera/actions";
import { AddRecord } from "@/src/ui/AddRecord";

const KIND_TONES: Record<string, "brand" | "green" | "amber"> = {
  client: "green",
  supplier: "amber",
  partner: "brand",
};

export default async function CounterpartiesPage() {
  const app = await getApp();
  const counterparties = await app
    .repo(Counterparty)
    .list({ orderBy: { field: "name", direction: "asc" } });

  const columns: Column<(typeof counterparties)[number]>[] = [
    {
      key: "name",
      header: "Название",
      render: (c) => <span className="font-medium text-ink">{c.name}</span>,
    },
    { key: "inn", header: "ИНН", render: (c) => <span className="tabular-nums">{c.inn}</span> },
    {
      key: "kind",
      header: "Тип",
      render: (c) => (
        <Badge tone={KIND_TONES[c.kind] ?? "neutral"}>
          {COUNTERPARTY_KIND_LABELS[c.kind] ?? c.kind}
        </Badge>
      ),
    },
    { key: "phone", header: "Телефон", render: (c) => c.phone ?? "—" },
    { key: "email", header: "Email", render: (c) => c.email ?? "—" },
  ];

  return (
    <>
      <PageHeader
        title="Контрагенты"
        subtitle="Клиенты, поставщики и партнёры"
        actions={
          <AddRecord
            title="Новый контрагент"
            action={createCounterparty}
            submitLabel="Добавить контрагента"
            label="Новый контрагент"
            fields={[
              { name: "name", label: "Название", placeholder: "ООО Ромашка", required: true },
              { name: "inn", label: "ИНН", placeholder: "301234567", required: true },
              {
                name: "kind",
                label: "Тип",
                type: "select",
                defaultValue: "client",
                options: [
                  { value: "client", label: "Клиент" },
                  { value: "supplier", label: "Поставщик" },
                  { value: "partner", label: "Партнёр" },
                ],
              },
              { name: "phone", label: "Телефон", placeholder: "+998 90 000 00 00" },
              { name: "email", label: "Email", type: "email", placeholder: "mail@company.uz" },
            ]}
          />
        }
      />

      <DataTable columns={columns} rows={counterparties} empty="Контрагентов пока нет" />
    </>
  );
}
