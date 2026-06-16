"use client";

import { useMemo } from "react";
import {
  adminPricingModeOptions,
  isCleaningServiceSlug,
  requiresManualPricing,
  serviceTimeframeOptions,
  usesCalculatedCleaningPrice,
  type AdminPricingMode,
} from "@/lib/admin/schedule-booking";
import {
  cleaningFrequencyPlans,
  cleaningPropertyOptions,
  getCleaningBookingCopy,
  keyAccessOptions,
  type CleaningFrequency,
  type CleaningPropertyType,
  type KeyAccess,
  type PetAnswer,
  type TidyingOption,
} from "@/lib/booking";
import { calculateCleaningPrice, formatKr } from "@/lib/cleaning-pricing";

const inputClassName =
  "mt-1 w-full rounded-xl border border-green/15 bg-white px-4 py-3 text-sm text-green outline-none transition focus:border-gold";
const textareaClassName =
  "mt-1 w-full resize-y rounded-xl border border-green/15 bg-ivory/40 px-4 py-3 text-sm text-green outline-none transition focus:border-gold";

type ScheduleCreateBookingServiceFieldsProps = {
  serviceSlug: string;
  cleaningPropertyType: CleaningPropertyType;
  onCleaningPropertyTypeChange: (value: CleaningPropertyType) => void;
  squareMeters: string;
  onSquareMetersChange: (value: string) => void;
  hasPets: PetAnswer | "";
  onHasPetsChange: (value: PetAnswer) => void;
  frequency: CleaningFrequency;
  onFrequencyChange: (value: CleaningFrequency) => void;
  tidying: TidyingOption;
  onTidyingChange: (value: TidyingOption) => void;
  keyAccess: KeyAccess;
  onKeyAccessChange: (value: KeyAccess) => void;
  pricingMode: AdminPricingMode;
  onPricingModeChange: (value: AdminPricingMode) => void;
  fixedPriceKr: string;
  onFixedPriceKrChange: (value: string) => void;
  message: string;
  onMessageChange: (value: string) => void;
  timeframe: string;
  onTimeframeChange: (value: string) => void;
  durationMinutes: string;
  onDurationMinutesChange: (value: string) => void;
  staffId: string;
  onStaffIdChange: (value: string) => void;
  note: string;
  onNoteChange: (value: string) => void;
  staffMembers: { userId: string; name: string }[];
};

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-sm font-semibold text-green">{children}</span>;
}

function PricingModeFields({
  pricingMode,
  onPricingModeChange,
  fixedPriceKr,
  onFixedPriceKrChange,
}: {
  pricingMode: AdminPricingMode;
  onPricingModeChange: (value: AdminPricingMode) => void;
  fixedPriceKr: string;
  onFixedPriceKrChange: (value: string) => void;
}) {
  return (
    <>
      <div className="sm:col-span-2">
        <FieldLabel>Prisupplägg</FieldLabel>
        <div className="mt-2 grid gap-2">
          {adminPricingModeOptions.map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer items-start gap-3 rounded-xl border border-green/10 bg-white px-4 py-3 transition has-checked:border-gold has-checked:bg-gold/10"
            >
              <input
                type="radio"
                name="pricingMode"
                value={option.value}
                checked={pricingMode === option.value}
                onChange={() => onPricingModeChange(option.value)}
                className="mt-1 accent-gold"
              />
              <span>
                <span className="block text-sm font-semibold text-green">
                  {option.label}
                </span>
                <span className="mt-0.5 block text-xs text-muted">
                  {option.description}
                </span>
              </span>
            </label>
          ))}
        </div>
      </div>
      {pricingMode === "fixed" ? (
        <label className="block sm:col-span-2">
          <FieldLabel>Fast pris (kr)</FieldLabel>
          <input
            type="number"
            min={1}
            value={fixedPriceKr}
            onChange={(event) => onFixedPriceKrChange(event.target.value)}
            className={inputClassName}
            placeholder="t.ex. 2500"
          />
        </label>
      ) : null}
    </>
  );
}

