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
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return Response.json({
      postalCode: formattedZip,
      place: null,
      label: formattedZip,
      configured: false,
    });
  }

  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  url.searchParams.set("components", `postal_code:${zip}|country:SE`);
  url.searchParams.set("language", "sv");
  url.searchParams.set("region", "se");
  url.searchParams.set("key", apiKey);

  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    return Response.json(
      { error: "Kunde inte hämta postnummerinformation." },
      { status: 502 },
    );
  }

  const data = (await response.json()) as GoogleGeocodeResponse;

  if (data.status !== "OK") {
    return Response.json({
      postalCode: formattedZip,
      place: null,
      label: formattedZip,
      configured: true,
    });
  }

  const place = getPlaceName(data.results?.[0]);

  return Response.json({
    postalCode: formattedZip,
    place,
    label: place ? `${formattedZip} ${place}` : formattedZip,
    configured: true,
  });
}

function getPlaceName(result?: GoogleGeocodeResult) {
  const components = result?.address_components ?? [];

  for (const type of placeTypePriority) {
    const match = components.find((component) => component.types.includes(type));

    if (match?.long_name) {
      return match.long_name;
    }
  }

  return null;
}
