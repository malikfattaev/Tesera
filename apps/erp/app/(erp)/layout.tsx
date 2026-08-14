import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { nav } from "@/src/tesera/registry";
import { getCurrentUser } from "@/src/tesera/session";
import { Sidebar } from "@/src/ui/Sidebar";

// The ERP reads live engine state, so render every page per-request instead of
// statically prerendering it at build time.
export const dynamic = "force-dynamic";

export default async function ErpLayout({ children }: { children: ReactNode }) {
  const current = await getCurrentUser();
  if (!current) redirect("/login");

  // A section shows when the role allows it and the user has not hidden it.
  const allowed: string[] = current.role?.sections ?? [];
  const hidden: string[] = current.user.hiddenSections ?? [];
  const items = nav.filter(
    (item) => allowed.includes(item.section) && !hidden.includes(item.section),
  );

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        items={items}
        user={{ name: current.user.fullName, role: current.role?.name ?? "Без роли" }}
      />
      <main className="min-w-0 flex-1 overflow-y-auto px-8 py-10">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
