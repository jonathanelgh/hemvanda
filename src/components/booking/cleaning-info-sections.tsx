import Link from "next/link";
import { bookingSectionClassName } from "@/components/booking/booking-styles";
import { CheckIcon } from "@/components/booking/check-icon";
import { ADDON_PRICES } from "@/lib/cleaning-pricing";
import {
  cleaningFrequencyPlans,
  weekdayPreferenceOptions,
  type CleaningAddons,
  type CleaningFrequency,
  type CleaningPropertyType,
  type PetAnswer,
  type WeekdayPreference,
  type WindowBookingMode,
} from "@/lib/booking";

const fieldClassName =
  "h-14 w-full rounded-full border border-green/15 bg-white px-5 text-base text-green outline-none placeholder:text-muted/70";

function FieldLegend({
  label,
  required = false,
}: {
  label: string;
  required?: boolean;
}) {
  return (
    <div className="mb-3 flex flex-wrap items-center gap-2">
      <span className="text-sm font-semibold text-green">
        {label}
        {required ? "*" : ""}
      </span>
    </div>
  );
}

type CleaningInfoSectionsProps = {
  squareMeters: string;
  onSquareMetersChange: (value: string) => void;
  hasPets: PetAnswer | "";
  onHasPetsChange: (value: PetAnswer) => void;
  frequency: CleaningFrequency;
  onFrequencyChange: (value: CleaningFrequency) => void;
  weekdayPreference: WeekdayPreference;
  onWeekdayPreferenceChange: (value: WeekdayPreference) => void;
  squareMetersLabel?: string;
  petsLabel?: string;
  propertyType?: CleaningPropertyType;
  storstadBookingHref?: string;
  addons: CleaningAddons;
  onAddonsChange: (value: CleaningAddons) => void;
  windowCount: string;
  onWindowCountChange: (value: string) => void;
  windowMode: WindowBookingMode;
  onWindowModeChange: (value: WindowBookingMode) => void;
};

function AddonCheckbox({
  checked,
  onChange,
  title,
  description,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  title: string;
  description: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-4 rounded-lg border border-green/10 bg-white px-4 py-4 transition has-checked:border-gold has-checked:bg-ivory">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-4 w-4 shrink-0 accent-gold"
      />
      <span>
        <span className="block font-semibold text-green">{title}</span>
        <span className="mt-1 block text-sm leading-6 text-muted">{description}</span>
      </span>
    </label>
  );
}

