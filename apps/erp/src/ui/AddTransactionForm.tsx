"use client";
import { useRef } from "react";
import { Button, Field, Input, Select } from "@tesera/ui";
import { createTransaction } from "@/src/tesera/actions";

export function AddTransactionForm({
  accounts,
}: {
  accounts: { id: string; name: string }[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await createTransaction(formData);
        formRef.current?.reset();
      }}
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      <Field label="Дата">
        <Input type="date" name="date" defaultValue="2026-08-12" required />
      </Field>
      <Field label="Направление">
        <Select name="direction" defaultValue="out">
          <option value="in">Приход</option>
          <option value="out">Расход</option>
        </Select>
      </Field>
      <Field label="Сумма">
        <Input type="number" name="amount" min="0" step="1000" placeholder="0" required />
      </Field>
      <Field label="Категория">
        <Select name="category" defaultValue="office">
          <option value="sales">Продажи</option>
          <option value="salary">ФОТ (зарплата)</option>
          <option value="office">Офисные расходы</option>
          <option value="tax">Налоги</option>
          <option value="other">Прочее</option>
        </Select>
      </Field>
      <Field label="Счёт">
        <Select name="accountId" defaultValue={accounts[0]?.id} required>
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Контрагент">
        <Input name="counterparty" placeholder="Например, клиент" />
      </Field>
      <div className="flex items-end sm:col-span-2 lg:col-span-3">
        <Button type="submit">Добавить операцию</Button>
      </div>
    </form>
  );
}
