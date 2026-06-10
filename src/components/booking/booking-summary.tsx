import { bookingLocationLabel, serviceDisplayName } from "@/lib/booking";
import type { Service } from "@/lib/services";

type BookingSummaryProps = {
  service: Service;
  postnummer: string;
  kommun: string;
};

export function BookingSummary({ service, postnummer, kommun }: BookingSummaryProps) {
  return (
    <div className="rounded-xl border border-green/10 bg-card p-5 md:p-6">
      <p className="text-xs font-bold uppercase tracking-[0.24em] text-gold">
        Din bokning
      </p>
      <dl className="mt-4 space-y-3 text-sm">
        <div className="flex items-start justify-between gap-4">
          <dt className="text-muted">Tjänst</dt>
          <dd className="text-right font-semibold text-green">
            {serviceDisplayName(service)}
          </dd>
        </div>
        <div className="flex items-start justify-between gap-4">
          <dt className="text-muted">Ort</dt>
          <dd className="text-right font-semibold text-green">
            {bookingLocationLabel(postnummer, kommun)}
          </dd>
        </div>
      </dl>
    </div>
  );
}
