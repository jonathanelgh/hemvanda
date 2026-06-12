import { NextResponse } from "next/server";
import { listAvailableTimes } from "@/lib/db/bookings";
import { WEB_BOOKING_SERVICE_SLUG } from "@/lib/booking";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ times: ["08:00", "13:00"] });
  }

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Ogiltigt datum." }, { status: 400 });
  }

  try {
    const times = await listAvailableTimes(WEB_BOOKING_SERVICE_SLUG, date);
    return NextResponse.json({ times });
  } catch {
    return NextResponse.json({ times: ["08:00", "13:00"] });
  }
}
