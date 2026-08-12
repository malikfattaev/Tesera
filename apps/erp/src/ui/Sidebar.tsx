"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BarChart3,
  ChevronDown,
  FolderKanban,
  LayoutDashboard,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { Avatar, cn } from "@tesera/ui";
import type { NavItem, NavLink } from "@/src/tesera/registry";

const ICONS: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  wallet: Wallet,
  users: Users,
  projects: FolderKanban,
  reports: BarChart3,
};

const rowClass =
  "flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition";

/** Every href in the nav tree, used to resolve the most specific match. */
function allHrefs(items: NavItem[]): string[] {
  return items.flatMap((item) => [
    ...(item.href ? [item.href] : []),
    ...(item.children ?? []).map((child) => child.href),
  ]);
}

/**
 * A link is active when it is the *longest* matching prefix of the current
 * path, so "/people" does not light up while "/people/departments" is open.
 */
function makeIsActive(pathname: string, items: NavItem[]) {
  const matches = allHrefs(items).filter(
    (href) => pathname === href || pathname.startsWith(href + "/"),
  );
  const best = matches.sort((a, b) => b.length - a.length)[0];
  return (href: string) => href === best;
}

/** A collapsible module: header row plus its sections, animated open/closed. */
function NavGroup({
  item,
  isActive,
}: {
  item: NavItem;
  isActive: (href: string) => boolean;
}) {
  const children = item.children ?? [];
  // A group starts open when the current page lives inside it.
  const containsCurrent = children.some((child) => isActive(child.href));
  const [open, setOpen] = useState(containsCurrent);
  const Icon = ICONS[item.icon] ?? LayoutDashboard;

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className={cn(
          rowClass,
          containsCurrent
            ? "text-white"
            : "text-slate-300 hover:bg-white/5 hover:text-white",
        )}
      >
        <Icon className="h-[18px] w-[18px] shrink-0" />
        <span className="flex-1 text-left">{item.label}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-slate-400 transition-transform duration-300",
            open && "rotate-180",
          )}
        />
      </button>

      {/* grid-rows 0fr → 1fr animates to the content's natural height */}
      <div
        className={cn(
          "grid transition-all duration-300 ease-out",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          <div className="mt-1 space-y-0.5 border-l border-white/10 pl-3 ml-[26px]">
            {children.map((child: NavLink) => (
              <Link
                key={child.href}
                href={child.href}
                className={cn(
                  "block rounded-lg px-3 py-2 text-sm transition",
                  isActive(child.href)
                    ? "bg-[#7c3aed] text-white"
                    : "text-slate-400 hover:bg-white/5 hover:text-white",
                )}
              >
                {child.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Sidebar({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const isActive = makeIsActive(pathname, items);
  return (
    <aside className="flex w-[264px] shrink-0 flex-col bg-[#141824] text-slate-300">
      <div className="px-6 pb-5 pt-8 text-center">
        <span className="text-3xl font-bold tracking-[0.12em] text-white">
          TESERA
        </span>
      </div>

      <div className="mx-8 border-t border-white/10" />

      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto px-4 py-6">
        {items.map((item) => {
          if (item.children?.length) {
            return <NavGroup key={item.label} item={item} isActive={isActive} />;
          }
          const Icon = ICONS[item.icon] ?? LayoutDashboard;
          const href = item.href ?? "/";
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                rowClass,
                isActive(href)
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
