"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AdminIcon } from "@/components/admin/admin-icon";
import { signOutAction } from "@/app/admin/actions";
import type { TeamProfile } from "@/lib/admin/auth";

type AdminTopBarProps = {
  profile: TeamProfile;
  title: string;
  onMenuClick?: () => void;
};

export function AdminTopBar({
  profile,
  title,
  onMenuClick,
}: AdminTopBarProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const initials =
    profile.fullName
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ||
    profile.email?.slice(0, 2).toUpperCase() ||
    "HV";

  return (
    <header className="relative z-10 flex h-16 shrink-0 items-center justify-between border-b border-green/10 bg-card px-4 md:px-6">
      <div className="flex items-center gap-3">
        {onMenuClick ? (
          <button
            type="button"
            onClick={onMenuClick}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-green/10 text-green lg:hidden"
            aria-label="Öppna meny"
          >
            <AdminIcon name="menu" className="h-5 w-5" />
          </button>
        ) : null}
        <div>
          <h1 className="font-display text-2xl text-green">{title}</h1>
        </div>
      </div>

      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="flex items-center gap-3 rounded-full border border-green/10 bg-white py-1.5 pl-1.5 pr-4 transition hover:border-gold/40"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-green text-sm font-bold text-white">
            {initials}
          </span>
          <span className="hidden text-left sm:block">
            <span className="block text-sm font-semibold text-green">
              {profile.fullName || "Teammedlem"}
            </span>
            <span className="block text-xs text-muted">
              {profile.role === "admin" ? "Administratör" : "Personal"}
            </span>
          </span>
          <AdminIcon
            name="chevron"
            className={`hidden h-4 w-4 text-muted transition-transform sm:block ${open ? "-rotate-90" : "rotate-90"}`}
          />
        </button>

        {open ? (
          <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-green/10 bg-white shadow-[0_20px_50px_rgba(47,58,51,0.14)]">
            <div className="border-b border-green/10 px-4 py-3">
              <p className="text-sm font-semibold text-green">
                {profile.fullName || "Teammedlem"}
              </p>
              <p className="text-xs text-muted">{profile.email}</p>
            </div>
            <div className="p-2">
              <Link
                href="/admin/settings"
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-green transition hover:bg-ivory"
              >
                Inställningar
              </Link>
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-green transition hover:bg-ivory"
                >
                  <AdminIcon name="logout" className="h-4 w-4" />
                  Logga ut
                </button>
              </form>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}
