import { NextResponse } from "next/server";
import { getDefaultAvailabilityFallback } from "@/lib/db/weekly-availability";
import { listAvailableTimes } from "@/lib/db/bookings";
import { WEB_BOOKING_SERVICE_SLUG } from "@/lib/booking";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Ogiltigt datum." }, { status: 400 });
  }

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ times: getDefaultAvailabilityFallback(date) });
  }

  try {
    const times = await listAvailableTimes(WEB_BOOKING_SERVICE_SLUG, date);
    return NextResponse.json({
      times: times.length > 0 ? times : getDefaultAvailabilityFallback(date),
    });
  } catch {
    return NextResponse.json({ times: getDefaultAvailabilityFallback(date) });
  }
}
