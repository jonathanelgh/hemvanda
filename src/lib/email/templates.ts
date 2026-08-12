import { BRAND_NAME } from "@/lib/brand";
import { SITE_URL } from "@/lib/seo";

const BRAND_GREEN = "#1e3d32";
const BRAND_GOLD = "#b8941f";
const TEXT_MUTED = "#5c6b64";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function wrapEmailHtml(options: {
  title: string;
  preheader?: string;
  bodyHtml: string;
}) {
  const preheader = options.preheader
    ? `<span style="display:none!important;visibility:hidden;opacity:0;height:0;width:0;overflow:hidden;">${escapeHtml(options.preheader)}</span>`
    : "";

  return `<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(options.title)}</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f5;font-family:Georgia,'Times New Roman',serif;color:#1a1a1a;">
  ${preheader}
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f6f5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border:1px solid #e4ebe7;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="background:${BRAND_GREEN};padding:28px 32px;">
              <p style="margin:0;font-size:28px;line-height:1.2;color:#ffffff;letter-spacing:0.02em;">${BRAND_NAME}</p>
              <p style="margin:8px 0 0;font-size:14px;line-height:1.5;color:#d9e8e1;">Vi ger hem nytt liv</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              ${options.bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 28px;">
              <p style="margin:0;font-size:13px;line-height:1.6;color:${TEXT_MUTED};">
                Frågor? Kontakta oss på
                <a href="mailto:info@hemvanda.se" style="color:${BRAND_GOLD};text-decoration:none;">info@hemvanda.se</a>
                · <a href="${SITE_URL}" style="color:${BRAND_GOLD};text-decoration:none;">${SITE_URL.replace(/^https?:\/\//, "")}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function emailHeading(text: string) {
  return `<h1 style="margin:0 0 16px;font-size:24px;line-height:1.3;color:${BRAND_GREEN};font-weight:600;">${escapeHtml(text)}</h1>`;
}

export function emailParagraph(text: string) {
  return `<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#2a2a2a;">${escapeHtml(text)}</p>`;
}

export function emailDetailsTable(rows: { label: string; value: string }[]) {
  const rowsHtml = rows
    .filter((row) => row.value.trim())
    .map(
      (row) => `<tr>
        <td style="padding:10px 0;border-bottom:1px solid #edf2ef;font-size:14px;color:${TEXT_MUTED};width:38%;vertical-align:top;">${escapeHtml(row.label)}</td>
        <td style="padding:10px 0;border-bottom:1px solid #edf2ef;font-size:14px;color:#1a1a1a;vertical-align:top;">${escapeHtml(row.value)}</td>
      </tr>`,
    )
    .join("");

  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 24px;">${rowsHtml}</table>`;
}

export function emailButton(label: string, href: string) {
  return `<p style="margin:0 0 8px;">
    <a href="${escapeHtml(href)}" style="display:inline-block;background:${BRAND_GOLD};color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:12px 20px;border-radius:8px;">${escapeHtml(label)}</a>
  </p>`;
}

export function formatEmailDate(date: string) {
  const parsed = new Date(`${date}T12:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("sv-SE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatEmailTime(time: string) {
  return time.slice(0, 5);
}

export function formatEmailAddress(parts: {
  street?: string | null;
  postalCode?: string | null;
  municipality?: string | null;
}) {
  const line1 = parts.street?.trim();
  const line2 = [parts.postalCode, parts.municipality].filter(Boolean).join(" ").trim();

  return [line1, line2].filter(Boolean).join(", ");
}
