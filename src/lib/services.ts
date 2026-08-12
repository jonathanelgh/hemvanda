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
        question: "Kan städningen anpassas efter mitt hem?",
        answer:
          "Ja. Du kan välja frekvens, tillägg som ugn eller kyl vid storstäd, och beskriva särskilda önskemål.",
      },
      {
        question: "Vilka städtjänster kan jag boka online?",
        answer:
          "Hemstädning, storstädning, flyttstädning och fönsterputs. Priset visas innan du slutför bokningen.",
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
        question: "Kan jag boka mindre måleri- och byggjobb?",
        answer:
          "Ja, HemVända passar för både mindre förbättringar och tydligt avgränsade renoveringsuppdrag.",
      },
      {
        question: "Hjälper ni till med materialval?",
        answer:
          "Ja, tjänsten är upplagd för att kunna ge råd om material, omfattning och prioriteringar innan start.",
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
          "Handyman passar för mindre praktiska jobb som montering, upphängning, justeringar och enklare reparationer.",
      },
      {
        question: "Kan jag samla flera småjobb i samma bokning?",
        answer:
          "Ja, det är precis så tjänsten är tänkt att fungera. Du kan beskriva flera saker du vill få hjälp med.",
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
        question: "Kan jag boka inredning för ett enskilt rum?",
        answer:
          "Ja, HemVända kan hjälpa med allt från ett rum till ett helt hem.",
      },
      {
        question: "Är inredning bara inför försäljning?",
        answer:
          "Nej, inredning kan också handla om att skapa mer trivsel i hemmet du redan bor i.",
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
        question: "Är övriga tjänster bokningsbara direkt?",
        answer:
          "Du skickar en förfrågan så återkommer vi med upplägg och nästa steg per specialistområde.",
      },
      {
        question: "Kan specialisttjänster kombineras med städ eller renovering?",
        answer:
          "Ja, du kan kombinera med städ, handyman eller måleri/bygg beroende på vad du behöver.",
      },
    ],
    seo: {
      title: "Övriga tjänster | HemVända",
      description:
        "HemVända erbjuder även rörmokare, elektriker och besiktningsman som övriga tjänster.",
    },
  },
];

export function getService(slug: string) {
  return services.find((service) => service.slug === slug);
}
