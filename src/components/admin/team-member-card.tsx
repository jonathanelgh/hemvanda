"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  setTeamMemberActiveAction,
  updateTeamMemberAction,
} from "@/app/admin/team/actions";
import type { TeamMemberRow } from "@/lib/admin/queries";
import { formatPhoneDisplay } from "@/lib/phone";

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
  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(member.full_name ?? "");
  const [phone, setPhone] = useState(member.phone ?? "");
  const [jobTitle, setJobTitle] = useState(member.job_title ?? "");

  const isSelf = member.user_id === currentUserId;
  const displayPhone = member.phone ? formatPhoneDisplay(member.phone) : null;

  function handleToggle() {
    setError("");
    setMessage("");

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

  function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    const formData = new FormData();
    formData.set("teamMemberId", member.id);
    formData.set("fullName", fullName);
    formData.set("phone", phone);
    formData.set("jobTitle", jobTitle);

    startTransition(async () => {
      const result = await updateTeamMemberAction(formData);

      if (!result.ok) {
        setError(result.error ?? "Något gick fel.");
        return;
      }

      setMessage(result.message ?? "Sparat.");
      setEditing(false);
      router.refresh();
    });
  }

  return (
    <article className="rounded-2xl border border-green/10 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          {editing ? (
            <form onSubmit={handleSave} className="space-y-3">
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-green/50">
                  Namn
                </span>
                <input
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  required
                  className="mt-1 w-full rounded-xl border border-green/15 px-3 py-2 text-sm outline-none focus:border-gold"
                />
              </label>
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-green/50">
                  Telefon
                </span>
                <input
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  required
                  type="tel"
                  className="mt-1 w-full rounded-xl border border-green/15 px-3 py-2 text-sm outline-none focus:border-gold"
                />
              </label>
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-green/50">
                  Jobbtitel
                </span>
                <input
                  value={jobTitle}
                  onChange={(event) => setJobTitle(event.target.value)}
                  className="mt-1 w-full rounded-xl border border-green/15 px-3 py-2 text-sm outline-none focus:border-gold"
                />
              </label>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={pending}
                  className="rounded-full bg-green px-4 py-2 text-xs font-bold text-white disabled:opacity-60"
                >
                  {pending ? "Sparar..." : "Spara"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setFullName(member.full_name ?? "");
                    setPhone(member.phone ?? "");
                    setJobTitle(member.job_title ?? "");
                    setError("");
                  }}
                  className="rounded-full border border-green/15 px-4 py-2 text-xs font-bold text-green"
                >
                  Avbryt
                </button>
              </div>
            </form>
          ) : (
            <>
              <h2 className="font-display text-2xl text-green">
                {member.full_name || "Namnlös"}
              </h2>
              <p className="mt-1 text-sm text-muted">{member.email}</p>
              <p className="mt-1 text-sm text-muted">
                {displayPhone || "Inget telefonnummer"}
              </p>
              {member.job_title ? (
                <p className="mt-2 text-sm text-green">{member.job_title}</p>
              ) : null}
            </>
          )}
        </div>
        <span className="rounded-full bg-ivory px-3 py-1 text-xs font-semibold capitalize text-green">
          {member.role === "admin" ? "Admin" : "Personal"}
        </span>
      </div>

      {!editing ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted">
            Status: {member.is_active ? "Aktiv" : "Inaktiv"}
          </p>

          <div className="flex flex-wrap gap-2">
            {canManage ? (
              <button
                type="button"
                onClick={() => {
                  setEditing(true);
                  setMessage("");
                  setError("");
                }}
                className="rounded-full border border-green/15 px-4 py-2 text-xs font-bold text-green transition hover:border-green/30"
              >
                Redigera
              </button>
            ) : null}

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
        </div>
      ) : null}

      {message ? <p className="mt-3 text-sm text-green">{message}</p> : null}
      {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
    </article>
  );
}
