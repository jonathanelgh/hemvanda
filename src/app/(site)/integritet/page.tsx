import type { Metadata } from "next";
import {
  LegalDocumentPage,
  type LegalSection,
} from "@/components/legal-document-page";
import { BRAND_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Integritetspolicy | ${BRAND_NAME}`,
  description: `Läs hur ${BRAND_NAME} behandlar personuppgifter, cookies och marknadsföringssporning via Meta och Google.`,
};

const sections: LegalSection[] = [
  {
    title: "1. Personuppgiftsansvarig",
    paragraphs: [
      `${BRAND_NAME} är personuppgiftsansvarig för behandlingen av dina personuppgifter i samband med vår webbplats och våra tjänster.`,
      "Kontakt: info@hemvanda.se · Stockholm med omnejd.",
    ],
  },
  {
    title: "2. Vilka uppgifter vi samlar in",
    list: [
      "Kontaktuppgifter, till exempel namn, telefonnummer, e-postadress och adress.",
      "Uppgifter om bokningar och förfrågningar, till exempel tjänst, postnummer, ort, önskemål och meddelanden.",
      "Konto- och inloggningsuppgifter när du använder Mitt HemVända.",
      "Teknisk information, till exempel IP-adress, enhetstyp, webbläsare och hur du navigerar på webbplatsen.",
      "Marknadsförings- och cookie-data från Meta och Google när du godkänt spårning.",
    ],
  },
  {
    title: "3. Varför vi behandlar uppgifter",
    list: [
      "För att hantera bokningar, förfrågningar och kundrelationer.",
      "För att tillhandahålla konto, support och uppföljning av uppdrag.",
      "För att förbättra webbplatsen, analysera användning och utveckla våra tjänster.",
      "För att mäta och förbättra marknadsföring, inklusive annonsering via Meta och Google.",
      "För att uppfylla rättsliga skyldigheter, till exempel bokföring.",
    ],
  },
  {
    title: "4. Rättslig grund",
    paragraphs: [
      "Vi behandlar personuppgifter när det är nödvändigt för att fullgöra avtal eller vidta åtgärder innan avtal ingås, när vi har ett berättigat intresse som inte väger tyngre än dina rättigheter, när behandlingen krävs enligt lag, eller när du har lämnat samtycke – till exempel till marknadsföringsscookies.",
    ],
  },
  {
    title: "5. Cookies och spårning",
    paragraphs: [
      "Vi använder cookies och liknande tekniker för att webbplatsen ska fungera, för att förstå hur den används och för marknadsföring. Vissa cookies är nödvändiga, medan andra kräver ditt samtycke.",
      "När du godkänner marknadsförings- och analyscookies kan vi använda spårning från Meta (Facebook/Instagram) och Google. Det kan innebära att information om ditt besök delas med dessa parter i syfte att mäta annonser, skapa målgrupper och förbättra vår marknadsföring.",
    ],
    list: [
      "Meta Pixel och relaterade Meta-verktyg för konverteringsmätning och annonsering.",
      "Google Analytics och Google Ads för statistik, mätning och remarketing.",
      "Tekniska cookies som behövs för inloggning, bokningsflöde och säkerhet.",
    ],
  },
  {
    title: "6. Delning med tredje part",
    paragraphs: [
      "Vi delar personuppgifter med leverantörer som hjälper oss att driva verksamheten, till exempel hosting, e-post, bokningssystem och betalning. Dessa behandlar uppgifter endast enligt våra instruktioner.",
      "Meta Platforms Ireland Ltd och Google Ireland Ltd kan behandla uppgifter som personuppgiftsbiträden eller självständiga personuppgiftsansvariga beroende på tjänst och inställning. Mer information finns i deras respektive integritetspolicyer.",
      "Vi säljer inte dina personuppgifter till tredje part.",
    ],
  },
  {
    title: "7. Lagringstid",
    paragraphs: [
      "Vi sparar personuppgifter så länge det behövs för ändamålet de samlades in för, till exempel under pågående kundrelation, enligt bokföringsregler eller tills du återkallar samtycke där samtycke är rättslig grund.",
      "Analys- och marknadsföringsdata från Meta och Google lagras enligt deras respektive inställningar och våra valda bevarandetider.",
    ],
  },
  {
    title: "8. Dina rättigheter",
    list: [
      "Begära tillgång till de personuppgifter vi behandlar om dig.",
      "Begära rättelse av felaktiga uppgifter.",
      "Begära radering, begränsning eller invända mot viss behandling.",
      "Begära dataportabilitet när behandlingen grundas på avtal eller samtycke.",
      "Återkalla samtycke när behandlingen grundas på samtycke, utan att det påverkar lagligheten av behandling före återkallelsen.",
      "Lämna klagomål till Integritetsskyddsmyndigheten (IMY) om du anser att vi behandlar dina uppgifter på ett otillåtet sätt.",
    ],
  },
  {
    title: "9. Säkerhet",
    paragraphs: [
      "Vi vidtar lämpliga tekniska och organisatoriska säkerhetsåtgärder för att skydda personuppgifter mot obehörig åtkomst, förlust eller missbruk.",
    ],
  },
  {
    title: "10. Ändringar",
    paragraphs: [
      "Vi kan uppdatera denna integritetspolicy när våra tjänster, webbplats eller lagkrav förändras. Den senaste versionen finns alltid på denna sida.",
    ],
  },
];

export default function IntegritetPage() {
  return (
    <LegalDocumentPage
      eyebrow="Juridiskt"
      title="Integritetspolicy"
      description={`Här beskriver vi hur ${BRAND_NAME} samlar in, använder och skyddar personuppgifter – inklusive cookies och spårning via Meta och Google.`}
      updatedAt="10 juni 2026"
      sections={sections}
    />
  );
}
