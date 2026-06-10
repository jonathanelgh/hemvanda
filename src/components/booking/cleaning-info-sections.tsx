import { bookingSectionClassName } from "@/components/booking/booking-styles";
import { CheckIcon } from "@/components/booking/check-icon";
import {
  cleaningFrequencyPlans,
  weekdayPreferenceOptions,
  type CleaningFrequency,
  type PetAnswer,
  type TidyingOption,
  type WeekdayPreference,
} from "@/lib/booking";

const fieldClassName =
  "h-14 w-full rounded-full border border-green/15 bg-white px-5 text-base text-green outline-none placeholder:text-muted/70";

function FieldLegend({
  label,
  required = false,
  learnMore = false,
}: {
  label: string;
  required?: boolean;
  learnMore?: boolean;
}) {
  return (
    <div className="mb-3 flex flex-wrap items-center gap-2">
      <span className="text-sm font-semibold text-green">
        {label}
        {required ? "*" : ""}
      </span>
      {learnMore ? (
        <button
          type="button"
          className="text-xs font-semibold text-gold underline-offset-2 hover:underline"
        >
          Läs mer
        </button>
      ) : null}
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
  tidying: TidyingOption;
  onTidyingChange: (value: TidyingOption) => void;
  weekdayPreference: WeekdayPreference;
  onWeekdayPreferenceChange: (value: WeekdayPreference) => void;
};

export function CleaningInfoSections({
  squareMeters,
  onSquareMetersChange,
  hasPets,
  onHasPetsChange,
  frequency,
  onFrequencyChange,
  tidying,
  onTidyingChange,
  weekdayPreference,
  onWeekdayPreferenceChange,
}: CleaningInfoSectionsProps) {
  return (
    <>
      <section className={bookingSectionClassName}>
        <FieldLegend label="Bostadsyta (kvm)" required />
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
          <FieldLegend label="Har du husdjur hemma?" required learnMore />
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

      <section className={bookingSectionClassName}>
        <FieldLegend label="Välj städfrekvens" required learnMore />
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
        <button
          type="button"
          onClick={() => onFrequencyChange("storstadning")}
          className={`mt-4 text-sm font-semibold underline-offset-2 hover:underline ${
            frequency === "storstadning" ? "text-green" : "text-gold"
          }`}
        >
          Vill du bara boka en enskild storstädning? Klicka här.
        </button>
      </section>

      <section className={bookingSectionClassName}>
        <FieldLegend
          label="Behöver du hjälp att förbereda inför städningen?"
          learnMore
        />
        <label className="flex cursor-pointer items-start gap-4 rounded-lg border border-green/10 bg-white px-4 py-4 transition has-checked:border-gold has-checked:bg-ivory">
          <input
            type="checkbox"
            checked={tidying === "ja-undanplockning"}
            onChange={(event) =>
              onTidyingChange(event.target.checked ? "ja-undanplockning" : "nej")
            }
            className="mt-1 h-4 w-4 shrink-0 accent-gold"
          />
          <span>
            <span className="block font-semibold text-green">
              Ja, lägg till undanplockning
            </span>
            <span className="mt-1 block text-sm leading-6 text-muted">
              När du bokar undanplockning slipper du förbereda hemmet själv. Vi
              börjar med att plocka undan, så att vi därefter kan fokusera fullt
              ut på städningen av ditt hem.
            </span>
          </span>
        </label>
      </section>

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
    </>
  );
}

export function isCleaningInfoComplete(
  squareMeters: string,
  hasPets: PetAnswer | "",
) {
  return (
    squareMeters.trim() !== "" &&
    Number(squareMeters) >= 10 &&
    hasPets !== ""
  );
}
