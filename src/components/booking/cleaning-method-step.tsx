"use client";

import {
  bookingHighlightClassName,
  bookingMethodOptionClassName,
} from "@/components/booking/booking-styles";
import { CheckIcon } from "@/components/booking/check-icon";
import {
  cleaningHighlights,
  cleaningMethodOptions,
  type CleaningBookingPath,
} from "@/lib/booking";

type CleaningMethodStepProps = {
  onSelect: (path: CleaningBookingPath) => void;
};

export function CleaningMethodStep({ onSelect }: CleaningMethodStepProps) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl leading-tight text-green md:text-5xl">
          Hur vill du boka din hemstädning?
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-8 text-muted">
          Välj om du vill boka direkt eller prata med en av våra experter.
          Behöver du mer information? Läs mer om våra abonnemang, momentlistor
          och svar på vanliga frågor.
        </p>
      </div>

      <ul className="grid gap-3 sm:grid-cols-3">
        {cleaningHighlights.map((highlight) => (
          <li
            key={highlight}
            className={bookingHighlightClassName}
          >
            <CheckIcon className="h-5 w-5 shrink-0 text-gold" />
            <span>{highlight}</span>
          </li>
        ))}
      </ul>

      <div className="grid gap-4 md:grid-cols-2">
        {cleaningMethodOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onSelect(option.value)}
            className={bookingMethodOptionClassName}
          >
            <span className="min-w-0 flex-1">
              <h2 className="font-display text-2xl text-green">{option.title}</h2>
              <p className="mt-3 text-sm leading-7 text-muted">{option.description}</p>
            </span>
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-green/15 text-green transition group-hover:border-gold"
              aria-hidden="true"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
