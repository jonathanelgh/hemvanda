"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { clearActiveBookingsAction } from "@/app/admin/(dashboard)/bookings/actions";

export function ClearActiveBookingsButton() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleClear() {
    if (
      !window.confirm(
        "Vill du permanent ta bort alla aktiva bokningar (inskickade, kontaktade och bekräftade)? Det går inte att ångra.",
      )
    ) {
      return;
    }

    setError("");
    setMessage("");
    startTransition(async () => {
      const result = await clearActiveBookingsAction();

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setMessage(`Rensade ${result.deleted ?? 0} aktiva bokningar.`);
      router.refresh();
    });
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleClear}
        disabled={isPending}
        className="rounded-full border border-red-200 px-5 py-3 text-sm font-semibold text-red-700 transition hover:border-red-400 hover:bg-red-50 disabled:opacity-60"
      >
        {isPending ? "Rensar..." : "Rensa aktiva bokningar"}
      </button>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      {message ? <p className="text-sm text-green">{message}</p> : null}
    </div>
  );
}
