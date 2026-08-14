"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@tesera/ui";

export interface SegmentedNavItem {
  href: string;
  label: string;
  /** Optional count shown next to the label. */
  count?: number;
}

/**
 * A pill-style segmented control for switching between sibling screens.
 * Each segment is a real link, so screens stay server-rendered and shareable.
 */
export function SegmentedNav({ items }: { items: SegmentedNavItem[] }) {
  const pathname = usePathname();
  return (
    <div className="inline-flex rounded-xl bg-slate-100 p-1">
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition",
              active
                ? "bg-white text-ink shadow-sm"
                : "text-slate-500 hover:text-ink",
            )}
          >
            {item.label}
            {item.count !== undefined && (
              <span
                className={cn(
                  "rounded-md px-1.5 py-0.5 text-xs tabular-nums",
                  active ? "bg-slate-100 text-slate-500" : "bg-slate-200/70 text-slate-500",
                )}
              >
                {item.count}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
