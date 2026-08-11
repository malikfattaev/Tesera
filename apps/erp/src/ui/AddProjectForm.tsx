"use client";
import { useRef } from "react";
import { Button, Field, Input, Select } from "@tesera/ui";
import { createProject } from "@/src/tesera/actions";

export function AddProjectForm() {
  const formRef = useRef<HTMLFormElement>(null);
  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await createProject(formData);
        formRef.current?.reset();
      }}
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      <Field label="Название">
        <Input name="name" placeholder="Например, Портал для школы" required />
      </Field>
      <Field label="Клиент">
        <Input name="client" placeholder="Название клиента" />
      </Field>
      <Field label="Статус">
        <Select name="status" defaultValue="planning">
          <option value="planning">Планирование</option>
          <option value="active">В работе</option>
          <option value="on_hold">На паузе</option>
          <option value="done">Завершён</option>
        </Select>
      </Field>
      <Field label="Бюджет">
        <Input type="number" name="budget" min="0" step="1000000" placeholder="0" />
      </Field>
      <Field label="Ответственный">
        <Input name="lead" placeholder="Имя" />
      </Field>
      <Field label="Дедлайн">
        <Input type="date" name="deadline" />
      </Field>
      <div className="flex items-end lg:col-span-3">
        <Button type="submit">Добавить проект</Button>
      </div>
    </form>
  );
}
