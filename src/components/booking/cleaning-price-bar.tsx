"use client";

import { useMemo, useState } from "react";
import {
  calculateCleaningPrice,
  formatKr,
  type CleaningPricingInput,
} from "@/lib/cleaning-pricing";

type CleaningPriceBarProps = CleaningPricingInput;

export function CleaningPriceBar({
  squareMeters,
  hasPets,
  frequency,
  tidying,
  weekdayPreference,
  propertyType,
  addons,
  windowCount,
  windowMode,
}: CleaningPriceBarProps) {
  const [expanded, setExpanded] = useState(false);
  const quote = useMemo(
    () =>
      calculateCleaningPrice({
        squareMeters,
        hasPets,
        frequency,
        tidying,
        weekdayPreference,
        propertyType,
        addons,
        windowCount,
        windowMode,
      }),
    [
      squareMeters,
      hasPets,
      frequency,
      tidying,
      weekdayPreference,
      propertyType,
      addons,
      windowCount,
      windowMode,
    ],
  );

  return (
    <div className="fixed inset-x-0 bottom-0 z-50">
      <div className="mx-auto w-full max-w-3xl">
        <div className="overflow-hidden rounded-t-xl border border-b-0 border-green/10 bg-card shadow-[0_-12px_40px_rgba(47,58,51,0.12)]">
          {expanded ? (
            <div className="border-b border-green/10 px-4 py-4 md:px-6">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">
                Prisdetaljer
              </p>
              {quote.isEstimate ? (
                <p className="mt-2 text-xs text-muted">
                  Uppskattat pris. Fyll i alla uppgifter för exakt pris.
                </p>
              ) : null}
              <dl className="mt-4 space-y-3">
                {quote.lines.map((line) => (
                  <div
                    key={line.label}
                    className="flex items-start justify-between gap-4 text-sm"
                  >
                    <dt className="text-muted">{line.label}</dt>
                    <dd className="shrink-0 text-right font-medium text-green">
                      {line.amount === null ? (
                        <span>{line.note}</span>
                      ) : line.amount === 0 && line.note ? (
                        <span className="text-muted">{line.note}</span>
                      ) : (
                        <span>
                          {line.amount < 0 ? "−" : ""}
                          {formatKr(Math.abs(line.amount))}
                        </span>
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
              <div className="mt-4 flex items-center justify-between border-t border-green/10 pt-4">
                <span className="text-sm font-semibold text-green">{quote.priceLabel}</span>
                <span className="font-display text-2xl text-green">
                  {formatKr(quote.total)}
                </span>
              </div>
            </div>
          ) : null}

          <div className="flex items-center justify-between gap-4 px-4 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] md:px-6">
            <button
              type="button"
              onClick={() => setExpanded((value) => !value)}
              className="inline-flex items-center gap-2 text-sm font-semibold text-green transition hover:text-gold"
              aria-expanded={expanded}
            >
              <span>{expanded ? "Dölj detaljer" : "Visa detaljer"}</span>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`}
                aria-hidden="true"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>

            <div className="text-right">
              <p className="text-xs text-muted">{quote.priceLabel}</p>
              <p className="font-display text-2xl leading-none text-green md:text-3xl">
                {formatKr(quote.total)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const cleaningPriceBarSpacerClassName = "pb-36 md:pb-32";
