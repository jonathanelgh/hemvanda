import type { Metadata } from "next";
import {
  LegalDocumentPage,
  type LegalSection,
} from "@/components/legal-document-page";
import { BRAND_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Villkor | ${BRAND_NAME}`,
  description: `Allmänna villkor för att boka tjänster via ${BRAND_NAME}.`,
};

const sections: LegalSection[] = [
  {
    title: "1. Om dessa villkor",
    paragraphs: [
      `Dessa allmänna villkor gäller när du bokar tjänster eller skickar förfrågningar via ${BRAND_NAME}s webbplats, e-post eller telefon. Genom att använda våra tjänster godkänner du villkoren i den version som gällde vid bokningstillfället.`,
      `${BRAND_NAME} erbjuder städ, hantverk, renovering och relaterade hemtjänster i Stockholm med omnejd. Specifika villkor för enskilda uppdrag kan kompletteras med offert, orderbekräftelse eller avtal.`,
    ],
  },
  {
    title: "2. Bokning och avtal",
    paragraphs: [
      "En bokning eller accepterad offert utgör ett avtal mellan dig och oss. För att slutföra en bokning behöver du lämna korrekta kontaktuppgifter och relevant information om uppdraget.",
      "Vissa tjänster, till exempel hemstädning, kan bokas direkt online. Andra tjänster hanteras som förfrågan där vi återkommer med pris, tid och nästa steg innan uppdraget bekräftas.",
    ],
  },
  {
    title: "3. Priser och betalning",
    paragraphs: [
      "Priser framgår vid bokning, i offert eller i bekräftelse till dig. Om inget annat avtalats ska betalning ske enligt den betalningsmetod och tidsplan som anges i bekräftelsen.",
      "Vi förbehåller oss rätten att justera pris om förutsättningarna för uppdraget väsentligt ändras efter bokning, till exempel vid större omfattning, tillkommande moment eller ändrade förutsättningar på plats. Du informeras i så fall innan arbetet fortsätter.",
    ],
  },
  {
    title: "4. Ändring och avbokning",
    paragraphs: [
      "Vi förstår att planer kan ändras. Om du behöver omboka eller avboka ber vi dig kontakta oss så snart som möjligt.",
      "Vid avbokning nära inpå planerad tid kan avbokningsavgift tillkomma om vi inte hinner fylla tiden eller om kostnader redan uppstått. Eventuella särskilda avbokningsregler framgår i din bokningsbekräftelse.",
    ],
  },
  {
    title: "5. Tillträde och förutsättningar på plats",
    list: [
      "Du ansvarar för att ge oss tillträde till bostad eller lokal vid avtalad tid.",
      "Du ska informera om särskilda förhållanden, till exempel husdjur, känsliga ytor, larm eller nyckelhantering.",
      "Arbetet förutsätter rimliga förutsättningar på plats, såsom tillgång till el, vatten och den yta som ska behandlas.",
    ],
  },
  {
    title: "6. Reklamation och ansvar",
    paragraphs: [
      "Vi strävar efter hög kvalitet i varje uppdrag. Om du inte är nöjd ber vi dig kontakta oss inom skälig tid så att vi får möjlighet att åtgärda felet.",
      `${BRAND_NAME}s ansvar är begränsat till direkt skada som orsakats av vårdslöshet i samband med utfört uppdrag, i den utsträckning som följer av tvingande lag. Vi ansvarar inte för indirekta skador, utebliven vinst eller följdskador som inte beror på uppenbart fel från vår sida.`,
    ],
  },
  {
    title: "7. Force majeure",
    paragraphs: [
      "Vi ansvarar inte för förseningar eller hinder som beror på omständigheter utanför vår rimliga kontroll, till exempel extrema väderförhållanden, pandemi, strejk, myndighetsbeslut eller tekniska störningar.",
    ],
  },
  {
    title: "8. Personuppgifter",
    paragraphs: [
      `När du använder våra tjänster behandlar vi personuppgifter enligt vår integritetspolicy. Läs mer på sidan Integritet.`,
    ],
  },
  {
    title: "9. Ändringar av villkoren",
    paragraphs: [
      "Vi kan uppdatera dessa villkor vid behov. Den senaste versionen publiceras alltid på denna sida. Fortsatt användning av våra tjänster efter uppdatering innebär att du accepterar de nya villkoren.",
    ],
  },
  {
    title: "10. Tillämplig lag och tvist",
    paragraphs: [
      "Svensk lag ska tillämpas på dessa villkor. Tvist ska i första hand lösas genom dialog mellan parterna. Om enighet inte nås kan tvisten prövas av allmän domstol i Sverige.",
    ],
  },
];

export default function VillkorPage() {
  return (
    <LegalDocumentPage
      eyebrow="Juridiskt"
      title="Allmänna villkor"
      description={`Här hittar du villkoren som gäller när du bokar eller beställer tjänster från ${BRAND_NAME}.`}
      updatedAt="10 juni 2026"
      sections={sections}
    />
  );
}
