"use client";

import { useState } from "react";
import { BookingAvailabilitySettings } from "@/components/admin/booking-availability-settings";
import type { TeamProfile } from "@/lib/admin/auth";
import type { WeeklyAvailabilitySchedule } from "@/lib/booking-availability";

type SettingsTabsProps = {
  profile: TeamProfile;
  userEmail?: string | null;
  isAdmin: boolean;
  schedule: WeeklyAvailabilitySchedule | null;
};

type SettingsTab = "account" | "availability";

export function SettingsTabs({
  profile,
  userEmail,
  isAdmin,
  schedule,
}: SettingsTabsProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("account");

  const tabs: { id: SettingsTab; label: string; adminOnly?: boolean }[] = [
    { id: "account", label: "Konto" },
    { id: "availability", label: "Bokningstider", adminOnly: true },
  ];

  const visibleTabs = tabs.filter((tab) => !tab.adminOnly || isAdmin);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 border-b border-green/10">
        {visibleTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`-mb-px border-b-2 px-4 py-3 text-sm font-semibold transition ${
              activeTab === tab.id
                ? "border-gold text-green"
                : "border-transparent text-muted hover:text-green"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "account" ? (
        <div className="max-w-2xl rounded-2xl border border-green/10 bg-white p-6 shadow-sm">
          <dl className="space-y-5 text-sm">
            <div>
              <dt className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
                Namn
              </dt>
              <dd className="mt-1 font-semibold text-green">
                {profile.fullName || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
                E-post
              </dt>
              <dd className="mt-1 font-semibold text-green">
                {profile.email || userEmail || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
                Roll
              </dt>
              <dd className="mt-1 font-semibold capitalize text-green">
                {profile.role === "admin" ? "Administratör" : "Personal"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
                Jobbtitel
              </dt>
              <dd className="mt-1 font-semibold text-green">
                {profile.jobTitle || "—"}
              </dd>
            </div>
          </dl>
        </div>
      ) : null}

      {activeTab === "availability" && isAdmin && schedule ? (
        <BookingAvailabilitySettings initialSchedule={schedule} />
      ) : null}
    </div>
  );
}
