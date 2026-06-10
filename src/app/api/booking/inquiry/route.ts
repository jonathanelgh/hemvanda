import { normalizeZipCode } from "@/lib/coverage";
import { isWebBookingService } from "@/lib/booking";
import { getService } from "@/lib/services";

export const dynamic = "force-dynamic";

type InquiryBookingPayload = {
  tjanst?: string;
  postnummer?: string;
  kommun?: string;
  name?: string;
  phone?: string;
  email?: string;
  timeframe?: string;
  message?: string;
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  let payload: InquiryBookingPayload;

  try {
    payload = (await request.json()) as InquiryBookingPayload;
  } catch {
    return Response.json({ error: "Ogiltig förfrågan." }, { status: 400 });
  }

  const service = payload.tjanst ? getService(payload.tjanst) : undefined;

  if (!service) {
    return Response.json({ error: "Ogiltig tjänst." }, { status: 400 });
  }

  if (isWebBookingService(service.slug)) {
    return Response.json(
      { error: "Städning bokas via webbflödet." },
      { status: 400 },
    );
  }

  if (!normalizeZipCode(payload.postnummer ?? "")) {
    return Response.json({ error: "Ogiltigt postnummer." }, { status: 400 });
  }

  if (!payload.kommun?.trim()) {
    return Response.json({ error: "Ort saknas." }, { status: 400 });
  }

  if (!payload.name?.trim() || !payload.phone?.trim() || !payload.email?.trim()) {
    return Response.json({ error: "Kontaktuppgifter saknas." }, { status: 400 });
  }

  if (!isValidEmail(payload.email.trim())) {
    return Response.json({ error: "Ogiltig e-postadress." }, { status: 400 });
  }

  if (!payload.message?.trim() || payload.message.trim().length < 10) {
    return Response.json(
      { error: "Beskriv uppdraget med minst 10 tecken." },
      { status: 400 },
    );
  }

  return Response.json({
    ok: true,
    inquiryId: `inquiry-${Date.now()}`,
    message: "Förfrågan är registrerad.",
  });
}
