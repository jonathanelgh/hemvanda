import {
  cleaningFrequencyPlans,
  cleaningPropertyLabel,
  type CleaningFrequency,
  type CleaningPropertyType,
} from "@/lib/booking";
import { formatKr } from "@/lib/cleaning-pricing";
import {
  getEmailFrom,
  getInternalNotificationEmail,
  isEmailConfigured,
} from "@/lib/email/config";
import { getResendClient } from "@/lib/email/client";
import {
  emailButton,
  emailDetailsTable,
  emailHeading,
  emailParagraph,
  formatEmailAddress,
  formatEmailDate,
  formatEmailTime,
  wrapEmailHtml,
} from "@/lib/email/templates";
import { getService } from "@/lib/services";
import { SITE_URL } from "@/lib/seo";
import { createAdminClient } from "@/lib/supabase/admin";

type SendEmailInput = {
  to: string | string[];
  subject: string;
  html: string;
};

async function sendEmail(input: SendEmailInput) {
  if (!isEmailConfigured()) {
    return;
  }

  const resend = getResendClient();

  if (!resend) {
    return;
  }

  const { error } = await resend.emails.send({
    from: getEmailFrom(),
    to: input.to,
    subject: input.subject,
    html: input.html,
  });

  if (error) {
    throw new Error(error.message);
  }
}

async function sendEmailSafely(label: string, input: SendEmailInput) {
  try {
    await sendEmail(input);
  } catch (error) {
    console.error(`${label} failed:`, error);
  }
}

function serviceLabel(slug: string, propertyType?: CleaningPropertyType) {
  if (propertyType) {
    return cleaningPropertyLabel(propertyType) ?? getService(slug)?.title ?? slug;
  }

  return getService(slug)?.title ?? slug;
}

function frequencyLabel(frequency: CleaningFrequency) {
  const plan = cleaningFrequencyPlans.find((item) => item.value === frequency);

  if (plan) {
    return plan.label;
  }

  if (frequency === "storstadning") return "Storstäd";
  if (frequency === "flyttstadning") return "Flyttstäd";
  if (frequency === "fonster") return "Fönster";

  return frequency;
}

export type CleaningBookingEmailInput = {
  bookingId: string;
  serviceSlug: string;
  name: string;
  email: string;
  phone: string;
  postalCode: string;
  municipality: string;
  address?: string;
  squareMeters: number;
  frequency: CleaningFrequency;
  propertyType?: CleaningPropertyType;
  preferredDate?: string;
  preferredTime?: string;
  priceKr?: number | null;
  isConfirmed?: boolean;
};

export async function notifyCleaningBookingCreated(input: CleaningBookingEmailInput) {
  const service = serviceLabel(input.serviceSlug, input.propertyType);
  const priceText =
    input.priceKr != null && input.priceKr > 0 ? formatKr(input.priceKr) : null;

  const scheduleText =
    input.preferredDate && input.preferredTime
      ? `${formatEmailDate(input.preferredDate)} kl. ${formatEmailTime(input.preferredTime)}`
      : null;

  const customerRows = [
    { label: "Tjänst", value: service },
    { label: "Yta", value: `${input.squareMeters} kvm` },
    { label: "Frekvens", value: frequencyLabel(input.frequency) },
    ...(priceText ? [{ label: "Pris", value: priceText }] : []),
    ...(scheduleText ? [{ label: "Önskad tid", value: scheduleText }] : []),
    {
      label: "Adress",
      value: formatEmailAddress({
        street: input.address,
        postalCode: input.postalCode,
        municipality: input.municipality,
      }),
    },
    { label: "Telefon", value: input.phone },
  ];

  const customerHtml = wrapEmailHtml({
    title: "Bokningsbekräftelse",
    preheader: `Tack för din bokning av ${service}.`,
    bodyHtml: [
      emailHeading(`Tack för din bokning, ${input.name.split(" ")[0]}!`),
      emailParagraph(
        input.isConfirmed
          ? "Vi har registrerat din bokning och bekräftat den. Här är en sammanfattning av dina uppgifter."
          : "Vi har tagit emot din bokningsförfrågan. Här är en sammanfattning av dina uppgifter – vi återkommer med bekräftelse så snart vi kan.",
      ),
      emailDetailsTable(customerRows),
      emailParagraph("Har du frågor eller behöver ändra något? Svara på det här mailet eller kontakta oss."),
    ].join(""),
  });

  const internalRows = [
    { label: "Kund", value: input.name },
    { label: "E-post", value: input.email },
    { label: "Telefon", value: input.phone },
    { label: "Tjänst", value: service },
    { label: "Yta", value: `${input.squareMeters} kvm` },
    { label: "Frekvens", value: frequencyLabel(input.frequency) },
    ...(priceText ? [{ label: "Pris", value: priceText }] : []),
    ...(scheduleText ? [{ label: "Önskad tid", value: scheduleText }] : []),
    {
      label: "Adress",
      value: formatEmailAddress({
        street: input.address,
        postalCode: input.postalCode,
        municipality: input.municipality,
      }),
    },
  ];

  const internalHtml = wrapEmailHtml({
    title: "Ny städbokning",
    preheader: `Ny bokning från ${input.name}.`,
    bodyHtml: [
      emailHeading("Ny städbokning"),
      emailParagraph(`En ny städbokning har kommit in från ${input.name}.`),
      emailDetailsTable(internalRows),
      emailButton("Öppna i admin", `${SITE_URL}/admin/bookings/${input.bookingId}`),
    ].join(""),
  });

  await Promise.all([
    sendEmailSafely("Cleaning booking confirmation", {
      to: input.email,
      subject: `Bokningsbekräftelse – ${service}`,
      html: customerHtml,
    }),
    sendEmailSafely("Internal cleaning booking notification", {
      to: getInternalNotificationEmail(),
      subject: `Ny städbokning: ${input.name}`,
      html: internalHtml,
    }),
  ]);
}

