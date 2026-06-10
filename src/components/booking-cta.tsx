import { services } from "@/lib/services";

type BookingCtaProps = {
  compact?: boolean;
  defaultService?: string;
  formId?: string;
};

export function BookingCta({
  compact = false,
  defaultService,
  formId = "boka",
}: BookingCtaProps) {
  const initialService = defaultService ?? services[0]?.slug ?? "";
  const serviceInputName = `${formId}-service`;

  return (
    <>
      <form
        id={formId}
        data-booking-form
        noValidate
        className={
          compact
            ? "w-full rounded-xl border border-white/45 bg-white/35 p-6 backdrop-blur"
            : "rounded-xl border border-green/10 bg-card p-4 shadow-[0_24px_80px_rgba(47,58,51,0.12)] md:p-6"
        }
      >
        <div className={compact ? "flex flex-col gap-4" : "flex flex-col gap-4 md:max-w-md"}>
          <label className="block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-green/60">
              Postnummer
            </span>
            <div className="relative flex h-14 w-full items-center rounded-full border border-green/15 bg-white px-5">
              <input
                type="text"
                inputMode="numeric"
                autoComplete="postal-code"
                enterKeyHint="go"
                maxLength={6}
                data-postal-input
                placeholder="123 45"
                aria-describedby={`${formId}-hint`}
                className="w-full min-w-0 border-0 bg-transparent p-0 pr-28 text-base text-green outline-none placeholder:text-muted/70"
              />
              <span
                data-form-postal-loading
                className="pointer-events-none absolute right-5 hidden text-base text-muted"
                aria-hidden="true"
              >
                ...
              </span>
              <span
                data-form-postal-place
                className="pointer-events-none absolute right-5 hidden max-w-[58%] truncate text-base font-semibold text-green"
                aria-hidden="true"
              />
            </div>
          </label>
          <button
            type="submit"
            data-submit-button
            disabled
            className={`h-14 rounded-full bg-gold px-7 text-sm font-bold text-green transition hover:bg-sand disabled:cursor-not-allowed disabled:opacity-60 ${
              compact ? "w-full" : "w-full md:w-auto md:min-w-36"
            }`}
          >
            Fortsätt
          </button>
        </div>
        <p
          id={`${formId}-hint`}
          data-postal-hint
          className="mt-4 text-xs leading-5 text-muted"
        >
          Ange fem siffror - vi formaterar automatiskt till 123 45.
        </p>
      </form>

      <div
        id={`${formId}-service-modal`}
        data-service-modal
        data-modal-for={formId}
        className="fixed inset-0 z-[9999] hidden items-end justify-center bg-green/45 p-0 backdrop-blur-sm md:items-center md:p-4"
        aria-hidden="true"
      >
        <button
          type="button"
          data-modal-close
          className="absolute inset-0 cursor-default"
          aria-label="Stäng tjänsteval"
        />
        <div
          className="relative flex max-h-[88vh] w-full flex-col overflow-hidden rounded-t-xl border border-green/10 bg-card shadow-[0_24px_80px_rgba(47,58,51,0.24)] md:max-w-2xl md:rounded-xl"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`${formId}-services-title`}
        >
          <div className="relative border-b border-green/10 p-5 pt-6 md:p-6">
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-green/20 md:hidden" />
            <button
              type="button"
              data-modal-close
              className="absolute right-4 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-green/10 text-green/70 transition hover:border-gold/50 hover:text-gold md:right-6 md:top-6"
              aria-label="Stäng"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
            <div className="px-10 text-center md:px-12">
              <h2
                id={`${formId}-services-title`}
                className="font-display text-3xl text-green"
              >
                Hur kan vi hjälpa dig?
              </h2>
              <p className="mt-2 text-sm text-muted">
                Där du bor i{" "}
                <span data-modal-place className="font-semibold text-green" />
                <span
                  data-modal-place-loading
                  className="hidden text-muted"
                  aria-hidden="true"
                >
                  ...
                </span>
                , erbjuder vi följande tjänster
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5 md:p-6">
            <div className="grid gap-3">
              {services.map((service) => (
                <label
                  key={service.slug}
                  className="flex w-full cursor-pointer items-center justify-between rounded-lg border border-green/10 bg-white px-4 py-4 text-left text-sm text-green/80 transition has-checked:border-gold has-checked:bg-ivory has-checked:text-green hover:border-gold/50"
                >
                  <span>
                    <span className="block font-semibold">{service.title}</span>
                    <span className="mt-1 block text-sm leading-6 text-muted">
                      {service.description}
                    </span>
                  </span>
                  <input
                    type="radio"
                    name={serviceInputName}
                    value={service.slug}
                    defaultChecked={service.slug === initialService}
                    data-service-input
                    className="ml-4 h-4 w-4 shrink-0 accent-gold"
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="sticky bottom-0 border-t border-green/10 bg-card p-4 md:p-6">
            <button
              type="button"
              data-modal-continue
              className="h-14 w-full rounded-full bg-green px-7 text-sm font-bold text-white transition hover:bg-ink"
            >
              Fortsätt
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
