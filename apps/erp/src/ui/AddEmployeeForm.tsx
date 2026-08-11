"use client";
import { useRef } from "react";
import { Button, Field, Input, Select } from "@tesera/ui";
import { createEmployee } from "@/src/tesera/actions";

export function AddEmployeeForm() {
  const formRef = useRef<HTMLFormElement>(null);
  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await createEmployee(formData);
        formRef.current?.reset();
      }}
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      <Field label="ФИО">
        <Input name="fullName" placeholder="Имя Фамилия" required />
      </Field>
      <Field label="Должность">
        <Input name="position" placeholder="Например, Engineer" required />
      </Field>
      <Field label="Отдел">
        <Select name="department" defaultValue="engineering">
          <option value="management">Руководство</option>
          <option value="engineering">Разработка</option>
          <option value="sales">Продажи</option>
          <option value="finance">Финансы</option>
          <option value="operations">Операции</option>
        </Select>
      </Field>
      <Field label="Email">
        <Input type="email" name="email" placeholder="name@tesera.dev" />
      </Field>
      <Field label="Оклад">
        <Input type="number" name="salary" min="0" step="500000" placeholder="0" />
      </Field>
      <Field label="Дата найма">
        <Input type="date" name="hiredAt" />
      </Field>
      <div className="flex items-end lg:col-span-3">
        <Button type="submit">Добавить сотрудника</Button>
      </div>
    </form>
  );
}
