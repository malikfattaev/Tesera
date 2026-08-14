import { redirect } from "next/navigation";
import { Badge, Card, CardHeader, PageHeader } from "@tesera/ui";
import { SECTION_LABELS } from "@/src/tesera/modules/admin";
import { getCurrentUser } from "@/src/tesera/session";
import {
  MenuSettingsForm,
  ProfileForm,
  SignOutButton,
} from "@/src/ui/SettingsForms";

export default async function SettingsPage() {
  const current = await getCurrentUser();
  if (!current) redirect("/login");

  const allowed: string[] = current.role?.sections ?? [];
  const sections = allowed.map((key) => ({
    key,
    label: SECTION_LABELS[key] ?? key,
  }));

  return (
    <>
      <PageHeader
        title="Настройки"
        subtitle="Профиль, меню и выход из системы"
        actions={<SignOutButton />}
      />

      <Card>
        <CardHeader
          title="Профиль"
          action={<Badge tone="brand">{current.role?.name ?? "Без роли"}</Badge>}
        />
        <div className="p-5">
          <ProfileForm
            fullName={current.user.fullName}
            login={current.user.login}
          />
        </div>
      </Card>

      <Card className="mt-6">
        <CardHeader
          title="Разделы в меню"
          action={
            <span className="text-xs text-slate-400">
              Доступно по роли: {sections.length}
            </span>
          }
        />
        <div className="p-5">
          {sections.length ? (
            <>
              <p className="mb-4 text-sm text-slate-500">
                Отметьте разделы, которые хотите видеть в боковом меню. Скрытый раздел
                остаётся доступным по прямой ссылке, если роль его разрешает.
              </p>
              <MenuSettingsForm
                sections={sections}
                hidden={current.user.hiddenSections ?? []}
              />
            </>
          ) : (
            <p className="text-sm text-slate-500">
              Роль не даёт доступа ни к одному разделу. Обратитесь к администратору.
            </p>
          )}
        </div>
      </Card>
    </>
  );
}
