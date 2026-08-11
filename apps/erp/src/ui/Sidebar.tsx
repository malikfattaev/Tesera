"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  FolderKanban,
  LayoutDashboard,
  Settings,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { Avatar, cn } from "@tesera/ui";
import type { NavItem } from "@/src/tesera/registry";

const ICONS: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  wallet: Wallet,
  users: Users,
  projects: FolderKanban,
  reports: BarChart3,
  book: BookOpen,
  settings: Settings,
};

export function Sidebar({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <aside className="flex w-[264px] shrink-0 flex-col bg-[#141824] text-slate-300">
      <div className="px-6 pb-5 pt-8 text-center">
        <span className="text-3xl font-bold tracking-[0.12em] text-white">
          TESERA
        </span>
      </div>

      <div className="mx-8 border-t border-white/10" />

      <nav className="flex-1 space-y-1 px-4 py-6">
        {items.map((item) => {
          const Icon = ICONS[item.icon] ?? LayoutDashboard;
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition",
                active
                  ? "bg-[#7c3aed] text-white"
                  : "text-slate-300 hover:bg-white/5 hover:text-white",
              )}
            >
              <Icon className="h-[18px] w-[18px]" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mx-8 border-t border-white/10" />

      <div className="flex items-center gap-3 px-5 py-4">
        <Avatar name="Малик Фаттаев" />
        <div className="min-w-0">
          <div className="truncate text-sm font-medium text-white">
            Малик Фаттаев
          </div>
          <div className="truncate text-xs text-slate-400">Основатель</div>
        </div>
      </div>
    </aside>
  );
}
