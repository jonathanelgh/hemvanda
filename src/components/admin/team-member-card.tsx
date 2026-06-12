"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setTeamMemberActiveAction } from "@/app/admin/team/actions";
import type { TeamMemberRow } from "@/lib/admin/queries";

type TeamMemberCardProps = {
  member: TeamMemberRow;
  currentUserId: string;
  canManage: boolean;
};

export function TeamMemberCard({
  member,
  currentUserId,
  canManage,
}: TeamMemberCardProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleToggle() {
    setError("");

    startTransition(async () => {
      const result = await setTeamMemberActiveAction(
        member.id,
        !member.is_active,
      );

      if (!result.ok) {
        setError(result.error ?? "Något gick fel.");
        return;
      }

      router.refresh();
    });
  }

  const isSelf = member.user_id === currentUserId;

  return (
    <article className="rounded-2xl border border-green/10 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl text-green">
            {member.full_name || "Namnlös"}
          </h2>
          <p className="mt-1 text-sm text-muted">{member.email}</p>
          {member.job_title ? (
            <p className="mt-2 text-sm text-green">{member.job_title}</p>
          ) : null}
        </div>
        <span className="rounded-full bg-ivory px-3 py-1 text-xs font-semibold capitalize text-green">
          {member.role === "admin" ? "Admin" : "Personal"}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          Status: {member.is_active ? "Aktiv" : "Inaktiv"}
        </p>

        {canManage && !isSelf ? (
          <button
            type="button"
            onClick={handleToggle}
            disabled={pending}
            className="rounded-full border border-green/15 px-4 py-2 text-xs font-bold text-green transition hover:border-green/30 disabled:opacity-60"
          >
            {pending
              ? "Sparar..."
              : member.is_active
                ? "Inaktivera"
                : "Aktivera"}
          </button>
        ) : null}
      </div>

      {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
    </article>
  );
}
