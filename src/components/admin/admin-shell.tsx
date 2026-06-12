"use client";

import { useState } from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopBar } from "@/components/admin/admin-topbar";
import type { TeamProfile } from "@/lib/admin/auth";

type AdminShellProps = {
  profile: TeamProfile;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

export function AdminShell({
  profile,
  title,
  subtitle,
  children,
}: AdminShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#f3f0ea] text-green">
      <div className="hidden lg:flex">
        <AdminSidebar
          profile={profile}
          collapsed={collapsed}
          onToggle={() => setCollapsed((value) => !value)}
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

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopBar
          profile={profile}
          title={title}
          subtitle={subtitle}
          onMenuClick={() => setMobileOpen(true)}
        />
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
