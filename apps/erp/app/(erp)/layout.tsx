import type { ReactNode } from "react";
import { nav } from "@/src/tesera/registry";
import { Sidebar } from "@/src/ui/Sidebar";

// The ERP reads live in-memory engine state, so render every page per-request
// instead of statically prerendering it at build time.
export const dynamic = "force-dynamic";

export default function ErpLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar items={nav} />
      <main className="min-w-0 flex-1 overflow-y-auto px-8 py-10">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
