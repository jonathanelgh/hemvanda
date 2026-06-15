"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function CustomerSignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={loading}
      className="rounded-full border border-green/15 px-5 py-3 text-sm font-semibold text-green transition hover:border-gold hover:text-gold disabled:opacity-60"
    >
      {loading ? "Loggar ut..." : "Logga ut"}
    </button>
  );
}
