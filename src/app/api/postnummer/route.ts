import { formatZipCode, isStockholmAreaZip, normalizeZipCode } from "@/lib/coverage";

type GoogleAddressComponent = {
  long_name: string;
  short_name: string;
  types: string[];
};

type GoogleGeocodeResult = {
  address_components?: GoogleAddressComponent[];
};

type GoogleGeocodeResponse = {
  results?: GoogleGeocodeResult[];
  status?: string;
  error_message?: string;
};

type NominatimAddress = {
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  suburb?: string;
  city_district?: string;
  county?: string;
};

type NominatimResult = {
  address?: NominatimAddress;
};

const placeTypePriority = [
  "postal_town",
  "locality",
  "sublocality",
  "sublocality_level_1",
  "administrative_area_level_3",
  "administrative_area_level_2",
  "administrative_area_level_1",
];

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const zip = normalizeZipCode(searchParams.get("zip") ?? "");

  if (!zip) {
    return Response.json(
      { error: "Ogiltigt postnummer. Ange fem siffror." },
      { status: 400 },
    );
  }

  if (!isStockholmAreaZip(zip)) {
    return Response.json(
      {
        error: "Vi tar för närvarande endast emot bokningar i Stockholm med omnejd.",
      },
      { status: 400 },
    );
  }

  const formattedZip = formatZipCode(zip);
  const place =
    (await lookupPlaceWithGoogle(zip)) ?? (await lookupPlaceWithNominatim(zip));

  if (!place) {
    return Response.json(
      {
        error: "Kunde inte hitta orten för postnumret. Kontrollera och försök igen.",
        postalCode: formattedZip,
        place: null,
        label: formattedZip,
      },
      { status: 502 },
    );
  }

  return Response.json({
    postalCode: formattedZip,
    place,
    municipality: place,
    label: `${formattedZip} ${place}`,
    configured: true,
  });
}

async function lookupPlaceWithGoogle(zip: string) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY?.trim();

  if (!apiKey) {
    return null;
  }

  try {
    const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
    url.searchParams.set("components", `postal_code:${zip}|country:SE`);
    url.searchParams.set("language", "sv");
    url.searchParams.set("region", "se");
    url.searchParams.set("key", apiKey);

    const response = await fetch(url, { cache: "no-store" });

    if (!response.ok) {
      console.error("Google Geocoding HTTP error:", response.status);
      return null;
    }

    const data = (await response.json()) as GoogleGeocodeResponse;

    if (data.status !== "OK") {
      console.error(
        "Google Geocoding failed:",
        data.status,
        data.error_message ?? "",
      );
      return null;
    }

    return getGooglePlaceName(data.results?.[0]);
  } catch (error) {
    console.error("Google Geocoding request failed:", error);
    return null;
  }
}

async function lookupPlaceWithNominatim(zip: string) {
  try {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("postalcode", zip);
    url.searchParams.set("countrycodes", "se");
    url.searchParams.set("format", "json");
    url.searchParams.set("addressdetails", "1");
    url.searchParams.set("limit", "1");

    const response = await fetch(url, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "User-Agent": "HemVanda/1.0 (info@hemvanda.se)",
      },
    });

    if (!response.ok) {
      console.error("Nominatim HTTP error:", response.status);
      return null;
    }

    const data = (await response.json()) as NominatimResult[];
    return getNominatimPlaceName(data[0]?.address);
  } catch (error) {
    console.error("Nominatim request failed:", error);
    return null;
  }
}

function getGooglePlaceName(result?: GoogleGeocodeResult) {
  const components = result?.address_components ?? [];

  for (const type of placeTypePriority) {
    const match = components.find((component) => component.types.includes(type));

    if (match?.long_name) {
      return match.long_name;
    }
  }

  return null;
}

function getNominatimPlaceName(address?: NominatimAddress) {
  if (!address) {
    return null;
  }

  const preferred = [address.city, address.town, address.village];

  for (const candidate of preferred) {
    const cleaned = candidate?.trim();

    if (cleaned && !/ kommun$/i.test(cleaned)) {
      return cleaned;
    }
  }

  const administrative = [
    address.municipality,
    address.town,
    address.suburb,
    address.city_district,
  ]
    .map((value) => value?.trim())
    .find(Boolean);

  return administrative ?? null;
}