export type CleaningInquiryEmailInput = {
  leadId: string;
  serviceSlug: string;
  name: string;
  email: string;
  phone: string;
  postalCode: string;
  municipality: string;
  address?: string;
  squareMeters?: number;
  frequency?: CleaningFrequency;
  propertyType?: CleaningPropertyType;
  message?: string;
  priceKr?: number | null;
};

export async function notifyCleaningInquiryReceived(input: CleaningInquiryEmailInput) {
  const service = serviceLabel(input.serviceSlug, input.propertyType);
  const priceText =
    input.priceKr != null && input.priceKr > 0 ? formatKr(input.priceKr) : null;

  const customerRows = [
    { label: "Tjänst", value: service },
    ...(input.squareMeters ? [{ label: "Yta", value: `${input.squareMeters} kvm` }] : []),
    ...(input.frequency
      ? [{ label: "Frekvens", value: frequencyLabel(input.frequency) }]
      : []),
    ...(priceText ? [{ label: "Uppskattat pris", value: priceText }] : []),
    {
      label: "Område",
      value: formatEmailAddress({
        street: input.address,
        postalCode: input.postalCode,
        municipality: input.municipality,
      }),
    },
  ];

  const customerHtml = wrapEmailHtml({
    title: "Förfrågan mottagen",
    preheader: `Vi har tagit emot din förfrågan om ${service}.`,
    bodyHtml: [
      emailHeading(`Tack, ${input.name.split(" ")[0]}!`),
      emailParagraph(
        "Vi har tagit emot din förfrågan och återkommer till dig så snart vi kan – oftast inom en arbetsdag.",
      ),
      emailDetailsTable(customerRows),
      emailParagraph("Behöver du komplettera något? Svara gärna på det här mailet."),
    ].join(""),
  });

  const internalRows = [
    { label: "Kund", value: input.name },
    { label: "E-post", value: input.email },
    { label: "Telefon", value: input.phone },
    { label: "Tjänst", value: service },
    ...(input.squareMeters ? [{ label: "Yta", value: `${input.squareMeters} kvm` }] : []),
    ...(input.frequency
      ? [{ label: "Frekvens", value: frequencyLabel(input.frequency) }]
      : []),
    ...(priceText ? [{ label: "Uppskattat pris", value: priceText }] : []),
    {
      label: "Område",
      value: formatEmailAddress({
        street: input.address,
        postalCode: input.postalCode,
        municipality: input.municipality,
      }),
    },
    ...(input.message ? [{ label: "Meddelande", value: input.message }] : []),
  ];

  const internalHtml = wrapEmailHtml({
    title: "Ny städförfrågan",
    preheader: `Ny förfrågan från ${input.name}.`,
    bodyHtml: [
      emailHeading("Ny städförfrågan"),
      emailParagraph(`En ny städförfrågan har kommit in från ${input.name}.`),
      emailDetailsTable(internalRows),
      emailButton("Öppna i admin", `${SITE_URL}/admin/leads/${input.leadId}`),
    ].join(""),
  });

  await Promise.all([
    sendEmailSafely("Cleaning inquiry confirmation", {
      to: input.email,
      subject: `Vi har tagit emot din förfrågan – ${service}`,
      html: customerHtml,
    }),
    sendEmailSafely("Internal cleaning inquiry notification", {
      to: getInternalNotificationEmail(),
      subject: `Ny städförfrågan: ${input.name}`,
      html: internalHtml,
    }),
  ]);
}

