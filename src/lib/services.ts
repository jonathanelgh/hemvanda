import type { IconName } from "@/components/icons";

export type Service = {
  slug: string;
  title: string;
  eyebrow: string;
  description: string;
  hero: string;
  heroImage?: string;
  summaryTitle: string;
  summary: string;
  icon: Extract<
    IconName,
    "hammer" | "sparkles" | "truck" | "chair" | "wrench" | "more"
  >;
  accent: string;
  includes: { label: string; icon: IconName }[];
  subServices?: string[];
  steps: string[];
  benefits: string[];
  faqs: {
    question: string;
    answer: string;
  }[];
  seo: {
    title: string;
    description: string;
  };
};

export const services: Service[] = [
  {
    slug: "stad",
    title: "Städ",
    eyebrow: "Rent, lugnt och välkomnande",
    description:
      "Städning för hem i Stockholm – hemstäd, storstäd, flyttstäd och fönsterputs.",
    hero:
      "Kom hem till ett renare hem. Boka hemstäd, storstäd, flyttstäd eller fönsterputs med tydligt pris och lokalt fokus i Stockholm.",
    heroImage: "/stad-hero-img.webp",
    summaryTitle: "Städning med omsorg om helheten",
    summary:
      "HemVända städar med omsorg om både detaljerna och helheten, så att ditt hem känns lättare att leva i.",
    icon: "sparkles",
    accent: "Hemstädning",
    includes: [
      { label: "Återkommande hemstädning", icon: "calendar" },
      { label: "Storstädning med valfria tillägg", icon: "sparkles" },
      { label: "Flyttstädning inför in- eller avflytt", icon: "truck" },
      { label: "Fönsterputs engångs eller abonnemang", icon: "home" },
    ],
    steps: [
      "Välj hemstäd, storstäd, flyttstäd eller fönster.",
      "Ange yta eller antal fönster och se priset.",
      "Boka tid online eller låt oss kontakta dig.",
    ],
    benefits: [
      "Tydliga priser för Stockholm",
      "Flexibla upplägg efter behov",
      "Trygg hantering av hem och nycklar",
    ],
    faqs: [
      {
        question: "Vilka städtjänster kan jag boka?",
        answer:
          "Du kan boka hemstäd (abonnemang), storstäd, flyttstäd och fönsterputs. Priset visas direkt i bokningsflödet utifrån yta, frekvens och eventuella tillägg.",
      },
      {
        question: "Hur räknas priset ut?",
        answer:
          "Priset baseras på bostadsytan i kvm och vilken tjänst du väljer. För hemstäd påverkar även frekvens (varje, varannan eller var fjärde vecka). Storstäd och flyttstäd har engångspris, och tillägg som ugn, kyl eller balkong läggs på om du väljer dem.",
      },
      {
        question: "Var arbetar ni?",
        answer:
          "Vi städar i Stockholm med omnejd. Ange ditt postnummer i bokningen så ser du direkt om vi täcker ditt område.",
      },
      {
        question: "Behöver jag vara hemma under städningen?",
        answer:
          "Nej, det är frivilligt. Du kan vara hemma, lämna nycklar hos oss i god tid, eller använda nycklar som redan lämnats. Du väljer alternativ i bokningen.",
      },
      {
        question: "Kan jag lägga till ugn, kyl eller fönster?",
        answer:
          "Ja. Vid storstäd kan du lägga till ugns- och kylskåpsrengöring samt städredskap. Fönsterputs bokas som egen tjänst, engångs eller som abonnemang.",
      },
      {
        question: "Hur bokar jag eller får hjälp att välja?",
        answer:
          "Du kan boka direkt online och se priset innan du bekräftar, eller välja att bli kontaktad så hjälper vi dig hitta rätt upplägg.",
      },
    ],
    seo: {
      title: "Städ | HemVända",
      description:
        "Boka städning i Stockholm med HemVända. Hemstäd, storstäd, flyttstäd och fönsterputs med tydligt pris.",
    },
  },
  {
    slug: "snickeri-bygg-renovering",
    title: "Måleri, bygg och renovering",
    eyebrow: "Genomtänkta förbättringar",
    description:
      "Trygg hjälp med måleri, mindre byggprojekt och renoveringar som lyfter hemmet.",
    hero:
      "Från målning och förbättringar till renovering. Vi hjälper dig skapa ett hem som fungerar bättre och känns mer genomtänkt.",
    heroImage: "/snickare-hero-bg.webp",
    summaryTitle: "Renovering med kvalitet och planering",
    summary:
      "Måleri, bygg och renovering för dig som vill förnya hemmet med kvalitet, tydlig planering och känsla för detaljer.",
    icon: "hammer",
    accent: "Renovering",
    includes: [
      { label: "Måleri och ytskikt", icon: "hammer" },
      { label: "Mindre byggprojekt och hemförbättringar", icon: "layers" },
      { label: "Renovering av utvalda ytor och rum", icon: "home" },
      { label: "Planering, materialråd och tydlig tidsplan", icon: "clipboard" },
    ],
    steps: [
      "Berätta vad du vill måla, bygga eller renovera.",
      "Vi går igenom omfattning, material och tid.",
      "Rätt hantverkare hjälper dig från start till färdigt resultat.",
    ],
    benefits: [
      "Tydlig plan innan arbetet startar",
      "Hantverk med omsorg om helheten",
      "Lösningar som passar både stil och vardag",
    ],
    faqs: [
      {
        question: "Vad ingår i måleri, bygg och renovering?",
        answer:
          "Vi hjälper med målning och ytskikt, mindre byggprojekt, hemförbättringar och avgränsade renoveringar. Omfattningen går vi igenom tillsammans innan arbetet startar.",
      },
      {
        question: "Kan jag boka både små jobb och större renoveringar?",
        answer:
          "Ja. Tjänsten passar både för mindre förbättringar, till exempel målning av ett rum, och för tydligt avgränsade renoveringsuppdrag.",
      },
      {
        question: "Hur går en förfrågan till?",
        answer:
          "Du skickar en förfrågan via webbplatsen med beskrivning av uppdraget och önskad tidsram. Vi återkommer med nästa steg, ofta inom en arbetsdag.",
      },
      {
        question: "Hjälper ni till med material och planering?",
        answer:
          "Ja. Vi kan ge råd om material, omfattning och prioriteringar så att planen blir tydlig innan arbetet börjar.",
      },
      {
        question: "Var utför ni arbeten?",
        answer:
          "Vi arbetar främst i Stockholm med omnejd. Ange postnummer och ort i förfrågan så återkommer vi med förutsättningar för ditt område.",
      },
      {
        question: "Har ni referensjobb jag kan se?",
        answer:
          "Ja. På sidan Referenser visar vi utvalda uppdrag, till exempel fasadmålning, så du får en känsla för resultatet.",
      },
    ],
    seo: {
      title: "Måleri, bygg och renovering | HemVända",
      description:
        "Boka måleri, bygg och renovering med HemVända. Trygg hjälp med hemförbättringar och genomtänkta lösningar.",
    },
  },
  {
    slug: "handyman",
    title: "Handyman",
    eyebrow: "Småfix som blir gjort",
    description:
      "Flexibel hjälp med montering, upphängning, reparationer och praktiska vardagsjobb.",
    hero:
      "När listan med småsaker växer hjälper HemVända dig att få ordning. Vi tar hand om fixet så att hemmet fungerar smidigare.",
    summaryTitle: "Praktisk hjälp i vardagen",
    summary:
      "Handyman-tjänster för praktiska uppdrag i hemmet, från montering och upphängning till enklare reparationer.",
    icon: "wrench",
    accent: "Hemfix",
    includes: [
      { label: "Montering av möbler och inredning", icon: "box" },
      { label: "Upphängning av hyllor, tavlor och gardiner", icon: "layers" },
      { label: "Enklare reparationer och justeringar", icon: "wrench" },
      { label: "Praktisk hjälp inför styling eller renovering", icon: "truck" },
    ],
    steps: [
      "Samla dina fixpunkter i en bokning.",
      "Vi matchar uppdraget med rätt kompetens.",
      "Arbetet utförs effektivt, tryggt och snyggt.",
    ],
    benefits: [
      "Perfekt för små och blandade uppdrag",
      "Tydlig tidsbokning",
      "Mindre krångel i vardagen",
    ],
    faqs: [
      {
        question: "Vilka uppdrag passar för Handyman?",
        answer:
          "Handyman passar för praktiska jobb hemma: montering av möbler, upphängning av hyllor, tavlor och gardiner, justeringar och enklare reparationer.",
      },
      {
        question: "Kan jag samla flera småjobb i samma bokning?",
        answer:
          "Ja, det är precis så tjänsten är tänkt. Beskriv gärna hela listan i förfrågan så planerar vi tiden utifrån det.",
      },
      {
        question: "Hur bokar jag Handyman?",
        answer:
          "Skicka en förfrågan via webbplatsen med vad som ska göras och när det passar. Vi återkommer med upplägg och nästa steg.",
      },
      {
        question: "Behöver jag köpa material själv?",
        answer:
          "Oftast ja för saker som skruvar, fästen eller delar som hör till din produkt. Skriv gärna i förfrågan om du vill ha råd om vad som behövs innan besöket.",
      },
      {
        question: "Hur lång tid tar ett typiskt besök?",
        answer:
          "Det beror på hur många punkter du har. Mindre uppdrag kan ofta klaras på ett besök; större listor planerar vi utifrån tid och prioritering.",
      },
      {
        question: "Kan Handyman kombineras med städ eller inredning?",
        answer:
          "Ja. Många bokar Handyman inför styling, efter en renovering eller tillsammans med andra HemVända-tjänster.",
      },
    ],
    seo: {
      title: "Handyman | HemVända",
      description:
        "Boka Handyman med HemVända. Få hjälp med montering, upphängning, småfix och enklare reparationer hemma.",
    },
  },
  {
    slug: "inredning",
    title: "Inredning",
    eyebrow: "Känsla i varje rum",
    description:
      "Inredning och styling som lyfter hemmet inför vardag, fotografering eller försäljning.",
    hero:
      "Vi skapar hem som känns rätt. Med färg, möblering och detaljer hjälper vi varje rum att hitta sin form.",
    summaryTitle: "Inredning som lyfter helheten",
    summary:
      "HemVända inredning är för dig som vill få fram värmen, balansen och potentialen i ditt hem.",
    icon: "chair",
    accent: "Styling",
    includes: [
      { label: "Homestyling inför försäljning", icon: "chair" },
      { label: "Rumsförnyelse och möbleringsförslag", icon: "sparkles" },
      { label: "Färg- och materialrådgivning", icon: "leaf" },
      { label: "Detaljer som skapar rätt helhetskänsla", icon: "heart" },
    ],
    steps: [
      "Berätta vilket rum eller mål du har.",
      "Vi tar fram riktning, prioriteringar och känsla.",
      "Stylingen genomförs med omsorg om helheten.",
    ],
    benefits: [
      "Varm och tidlös känsla",
      "Starkare första intryck",
      "Råd som fungerar i vardagen",
    ],
    faqs: [
      {
        question: "Vad ingår i inredning och styling?",
        answer:
          "Vi hjälper med rumsförnyelse, möbleringsförslag, färg- och materialrådgivning, homestyling inför försäljning och detaljer som skapar en tydlig helhetskänsla.",
      },
      {
        question: "Kan jag boka inredning för ett enskilt rum?",
        answer:
          "Ja. Du kan boka hjälp för ett rum, flera rum eller hela hemmet – beroende på ditt mål och budget.",
      },
      {
        question: "Är inredning bara inför försäljning?",
        answer:
          "Nej. Homestyling inför försäljning är ett vanligt behov, men många vill också skapa mer trivsel och funktion i hemmet de bor i.",
      },
      {
        question: "Hur går en inredningsförfrågan till?",
        answer:
          "Du beskriver rum, mål och tidsram via webbplatsen. Vi återkommer med förslag på upplägg och nästa steg.",
      },
      {
        question: "Behöver jag köpa nya möbler?",
        answer:
          "Inte nödvändigtvis. Ofta tar vi utgångspunkt i det du redan har och kompletterar med färg, placering och detaljer. Behövs inköp går vi igenom det tillsammans.",
      },
      {
        question: "Kan inredning kombineras med Handyman eller måleri?",
        answer:
          "Ja. Många kombinerar styling med montering, upphängning eller målning för ett mer sammanhängande resultat.",
      },
    ],
    seo: {
      title: "Inredning | HemVända",
      description:
        "Boka inredning och styling med HemVända för ett hem som känns varmt, genomtänkt och personligt.",
    },
  },
  {
    slug: "ovriga-tjanster",
    title: "Övriga tjänster",
    eyebrow: "Rätt hjälp när hemmet behöver mer",
    description:
      "Vi kan även erbjuda rörmokare, elektriker och besiktningsman via vårt nätverk.",
    hero:
      "Alla behov passar inte i en standardtjänst. Därför samlar HemVända övriga tjänster som rörmokare, elektriker och besiktningsman.",
    summaryTitle: "Specialister när hemmet behöver mer",
    summary:
      "Övriga tjänster fungerar som en huvudsida för specialistuppdrag och kompletterande hjälp runt hemmet.",
    icon: "more",
    accent: "Specialister",
    includes: [
      { label: "Rörmokare för VVS-relaterade uppdrag", icon: "droplet" },
      { label: "Elektriker för elarbeten och installationer", icon: "bolt" },
      { label: "Besiktningsman inför köp, försäljning eller åtgärder", icon: "search" },
      { label: "Råd om rätt specialist för ditt behov", icon: "clipboard" },
    ],
    subServices: ["Rörmokare", "Elektriker", "Besiktningsman"],
    steps: [
      "Beskriv vilken typ av specialist du behöver.",
      "Vi går igenom uppdragets omfattning och förutsättningar.",
      "Du får hjälp att komma vidare med rätt kompetens.",
    ],
    benefits: [
      "En tydlig ingång till flera tjänster",
      "Möjlighet att kombinera med HemVändas huvudtjänster",
      "Tryggare väg till rätt specialist",
    ],
    faqs: [
      {
        question: "Vilka övriga tjänster erbjuder ni?",
        answer:
          "Via vårt nätverk kan vi hjälpa dig vidare med rörmokare, elektriker och besiktningsman när hemmet behöver specialistkompetens.",
      },
      {
        question: "Kan jag boka specialisttjänster direkt online?",
        answer:
          "Du skickar en förfrågan via webbplatsen. Vi återkommer med upplägg och nästa steg utifrån typ av uppdrag.",
      },
      {
        question: "När ska jag välja rörmokare, elektriker eller besiktning?",
        answer:
          "Rörmokare passar VVS-relaterade behov, elektriker elarbeten och installationer, och besiktningsman inför köp, försäljning eller åtgärder. Osäker? Beskriv behovet så vägleder vi dig.",
      },
      {
        question: "Kan specialisttjänster kombineras med städ eller renovering?",
        answer:
          "Ja. Du kan kombinera med städ, handyman, inredning eller måleri/bygg beroende på vad som behövs i hemmet.",
      },
      {
        question: "Hur snabbt återkommer ni?",
        answer:
          "Vi strävar efter att återkomma inom en arbetsdag. Vid akut behov – skriv det tydligt i förfrågan.",
      },
    ],
    seo: {
      title: "Övriga tjänster | HemVända",
      description:
        "HemVända erbjuder även rörmokare, elektriker och besiktningsman som övriga tjänster.",
    },
  },
];

const MENU_HIDDEN_SERVICE_SLUGS = new Set(["ovriga-tjanster"]);

export function getNavServices() {
  return services.filter((service) => !MENU_HIDDEN_SERVICE_SLUGS.has(service.slug));
}

export function getBookingModalServices() {
  return services.filter(
    (service) => !MENU_HIDDEN_SERVICE_SLUGS.has(service.slug),
  );
}

export function getService(slug: string) {
  return services.find((service) => service.slug === slug);
}
