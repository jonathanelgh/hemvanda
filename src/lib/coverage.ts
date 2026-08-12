export function normalizeZipCode(input: string) {
  const digits = input.replace(/\D/g, "");

  if (digits.length !== 5) {
    return null;
  }

  return digits;
}

/** Stockholms län postal codes are in the 1xxxx range. */
export function isStockholmAreaZip(input: string) {
  const normalized = normalizeZipCode(input);
  return Boolean(normalized && normalized.startsWith("1"));
}

export function formatZipCode(input: string) {
  const normalized = normalizeZipCode(input);

  if (!normalized) {
    return input;
  }

  return `${normalized.slice(0, 3)} ${normalized.slice(3)}`;
}

export function maskZipCodeInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 5);

  if (digits.length <= 3) {
    return digits;
  }

  return `${digits.slice(0, 3)} ${digits.slice(3)}`;
}

export function verifyPostalCode(zip: string) {
  const normalized = normalizeZipCode(zip);

  if (!normalized) {
    return {
      available: false,
      error: "Ogiltigt postnummer. Ange fem siffror.",
    };
  }

  if (!isStockholmAreaZip(normalized)) {
    return {
      available: false,
      error: "Vi tar för närvarande endast emot bokningar i Stockholm med omnejd.",
    };
  }

  return {
    available: true,
    area: formatZipCode(normalized),
  };
}
