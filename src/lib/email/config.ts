export function isEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

export function getEmailFrom() {
  return process.env.EMAIL_FROM?.trim() ?? "HemVända <noreply@hemvanda.se>";
}

export function getInternalNotificationEmail() {
  return process.env.INTERNAL_NOTIFICATION_EMAIL?.trim() ?? "info@hemvanda.se";
}
