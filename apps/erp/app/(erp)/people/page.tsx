import { Badge, PageHeader, StatCard, type Column } from "@tesera/ui";
import { getApp } from "@/src/tesera/engine";
import { Department, Employee, Position } from "@/src/tesera/modules/people";
import { createEmployee } from "@/src/tesera/actions";
import { formatDate, isoDate, money } from "@/src/tesera/format";
import type { TableParams } from "@/src/tesera/table";
import { AddRecord } from "@/src/ui/AddRecord";
import { DataPanel } from "@/src/ui/DataPanel";
import type { FormFieldSpec } from "@/src/ui/RecordForm";
import { RowActions } from "@/src/ui/RowActions";

export default async function PeoplePage({
  searchParams,
}: {
  searchParams: TableParams;
}) {
  const app = await getApp();
  const [employees, positions, departments] = await Promise.all([
    app.repo(Employee).list({ orderBy: { field: "fullName", direction: "asc" } }),
    app.repo(Position).list({ orderBy: { field: "name", direction: "asc" } }),
    app.repo(Department).list({ orderBy: { field: "name", direction: "asc" } }),
  ]);

  const positionName = (id: string) => positions.find((p) => p.id === id)?.name ?? "—";
  const departmentName = (id: string) => departments.find((d) => d.id === id)?.name ?? "—";
  const payroll = employees.filter((e) => e.active).reduce((s, e) => s + e.salary, 0);

  const employeeFields = (employee?: (typeof employees)[number]): FormFieldSpec[] => [
    {
      name: "fullName",
      label: "ФИО",
      placeholder: "Имя Фамилия",
      required: true,
      defaultValue: employee?.fullName,
    },
    {
      name: "positionId",
      label: "Должность",
      type: "select",
      required: true,
      defaultValue: employee?.positionId,
      options: positions.map((p) => ({ value: p.id, label: p.name })),
    },
    {
      name: "departmentId",
      label: "Отдел",
      type: "select",
      required: true,
      defaultValue: employee?.departmentId,
      options: departments.map((d) => ({ value: d.id, label: d.name })),
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      placeholder: "name@tesera.dev",
      defaultValue: employee?.email,
    },
    {
      name: "salary",
      label: "Оклад",
      type: "number",
      step: "500000",
      placeholder: "0",
      defaultValue: employee ? String(employee.salary) : undefined,
    },
    {
      name: "hiredAt",
      label: "Дата найма",
      type: "date",
      defaultValue: employee?.hiredAt ? isoDate(new Date(employee.hiredAt)) : undefined,
    },
  ];

  const columns: Column<(typeof employees)[number]>[] = [
    {
      key: "fullName",
      header: "Сотрудник",
      value: (e) => e.fullName,
      render: (e) => <span className="font-medium text-ink">{e.fullName}</span>,
    },
    { key: "position", header: "Должность", value: (e) => positionName(e.positionId), render: (e) => positionName(e.positionId) },
    { key: "department", header: "Отдел", value: (e) => departmentName(e.departmentId), render: (e) => departmentName(e.departmentId) },
    { key: "email", header: "Email", value: (e) => e.email ?? "", render: (e) => e.email ?? "—" },
    { key: "salary", header: "Оклад", align: "right", value: (e) => e.salary, render: (e) => money(e.salary) },
    {
      key: "active",
      header: "Статус",
      value: (e) => (e.active ? "Активен" : "Неактивен"),
      render: (e) =>
        e.active ? <Badge tone="green">Активен</Badge> : <Badge tone="red">Неактивен</Badge>,
    },
    {
      key: "actions",
      header: "Действия",
      align: "right",
      className: "w-28",
      render: (e) => (
        <RowActions
          entity="employee"
          id={e.id}
          title={e.fullName}
          fields={employeeFields(e)}
          details={[
            { label: "ФИО", value: e.fullName },
            { label: "Должность", value: positionName(e.positionId) },
            { label: "Отдел", value: departmentName(e.departmentId) },
            { label: "Email", value: e.email ?? "—" },
            { label: "Оклад", value: money(e.salary) },
            { label: "Дата найма", value: e.hiredAt ? formatDate(e.hiredAt) : "—" },
          ]}
        />
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Сотрудники"
        subtitle="Команда компании"
        actions={
          <AddRecord
            title="Новый сотрудник"
            action={createEmployee}
            submitLabel="Добавить сотрудника"
            label="Новый сотрудник"
            fields={employeeFields()}
          />
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Сотрудников" value={employees.length} />
        <StatCard label="Активных" value={employees.filter((e) => e.active).length} />
        <StatCard label="ФОТ в месяц" value={money(payroll)} />
      </div>

      <div className="mt-6">
        <DataPanel
          columns={columns}
          rows={employees}
          params={searchParams}
          filename="employees"
          empty="Сотрудников пока нет"
        />
      </div>
    </>
  );
}