export function ScheduleCreateBookingServiceFields({
  serviceSlug,
  cleaningPropertyType,
  onCleaningPropertyTypeChange,
  squareMeters,
  onSquareMetersChange,
  hasPets,
  onHasPetsChange,
  frequency,
  onFrequencyChange,
  tidying,
  onTidyingChange,
  keyAccess,
  onKeyAccessChange,
  pricingMode,
  onPricingModeChange,
  fixedPriceKr,
  onFixedPriceKrChange,
  message,
  onMessageChange,
  timeframe,
  onTimeframeChange,
  durationMinutes,
  onDurationMinutesChange,
  staffId,
  onStaffIdChange,
  note,
  onNoteChange,
  staffMembers,
}: ScheduleCreateBookingServiceFieldsProps) {
  const cleaningCopy = getCleaningBookingCopy(cleaningPropertyType);
  const showCalculatedPrice = usesCalculatedCleaningPrice(
    serviceSlug,
    cleaningPropertyType,
  );
  const showManualPricing = requiresManualPricing(serviceSlug, cleaningPropertyType);

  const calculatedPrice = useMemo(() => {
    if (!showCalculatedPrice || !squareMeters || !hasPets) {
      return null;
    }

    return calculateCleaningPrice({
      squareMeters,
      hasPets,
      frequency,
      tidying,
      weekdayPreference: "valj-dag",
    });
  }, [
    showCalculatedPrice,
    squareMeters,
    hasPets,
    frequency,
    tidying,
  ]);

  return (
    <>
      {isCleaningServiceSlug(serviceSlug) ? (
        <section>
          <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-green/50">
            Städuppgifter
          </h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <FieldLabel>Typ av städ</FieldLabel>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {cleaningPropertyOptions.map((option) => (
                  <label
                    key={option.value}
                    className="flex cursor-pointer flex-col rounded-xl border border-green/10 bg-white px-4 py-3 transition has-checked:border-gold has-checked:bg-gold/10"
                  >
                    <input
                      type="radio"
                      name="cleaningPropertyType"
                      value={option.value}
                      checked={cleaningPropertyType === option.value}
                      onChange={() => onCleaningPropertyTypeChange(option.value)}
                      className="sr-only"
                    />
                    <span className="text-sm font-semibold text-green">
                      {option.label}
                    </span>
                    <span className="mt-1 text-xs text-muted">
                      {option.description}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <label className="block">
              <FieldLabel>{cleaningCopy.squareMetersLabel}</FieldLabel>
              <input
                type="number"
                min={10}
                value={squareMeters}
                onChange={(event) => onSquareMetersChange(event.target.value)}
                className={inputClassName}
              />
            </label>

            <label className="block">
              <FieldLabel>{cleaningCopy.petsLabel}</FieldLabel>
              <select
                value={hasPets}
                onChange={(event) =>
                  onHasPetsChange(event.target.value as PetAnswer)
                }
                className={inputClassName}
              >
                <option value="">Välj...</option>
                <option value="nej">Nej</option>
                <option value="ja">Ja</option>
              </select>
            </label>

            <label className="block">
              <FieldLabel>Frekvens</FieldLabel>
              <select
                value={frequency}
                onChange={(event) =>
                  onFrequencyChange(event.target.value as CleaningFrequency)
                }
                className={inputClassName}
              >
                {cleaningFrequencyPlans.map((plan) => (
                  <option key={plan.value} value={plan.value}>
                    {plan.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <FieldLabel>Undanplockning</FieldLabel>
              <select
                value={tidying}
                onChange={(event) =>
                  onTidyingChange(event.target.value as TidyingOption)
                }
                className={inputClassName}
              >
                <option value="nej">Nej</option>
                <option value="ja-undanplockning">Ja, undanplockning</option>
              </select>
            </label>

            <div className="sm:col-span-2">
              <FieldLabel>Nyckelåtkomst</FieldLabel>
              <div className="mt-2 grid gap-2">
                {keyAccessOptions.map((option) => (
                  <label
                    key={option.value}
                    className="flex cursor-pointer items-start gap-3 rounded-xl border border-green/10 bg-white px-4 py-3 transition has-checked:border-gold has-checked:bg-gold/10"
                  >
                    <input
                      type="radio"
                      name="keyAccess"
                      value={option.value}
                      checked={keyAccess === option.value}
                      onChange={() => onKeyAccessChange(option.value)}
                      className="mt-1 accent-gold"
                    />
                    <span className="text-sm leading-6 text-green">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {showCalculatedPrice && calculatedPrice ? (
              <div className="rounded-xl border border-gold/30 bg-gold/10 px-4 py-3 sm:col-span-2">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">
                  Beräknat pris
                </p>
                <p className="mt-1 text-lg font-semibold text-green">
                  {formatKr(calculatedPrice.total)}
                </p>
              </div>
            ) : null}

            {showManualPricing ? (
              <PricingModeFields
                pricingMode={pricingMode}
                onPricingModeChange={onPricingModeChange}
                fixedPriceKr={fixedPriceKr}
                onFixedPriceKrChange={onFixedPriceKrChange}
              />
            ) : null}
          </div>
        </section>
      ) : (
        <section>
          <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-green/50">
            Uppdrag
          </h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <FieldLabel>Beskriv uppdraget</FieldLabel>
              <textarea
                value={message}
                onChange={(event) => onMessageChange(event.target.value)}
                rows={4}
                placeholder="Beskriv vad som ska göras, omfattning och önskemål..."
                className={textareaClassName}
              />
            </label>
            <label className="block sm:col-span-2">
              <FieldLabel>Tidsram</FieldLabel>
              <select
                value={timeframe}
                onChange={(event) => onTimeframeChange(event.target.value)}
                className={inputClassName}
              >
                {serviceTimeframeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <PricingModeFields
              pricingMode={pricingMode}
              onPricingModeChange={onPricingModeChange}
              fixedPriceKr={fixedPriceKr}
              onFixedPriceKrChange={onFixedPriceKrChange}
            />
          </div>
        </section>
      )}

      <section>
        <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-green/50">
          Besök
        </h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block">
            <FieldLabel>Längd (min)</FieldLabel>
            <input
              type="number"
              min={30}
              step={15}
              value={durationMinutes}
              onChange={(event) => onDurationMinutesChange(event.target.value)}
              className={inputClassName}
            />
          </label>
          <label className="block">
            <FieldLabel>Personal</FieldLabel>
            <select
              value={staffId}
              onChange={(event) => onStaffIdChange(event.target.value)}
              className={inputClassName}
            >
              <option value="">Ej tilldelad</option>
              {staffMembers.map((member) => (
                <option key={member.userId} value={member.userId}>
                  {member.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block sm:col-span-2">
            <FieldLabel>Anteckning</FieldLabel>
            <textarea
              value={note}
              onChange={(event) => onNoteChange(event.target.value)}
              rows={3}
              placeholder="Valfri intern anteckning..."
              className={textareaClassName}
            />
          </label>
        </div>
      </section>
    </>
  );
}
