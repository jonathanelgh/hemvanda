import { Icon } from "./icons";

export function SectionHeading({
  eyebrow,
  title,
  description,
  centered = false,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  centered?: boolean;
}) {
  return (
    <div className={centered ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-gold">
        {eyebrow}
      </p>
      <h2 className="mt-4 font-display text-4xl leading-tight text-green md:text-6xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-5 text-base leading-8 text-muted md:text-lg">
          {description}
        </p>
      ) : null}
    </div>
  );
}

export function ValuesSection() {
  const values = [
    {
      icon: "shield" as const,
      title: "Kvalitet",
      text: "Vi levererar hållbara lösningar med högsta kvalitet.",
    },
    {
      icon: "heart" as const,
      title: "Känsla",
      text: "Vi skapar hem som känns rätt, på riktigt.",
    },
    {
      icon: "users" as const,
      title: "Trygghet",
      text: "En kontakt. Hela lösningen. Tryggt från start till mål.",
    },
    {
      icon: "leaf" as const,
      title: "Hållbarhet",
      text: "Vi tänker långsiktigt och tar ansvar för framtiden.",
    },
  ];

  return (
    <section className="bg-green py-12 text-white">
      <div className="container-shell grid gap-4 md:grid-cols-4">
        {values.map((value) => (
          <div
            key={value.title}
            className="rounded-lg border border-white/10 p-6 text-white/75"
          >
            <Icon name={value.icon} className="h-8 w-8 text-gold" />
            <h3 className="mt-5 text-sm font-bold uppercase tracking-[0.22em] text-gold">
              {value.title}
            </h3>
            <p className="mt-3 text-sm leading-6">{value.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function StepsSection() {
  const steps = [
    {
      title: "Välj tjänst",
      text: "Börja med postnummer och välj vad du behöver hjälp med.",
    },
    {
      title: "Berätta behov",
      text: "Vi fångar detaljerna så att uppdraget blir tydligt från början.",
    },
    {
      title: "Få hjälp",
      text: "Rätt person eller team hjälper dig med ett tryggt upplägg.",
    },
  ];

  return (
    <section id="sa-fungerar-det" className="py-24">
      <div className="container-shell">
        <SectionHeading
          eyebrow="Så fungerar det"
          title="Tre steg till ett hem som känns nytt."
          description="Hemvanda är byggt för att göra vardagen enklare, från första kontakt till färdigt resultat."
          centered
        />
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="rounded-lg border border-green/10 bg-card p-7"
            >
              <span className="font-display text-5xl text-gold">
                0{index + 1}
              </span>
              <h3 className="mt-6 text-xl font-semibold text-green">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-muted">{step.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
