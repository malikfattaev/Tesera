import { EmptyState, PageHeader } from "@tesera/ui";

export function ComingSoon({ title }: { title: string }) {
  return (
    <>
      <PageHeader title={title} subtitle="Модуль в разработке" />
      <EmptyState
        title="Скоро"
        hint="Этот раздел появится в следующих версиях движка"
      />
    </>
  );
}
