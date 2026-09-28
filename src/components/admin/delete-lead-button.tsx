"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteLeadAction } from "@/app/admin/(dashboard)/leads/actions";

type DeleteLeadButtonProps = {
  leadId: string;
};

export function DeleteLeadButton({ leadId }: DeleteLeadButtonProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (
      !window.confirm(
        "Vill du permanent ta bort den här förfrågan? Det går inte att ångra.",
      )
    ) {
      return;
    }

    setError("");
    startTransition(async () => {
      const result = await deleteLeadAction(leadId);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      router.push("/admin/leads");
      router.refresh();
    });
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        className="rounded-full border border-red-200 px-5 py-3 text-sm font-semibold text-red-700 transition hover:border-red-400 hover:bg-red-50 disabled:opacity-60"
      >
        {isPending ? "Tar bort..." : "Ta bort förfrågan"}
      </button>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