export function CleaningInfoSections({
  squareMeters,
  onSquareMetersChange,
  hasPets,
  onHasPetsChange,
  frequency,
  onFrequencyChange,
  weekdayPreference,
  onWeekdayPreferenceChange,
  squareMetersLabel = "Bostadsyta (kvm)",
  petsLabel = "Har du husdjur hemma?",
  propertyType,
  storstadBookingHref,
  addons,
  onAddonsChange,
  windowCount,
  onWindowCountChange,
  windowMode,
  onWindowModeChange,
}: CleaningInfoSectionsProps) {
  const isStorstad = propertyType === "storstad";
  const isFlyttstad = propertyType === "flyttstad";
  const isFonster = propertyType === "fonster";
  const isHem = !propertyType || propertyType === "hem";
  const showFrequency = isHem || (isFonster && windowMode === "abonnemang");
  const showWeekday = isHem;
  const showSqm = !isFonster;

  return (
    <>
      {isFonster ? (
        <section className={bookingSectionClassName}>
          <FieldLegend label="Hur vill du boka fönsterputs?" required />
          <div className="grid gap-3 sm:grid-cols-2">
            {(
              [
                {
                  value: "engang" as const,
                  title: "Engångs",
                  description: "Putsar fönstren en gång.",
                },
                {
                  value: "abonnemang" as const,
                  title: "Abonnemang",
                  description: "Återkommande fönsterputs med valt intervall.",
                },
              ] as const
            ).map((option) => (
              <label
                key={option.value}
                className="flex cursor-pointer items-start gap-4 rounded-lg border border-green/10 bg-white px-4 py-4 transition has-checked:border-gold has-checked:bg-ivory"
              >
                <input
                  type="radio"
                  name="windowMode"
                  value={option.value}
                  checked={windowMode === option.value}
                  onChange={() => onWindowModeChange(option.value)}
                  className="mt-1 h-4 w-4 shrink-0 accent-gold"
                />
                <span>
                  <span className="block font-semibold text-green">{option.title}</span>
                  <span className="mt-1 block text-sm leading-6 text-muted">
                    {option.description}
                  </span>
                </span>
              </label>
            ))}
          </div>

          <div className="mt-6">
            <FieldLegend label="Antal fönster" required />
            <input
              type="number"
              min={1}
              max={100}
              required
              value={windowCount}
              onChange={(event) => onWindowCountChange(event.target.value)}
              placeholder="t.ex. 8"
              className={fieldClassName}
            />
            <p className="mt-2 text-sm text-muted">
              {ADDON_PRICES.window} kr per fönster
            </p>
          </div>
        </section>
      ) : null}

      {showSqm ? (
        <section className={bookingSectionClassName}>
          <FieldLegend label={squareMetersLabel} required />
          <input
            type="number"
            min={10}
            max={500}
            required
            value={squareMeters}
            onChange={(event) => onSquareMetersChange(event.target.value)}
            placeholder="t.ex. 78"
            className={fieldClassName}
          />

          <div className="mt-6">
            <FieldLegend label={petsLabel} required />
            <div className="grid gap-3 sm:grid-cols-2">
              {(["ja", "nej"] as PetAnswer[]).map((value) => (
                <label
                  key={value}
                  className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-green/10 bg-white px-4 py-4 text-sm font-semibold text-green transition has-checked:border-gold has-checked:bg-ivory"
                >
                  <input
                    type="radio"
                    name="hasPets"
                    value={value}
                    checked={hasPets === value}
                    onChange={() => onHasPetsChange(value)}
                    className="h-4 w-4 accent-gold"
                  />
                  {value === "ja" ? "Ja" : "Nej"}
                </label>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section className={bookingSectionClassName}>
          <FieldLegend label={petsLabel} required />
          <div className="grid gap-3 sm:grid-cols-2">
            {(["ja", "nej"] as PetAnswer[]).map((value) => (
              <label
                key={value}
                className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-green/10 bg-white px-4 py-4 text-sm font-semibold text-green transition has-checked:border-gold has-checked:bg-ivory"
              >
                <input
                  type="radio"
                  name="hasPets"
                  value={value}
                  checked={hasPets === value}
                  onChange={() => onHasPetsChange(value)}
                  className="h-4 w-4 accent-gold"
                />
                {value === "ja" ? "Ja" : "Nej"}
              </label>
            ))}
          </div>
        </section>
      )}

      {showFrequency ? (
        <section className={bookingSectionClassName}>
          <FieldLegend label="Välj städfrekvens" required />
          <div className="grid gap-3">
            {cleaningFrequencyPlans.map((plan) => (
              <label
                key={plan.value}
                className="block cursor-pointer rounded-lg border border-green/10 bg-white px-4 py-4 transition has-checked:border-gold has-checked:bg-ivory"
              >
                <div className="flex items-start gap-4">
                  <input
                    type="radio"
                    name="frequency"
                    value={plan.value}
                    checked={frequency === plan.value}
                    onChange={() => onFrequencyChange(plan.value)}
                    className="mt-1 h-4 w-4 shrink-0 accent-gold"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-green">{plan.label}</span>
                      {plan.badge ? (
                        <span className="rounded-full bg-gold/20 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-green">
                          {plan.badge}
                        </span>
                      ) : null}
                    </span>
                    <ul className="mt-3 space-y-1.5">
                      {plan.benefits.map((benefit) => (
                        <li
                          key={benefit}
                          className="flex items-start gap-2 text-sm text-muted"
                        >
                          <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-3 text-sm leading-6 text-muted">
                      {plan.description}
                    </p>
                  </span>
                </div>
              </label>
            ))}
          </div>
          {storstadBookingHref ? (
            <Link
              href={storstadBookingHref}
              className="mt-4 inline-block text-sm font-semibold text-gold underline-offset-2 hover:underline"
            >
              Vill du i stället boka storstädning? Klicka här.
            </Link>
          ) : null}
        </section>
      ) : null}

      {isStorstad ? (
        <section className={bookingSectionClassName}>
          <FieldLegend label="Tillägg till storstädningen" />
          <div className="grid gap-3">
            <AddonCheckbox
              checked={Boolean(addons.oven)}
              onChange={(checked) => onAddonsChange({ ...addons, oven: checked })}
              title={`Ugnsrengöring (${ADDON_PRICES.oven} kr)`}
              description="Grundlig rengöring av ugn."
            />
            <AddonCheckbox
              checked={Boolean(addons.fridge)}
              onChange={(checked) => onAddonsChange({ ...addons, fridge: checked })}
              title={`Kylskåpsrengöring (${ADDON_PRICES.fridge} kr)`}
              description="Rengöring inuti kylskåp."
            />
            <AddonCheckbox
              checked={Boolean(addons.supplies)}
              onChange={(checked) => onAddonsChange({ ...addons, supplies: checked })}
              title={`Städredskap (${ADDON_PRICES.supplies} kr)`}
              description="Om vi behöver ta med städredskap till tillfället."
            />
          </div>
        </section>
      ) : null}

      {isFlyttstad ? (
        <section className={bookingSectionClassName}>
          <FieldLegend label="Tillägg till flyttstädningen" />
          <div className="grid gap-3">
            <AddonCheckbox
              checked={Boolean(addons.balcony)}
              onChange={(checked) => onAddonsChange({ ...addons, balcony: checked })}
              title={`Balkong (${ADDON_PRICES.balcony} kr)`}
              description="Lägg till städning av balkong."
            />
          </div>
        </section>
      ) : null}

      {showWeekday ? (
        <section className={bookingSectionClassName}>
          <FieldLegend label="Vill du välja veckodag för din städning?" required />
          <div className="grid gap-3">
            {weekdayPreferenceOptions.map((option) => (
              <label
                key={option.value}
                className="flex cursor-pointer items-start gap-4 rounded-lg border border-green/10 bg-white px-4 py-4 transition has-checked:border-gold has-checked:bg-ivory"
              >
                <input
                  type="radio"
                  name="weekdayPreference"
                  value={option.value}
                  checked={weekdayPreference === option.value}
                  onChange={() => onWeekdayPreferenceChange(option.value)}
                  className="mt-1 h-4 w-4 shrink-0 accent-gold"
                />
                <span>
                  <span className="block font-semibold text-green">{option.label}</span>
                  <span className="mt-1 block text-sm leading-6 text-muted">
                    {option.description}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}

export function isCleaningInfoComplete(
  squareMeters: string,
  hasPets: PetAnswer | "",
  propertyType?: CleaningPropertyType,
  windowCount?: string,
) {
  if (hasPets === "") return false;

  if (propertyType === "fonster") {
    return Boolean(windowCount?.trim()) && Number(windowCount) >= 1;
  }

  return squareMeters.trim() !== "" && Number(squareMeters) >= 10;
}
