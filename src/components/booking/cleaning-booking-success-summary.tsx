import {
  calculateCleaningPrice,
  formatKr,
  type CleaningPricingInput,
} from "@/lib/cleaning-pricing";
import { getCleaningFrequencyLabel } from "@/lib/booking-schedule";

type CleaningBookingSuccessSummaryProps = CleaningPricingInput & {
  selectedDate: string | null;
  selectedTime: string | null;
  showPrice?: boolean;
};

function formatVisitDate(dateKey: string) {
  return new Date(`${dateKey}T12:00:00`).toLocaleDateString("sv-SE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function CleaningBookingSuccessSummary({
  selectedDate,
  selectedTime,
  squareMeters,
  hasPets,
  frequency,
  tidying,
  weekdayPreference,
  showPrice = true,
}: CleaningBookingSuccessSummaryProps) {
  const quote = showPrice
    ? calculateCleaningPrice({
        squareMeters,
        hasPets,
        frequency,
        tidying,
        weekdayPreference,
      })
    : null;

  return (
    <dl className="mt-6 space-y-3 rounded-xl border border-green/10 bg-ivory/70 p-5 text-sm">
      {selectedDate && selectedTime ? (
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <dt className="font-semibold text-green">
            {showPrice ? "Första städtillfälle" : "Önskad start"}
          </dt>
          <dd className="text-muted">
            {formatVisitDate(selectedDate)} kl {selectedTime}
          </dd>
        </div>
      ) : null}
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <dt className="font-semibold text-green">Frekvens</dt>
        <dd className="text-muted">{getCleaningFrequencyLabel(frequency)}</dd>
      </div>
      {quote ? (
        <>
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-t border-green/10 pt-3">
            <dt className="font-semibold text-green">{quote.priceLabel}</dt>
            <dd className="font-display text-2xl text-green">
              {formatKr(quote.total)}
              {quote.isEstimate ? (
                <span className="ml-2 font-sans text-xs font-normal text-muted">
                  (uppskattat)
                </span>
              ) : null}
            </dd>
          </div>
          {frequency !== "storstadning" ? (
            <p className="text-xs leading-5 text-muted">
              Fast pris per månad baserat på din bostadsyta, frekvens och tillval.
              Städmaterial ingår.
            </p>
          ) : (
            <p className="text-xs leading-5 text-muted">
              Fast engångspris baserat på din bostadsyta och tillval. Städmaterial
              ingår.
            </p>
          )}
        </>
      ) : (
        <p className="text-xs leading-5 text-muted">
          Vi återkommer med pris baserat på uppgifterna du lämnat.
        </p>
      )}
    </dl>
  );
}
