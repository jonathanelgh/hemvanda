"use client";

import {
  bookingHighlightClassName,
  bookingMethodOptionClassName,
} from "@/components/booking/booking-styles";
import { CheckIcon } from "@/components/booking/check-icon";
import {
  getCleaningBookingCopy,
  type CleaningBookingPath,
  type CleaningPropertyType,
} from "@/lib/booking";

type CleaningMethodStepProps = {
  plats?: CleaningPropertyType;
  onSelect: (path: CleaningBookingPath) => void;
  showOptions?: boolean;
};

export function CleaningMethodStep({
  plats,
  onSelect,
  showOptions = true,
}: CleaningMethodStepProps) {
  const copy = getCleaningBookingCopy(plats);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl leading-tight text-green md:text-5xl">
          {copy.methodTitle}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-8 text-muted">
          {copy.methodDescription}
        </p>
      </div>

      <ul className="grid gap-3 sm:grid-cols-3">
        {copy.highlights.map((highlight) => (
          <li
            key={highlight}
            className={bookingHighlightClassName}
          >
            <CheckIcon className="h-5 w-5 shrink-0 text-gold" />
            <span>{highlight}</span>
          </li>
        ))}
      </ul>

      <div className={showOptions ? "grid gap-4 md:grid-cols-2" : "hidden"}>
        {copy.methodOptions.map((option) => (
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
