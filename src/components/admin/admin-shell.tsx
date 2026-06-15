"use client";

import { useEffect, useState } from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopBar } from "@/components/admin/admin-topbar";
import type { TeamProfile } from "@/lib/admin/auth";

const SIDEBAR_COLLAPSED_KEY = "hemvanda-admin-sidebar-collapsed";

type AdminShellProps = {
  profile: TeamProfile;
  title: string;
  children: React.ReactNode;
};

export function AdminShell({
  profile,
  title,
  children,
}: AdminShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    if (stored === "true") {
      setCollapsed(true);
    }
  }, []);

  function handleToggleCollapsed() {
    setCollapsed((value) => {
      const next = !value;
      window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
      return next;
    });
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#f3f0ea] text-green">
      <div className="hidden h-screen shrink-0 lg:flex">
        <AdminSidebar
          profile={profile}
          collapsed={collapsed}
          onToggle={handleToggleCollapsed}
        />
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-ink/40"
            aria-label="Stäng meny"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative h-full w-64">
            <AdminSidebar
              profile={profile}
              collapsed={false}
              onToggle={() => setMobileOpen(false)}
            />
          </div>
        </div>
      ) : null}

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <AdminTopBar
          profile={profile}
          title={title}
          onMenuClick={() => setMobileOpen(true)}
        />
        <main className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
