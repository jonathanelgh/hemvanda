import type { Service } from "@/lib/services";

type ServiceFaqProps = {
  service: Service;
  compact?: boolean;
};

export function ServiceFaq({ service, compact = false }: ServiceFaqProps) {
  if (service.faqs.length === 0) {
    return null;
  }

  return (
    <div className={compact ? "mt-10" : "mt-14"}>
      <h2 className="font-display text-2xl text-green md:text-3xl">
        Vanliga frågor
      </h2>
      <p className="mt-3 max-w-xl text-sm leading-7 text-muted">
        Svar på det vi oftast får höra om {service.title.toLowerCase()}.
      </p>
      <div className="mt-6 space-y-3">
        {service.faqs.map((faq) => (
          <details
            key={faq.question}
            className="group rounded-xl border border-green/10 bg-card p-5 md:p-6"
          >
            <summary className="cursor-pointer list-none text-base font-semibold text-green [&::-webkit-details-marker]:hidden">
              {faq.question}
            </summary>
            <p className="mt-4 text-sm leading-7 text-muted">{faq.answer}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
