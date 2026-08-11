"use client";
import { useRef } from "react";
import { Button, Field, Input, Select } from "@tesera/ui";
import { createCounterparty } from "@/src/tesera/actions";

export function AddCounterpartyForm() {
  const formRef = useRef<HTMLFormElement>(null);
  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await createCounterparty(formData);
        formRef.current?.reset();
      }}
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      <Field label="Название">
        <Input name="name" placeholder="Компания или человек" required />
      </Field>
      <Field label="Тип">
        <Select name="kind" defaultValue="client">
          <option value="client">Клиент</option>
          <option value="supplier">Поставщик</option>
          <option value="partner">Партнёр</option>
        </Select>
      </Field>
      <Field label="Телефон">
        <Input name="phone" placeholder="+998 ..." />
      </Field>
      <Field label="Email">
        <Input type="email" name="email" placeholder="name@example.com" />
      </Field>
      <Field label="Заметка">
        <Input name="note" placeholder="Комментарий" />
      </Field>
      <div className="flex items-end lg:col-span-3">
        <Button type="submit">Добавить контрагента</Button>
      </div>
    </form>
  );
}
