"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AdminIcon } from "@/components/admin/admin-icon";
import { getNavItemsForRole } from "@/lib/admin/navigation";
import type { TeamProfile } from "@/lib/admin/auth";

type AdminSidebarProps = {
  profile: TeamProfile;
  collapsed: boolean;
  onToggle: () => void;
};

export function AdminSidebar({ profile, collapsed, onToggle }: AdminSidebarProps) {
  const pathname = usePathname();
  const items = getNavItemsForRole(profile.role);

  return (
    <aside
      className={`flex h-full shrink-0 flex-col border-r border-white/10 bg-ink text-white transition-all duration-300 ${
        collapsed ? "w-[4.5rem]" : "w-64"
      }`}
    >
      <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
        {!collapsed ? (
          <div>
            <p className="font-display text-xl leading-none">HemVända</p>
            <p className="mt-1 text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-gold">
              CRM
            </p>
          </div>
        ) : (
          <span className="mx-auto font-display text-lg text-gold">H</span>
        )}
        <button
          type="button"
          onClick={onToggle}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-white/70 transition hover:bg-white/10 hover:text-white"
          aria-label={collapsed ? "Expandera sidomeny" : "Minimera sidomeny"}
        >
          <AdminIcon
            name="chevron"
            className={`h-4 w-4 transition-transform ${collapsed ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {items.map((item) => {
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${
                active
                  ? "bg-gold/20 text-gold"
                  : "text-white/70 hover:bg-white/8 hover:text-white"
              }`}
            >
              <AdminIcon name={item.icon} className="h-5 w-5 shrink-0" />
              {!collapsed ? <span>{item.label}</span> : null}
            </Link>
          );
        })}
      </nav>

      {!collapsed ? (
        <div className="border-t border-white/10 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-white/40">Roll</p>
          <p className="mt-1 text-sm font-semibold capitalize text-white">
            {profile.role === "admin" ? "Administratör" : "Personal"}
          </p>
        </div>
      ) : null}
    </aside>
  );
}
