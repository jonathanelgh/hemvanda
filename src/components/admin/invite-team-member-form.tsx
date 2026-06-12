"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { inviteTeamMemberAction } from "@/app/admin/team/actions";

export function InviteTeamMemberForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const result = await inviteTeamMemberAction(formData);

    if (!result.ok) {
      setError(result.error ?? "Något gick fel.");
      setLoading(false);
      return;
    }

    setMessage(result.message ?? "Teammedlem tillagd.");
    event.currentTarget.reset();
    setLoading(false);
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-green/10 bg-white p-6 shadow-sm"
    >
      <h2 className="font-display text-2xl text-green">Bjud in teammedlem</h2>
      <p className="mt-2 text-sm leading-7 text-muted">
        Skapar ett nytt konto med e-post och lösenord, eller ger teamåtkomst till en
        befintlig användare med samma e-post.
      </p>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <label className="block md:col-span-2">
          <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-green/60">
            Namn
          </span>
          <input
            name="fullName"
            type="text"
            required
            className="h-12 w-full rounded-xl border border-green/15 bg-white px-4 text-green outline-none"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-green/60">
            E-post
          </span>
          <input
            name="email"
            type="email"
            required
            className="h-12 w-full rounded-xl border border-green/15 bg-white px-4 text-green outline-none"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-green/60">
            Lösenord
          </span>
          <input
            name="password"
            type="password"
            minLength={8}
            className="h-12 w-full rounded-xl border border-green/15 bg-white px-4 text-green outline-none"
            placeholder="Minst 8 tecken för nya konton"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-green/60">
            Roll
          </span>
          <select
            name="role"
            defaultValue="staff"
            className="h-12 w-full rounded-xl border border-green/15 bg-white px-4 text-green outline-none"
          >
            <option value="staff">Personal</option>
            <option value="admin">Administratör</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-green/60">
            Jobbtitel
          </span>
          <input
            name="jobTitle"
            type="text"
            className="h-12 w-full rounded-xl border border-green/15 bg-white px-4 text-green outline-none"
            placeholder="Valfritt"
          />
        </label>
      </div>

      {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}
      {message ? <p className="mt-4 text-sm text-green">{message}</p> : null}

      <button
        type="submit"
        disabled={loading}
        className="mt-6 h-12 rounded-full bg-green px-6 text-sm font-bold text-white transition hover:bg-ink disabled:opacity-60"
      >
        {loading ? "Sparar..." : "Bjud in"}
      </button>
    </form>
  );
}
