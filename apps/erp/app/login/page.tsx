import { redirect } from "next/navigation";
import { Card } from "@tesera/ui";
import { getCurrentUser } from "@/src/tesera/session";
import { LoginForm } from "@/src/ui/LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/dashboard");

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#141824] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="text-3xl font-bold tracking-[0.12em] text-white">TESERA</div>
          <p className="mt-2 text-sm text-slate-400">Вход в систему</p>
        </div>

        <Card>
          <div className="p-6">
            <LoginForm />
          </div>
        </Card>

        <p className="mt-6 text-center text-xs text-slate-500">
          Демо-доступ: malik / tesera123
        </p>
      </div>
    </div>
  );
}
