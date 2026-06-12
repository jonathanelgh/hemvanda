export function normalizePhoneToE164(input: string) {
  const trimmed = input.trim();

  if (trimmed.startsWith("+")) {
    const digits = trimmed.slice(1).replace(/\D/g, "");
    return digits ? `+${digits}` : "";
  }

  const digits = trimmed.replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  if (digits.startsWith("46")) {
    return `+${digits}`;
  }

  if (digits.startsWith("0")) {
    return `+46${digits.slice(1)}`;
  }

  return `+46${digits}`;
}

export function formatPhoneDisplay(e164: string) {
  if (!e164.startsWith("+46")) {
    return e164;
  }

  const national = `0${e164.slice(3)}`;
  return national.replace(/(\d{2})(?=\d)/g, "$1 ").trim();
}