export type ServiceInquiryEmailInput = {
  leadId: string;
  serviceSlug: string;
  name: string;
  email: string;
  phone: string;
  postalCode: string;
  municipality: string;
  timeframe: string;
  message: string;
};

export async function notifyServiceInquiryReceived(input: ServiceInquiryEmailInput) {
  const service = serviceLabel(input.serviceSlug);

  const customerHtml = wrapEmailHtml({
    title: "Förfrågan mottagen",
    preheader: `Vi har tagit emot din förfrågan om ${service}.`,
    bodyHtml: [
      emailHeading(`Tack, ${input.name.split(" ")[0]}!`),
      emailParagraph(
        "Vi har tagit emot din förfrågan och återkommer till dig så snart vi kan – oftast inom en arbetsdag.",
      ),
      emailDetailsTable([
        { label: "Tjänst", value: service },
        { label: "Tidsram", value: input.timeframe },
        {
          label: "Område",
          value: formatEmailAddress({
            postalCode: input.postalCode,
            municipality: input.municipality,
          }),
        },
      ]),
      emailParagraph("Behöver du komplettera något? Svara gärna på det här mailet."),
    ].join(""),
  });

  const internalHtml = wrapEmailHtml({
    title: "Ny tjänsteförfrågan",
    preheader: `Ny förfrågan från ${input.name}.`,
    bodyHtml: [
      emailHeading("Ny tjänsteförfrågan"),
      emailParagraph(`En ny förfrågan har kommit in från ${input.name}.`),
      emailDetailsTable([
        { label: "Kund", value: input.name },
        { label: "E-post", value: input.email },
        { label: "Telefon", value: input.phone },
        { label: "Tjänst", value: service },
        { label: "Tidsram", value: input.timeframe },
        {
          label: "Område",
          value: formatEmailAddress({
            postalCode: input.postalCode,
            municipality: input.municipality,
          }),
        },
        { label: "Meddelande", value: input.message },
      ]),
      emailButton("Öppna i admin", `${SITE_URL}/admin/leads/${input.leadId}`),
    ].join(""),
  });

  await Promise.all([
    sendEmailSafely("Service inquiry confirmation", {
      to: input.email,
      subject: `Vi har tagit emot din förfrågan – ${service}`,
      html: customerHtml,
    }),
    sendEmailSafely("Internal service inquiry notification", {
      to: getInternalNotificationEmail(),
      subject: `Ny tjänsteförfrågan: ${input.name}`,
      html: internalHtml,
    }),
  ]);
}

export type ServiceBookingEmailInput = {
  bookingId: string;
  serviceSlug: string;
  name: string;
  email: string;
  phone: string;
  postalCode: string;
  municipality: string;
  address?: string;
  message: string;
  visitDate: string;
  visitTime: string;
  priceKr?: number | null;
};

