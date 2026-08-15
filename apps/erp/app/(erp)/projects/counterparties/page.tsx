import { Badge, PageHeader, type Column } from "@tesera/ui";
import { getApp } from "@/src/tesera/engine";
import { COUNTERPARTY_KIND_LABELS, Counterparty } from "@/src/tesera/modules/projects";
import { createCounterparty } from "@/src/tesera/actions";
import type { TableParams } from "@/src/tesera/table";
import { AddRecord } from "@/src/ui/AddRecord";
import { DataPanel } from "@/src/ui/DataPanel";
import type { FormFieldSpec } from "@/src/ui/RecordForm";
import { RowActions } from "@/src/ui/RowActions";

const KIND_TONES: Record<string, "brand" | "green" | "amber"> = {
  client: "green",
  supplier: "amber",
  partner: "brand",
};

export default async function CounterpartiesPage({
  searchParams,
}: {
  searchParams: TableParams;
}) {
  const app = await getApp();
  const counterparties = await app
    .repo(Counterparty)
    .list({ orderBy: { field: "name", direction: "asc" } });

  const counterpartyFields = (
    counterparty?: (typeof counterparties)[number],
  ): FormFieldSpec[] => [
    {
      name: "name",
      label: "Название",
      placeholder: "ООО Ромашка",
      required: true,
      defaultValue: counterparty?.name,
    },
    {
      name: "inn",
      label: "ИНН",
      placeholder: "301234567",
      required: true,
      defaultValue: counterparty?.inn,
    },
    {
      name: "kind",
      label: "Тип",
      type: "select",
      defaultValue: counterparty?.kind ?? "client",
      options: [
        { value: "client", label: "Клиент" },
        { value: "supplier", label: "Поставщик" },
        { value: "partner", label: "Партнёр" },
      ],
    },
    {
      name: "phone",
      label: "Телефон",
      placeholder: "+998 90 000 00 00",
      defaultValue: counterparty?.phone,
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      placeholder: "mail@company.uz",
      defaultValue: counterparty?.email,
    },
  ];

  const columns: Column<(typeof counterparties)[number]>[] = [
    {
      key: "name",
      header: "Название",
      value: (c) => c.name,
      render: (c) => <span className="font-medium text-ink">{c.name}</span>,
    },
    { key: "inn", header: "ИНН", value: (c) => c.inn, render: (c) => <span className="tabular-nums">{c.inn}</span> },
    {
      key: "kind",
      header: "Тип",
      value: (c) => COUNTERPARTY_KIND_LABELS[c.kind] ?? c.kind,
      render: (c) => (
        <Badge tone={KIND_TONES[c.kind] ?? "neutral"}>
          {COUNTERPARTY_KIND_LABELS[c.kind] ?? c.kind}
        </Badge>
      ),
    },
    { key: "phone", header: "Телефон", value: (c) => c.phone ?? "", render: (c) => c.phone ?? "—" },
    { key: "email", header: "Email", value: (c) => c.email ?? "", render: (c) => c.email ?? "—" },
    {
      key: "actions",
      header: "Действия",
      align: "right",
      className: "w-28",
      render: (c) => (
        <RowActions
          entity="counterparty"
          id={c.id}
          title={c.name}
          fields={counterpartyFields(c)}
          details={[
            { label: "Название", value: c.name },
            { label: "ИНН", value: c.inn },
            { label: "Тип", value: COUNTERPARTY_KIND_LABELS[c.kind] ?? c.kind },
            { label: "Телефон", value: c.phone ?? "—" },
            { label: "Email", value: c.email ?? "—" },
          ]}
        />
      ),
    },
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
            fields={counterpartyFields()}
          />
        }
      />

      <DataPanel
          columns={columns}
          rows={counterparties}
          params={searchParams}
          filename="counterparties"
          empty="Контрагентов пока нет"
        />
    </>
  );
}