export async function notifyServiceBookingCreated(input: ServiceBookingEmailInput) {
  const service = serviceLabel(input.serviceSlug);
  const priceText =
    input.priceKr != null && input.priceKr > 0 ? formatKr(input.priceKr) : null;
  const scheduleText = `${formatEmailDate(input.visitDate)} kl. ${formatEmailTime(input.visitTime)}`;

  const customerRows = [
    { label: "Tjänst", value: service },
    { label: "Planerad tid", value: scheduleText },
    ...(priceText ? [{ label: "Pris", value: priceText }] : []),
    {
      label: "Adress",
      value: formatEmailAddress({
        street: input.address,
        postalCode: input.postalCode,
        municipality: input.municipality,
      }),
    },
    { label: "Telefon", value: input.phone },
  ];

  const customerHtml = wrapEmailHtml({
    title: "Bokningsbekräftelse",
    preheader: `Din bokning av ${service} är bekräftad.`,
    bodyHtml: [
      emailHeading(`Tack för din bokning, ${input.name.split(" ")[0]}!`),
      emailParagraph("Vi har bekräftat din bokning. Här är en sammanfattning."),
      emailDetailsTable(customerRows),
      emailParagraph("Har du frågor? Svara på det här mailet eller kontakta oss."),
    ].join(""),
  });

  const internalHtml = wrapEmailHtml({
    title: "Ny tjänstebokning",
    preheader: `Ny bokning från ${input.name}.`,
    bodyHtml: [
      emailHeading("Ny tjänstebokning"),
      emailParagraph(`En ny bokning har skapats för ${input.name}.`),
      emailDetailsTable([
        { label: "Kund", value: input.name },
        { label: "E-post", value: input.email },
        { label: "Telefon", value: input.phone },
        { label: "Tjänst", value: service },
        { label: "Planerad tid", value: scheduleText },
        ...(priceText ? [{ label: "Pris", value: priceText }] : []),
        {
          label: "Adress",
          value: formatEmailAddress({
            street: input.address,
            postalCode: input.postalCode,
            municipality: input.municipality,
          }),
        },
        { label: "Uppdrag", value: input.message },
      ]),
      emailButton("Öppna i admin", `${SITE_URL}/admin/bookings/${input.bookingId}`),
    ].join(""),
  });

  await Promise.all([
    sendEmailSafely("Service booking confirmation", {
      to: input.email,
      subject: `Bokningsbekräftelse – ${service}`,
      html: customerHtml,
    }),
    sendEmailSafely("Internal service booking notification", {
      to: getInternalNotificationEmail(),
      subject: `Ny tjänstebokning: ${input.name}`,
      html: internalHtml,
    }),
  ]);
}

export async function notifyStaffAssignedToVisit(visitId: string) {
  if (!visitId || !isEmailConfigured()) {
    return;
  }

  const supabase = createAdminClient();

  const { data: visit, error } = await supabase
    .from("cleaning_visits")
    .select(
      `
      id,
      visit_date,
      visit_time,
      note,
      duration_minutes,
      staff_id,
      booking:bookings (
        id,
        contact_name,
        contact_phone,
        contact_email,
        street_address,
        postal_code,
        municipality,
        service_slug,
        message
      )
    `,
    )
    .eq("id", visitId)
    .maybeSingle();

  if (error || !visit?.staff_id || !visit.booking) {
    return;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", visit.staff_id)
    .maybeSingle();

  if (!profile?.email?.trim()) {
    console.error("Staff assignment email skipped: no email for staff", visit.staff_id);
    return;
  }

  const booking = visit.booking as {
    id: string;
    contact_name: string;
    contact_phone: string;
    contact_email: string;
    street_address: string | null;
    postal_code: string;
    municipality: string;
    service_slug: string;
    message: string | null;
  };

  const service = serviceLabel(booking.service_slug);
  const staffName = profile.full_name?.split(" ")[0] ?? "du";
  const scheduleText = `${formatEmailDate(visit.visit_date)} kl. ${formatEmailTime(visit.visit_time)}`;

  const html = wrapEmailHtml({
    title: "Nytt uppdrag tilldelat",
    preheader: `Du har tilldelats ett uppdrag ${scheduleText}.`,
    bodyHtml: [
      emailHeading(`Hej ${staffName}!`),
      emailParagraph("Du har tilldelats ett nytt städuppdrag i schemat."),
      emailDetailsTable([
        { label: "Datum och tid", value: scheduleText },
        { label: "Tjänst", value: service },
        { label: "Kund", value: booking.contact_name },
        { label: "Telefon", value: booking.contact_phone },
        {
          label: "Adress",
          value: formatEmailAddress({
            street: booking.street_address,
            postalCode: booking.postal_code,
            municipality: booking.municipality,
          }),
        },
        ...(visit.duration_minutes
          ? [{ label: "Beräknad tid", value: `${visit.duration_minutes} min` }]
          : []),
        ...(visit.note ? [{ label: "Anteckning", value: visit.note }] : []),
        ...(booking.message ? [{ label: "Kundmeddelande", value: booking.message }] : []),
      ]),
      emailButton("Öppna schema", `${SITE_URL}/admin/schedule`),
    ].join(""),
  });

  await sendEmailSafely("Staff assignment notification", {
    to: profile.email,
    subject: `Nytt uppdrag tilldelat – ${scheduleText}`,
    html,
  });
}
