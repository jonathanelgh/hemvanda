"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CleaningDirectForm } from "@/components/booking/cleaning-direct-form";
import { CleaningExpertForm } from "@/components/booking/cleaning-expert-form";
import { CleaningMethodStep } from "@/components/booking/cleaning-method-step";
import { ServiceFaq } from "@/components/booking/service-faq";
import {
  buildBookingSearchUrl,
  isOneTimeCleaningProperty,
  type BookingParams,
  type CleaningBookingPath,
} from "@/lib/booking";
import { getService } from "@/lib/services";

type CleaningBookingFlowProps = BookingParams;

type FlowStep = "method" | CleaningBookingPath;

export function CleaningBookingFlow({
  tjanst,
  postnummer,
  kommun,
  plats,
}: CleaningBookingFlowProps) {
  const router = useRouter();
  const skipMethodChoice = isOneTimeCleaningProperty(plats);
  const [step, setStep] = useState<FlowStep>(skipMethodChoice ? "direct" : "method");
  const service = getService(tjanst);

  if (!service) return null;

  function handleStorstadBack() {
    router.push(
      buildBookingSearchUrl({
        tjanst,
        postnummer,
        kommun,
        plats: "hem",
      }),
    );
  }

  return (
    <div className="space-y-8">
      {step === "method" || skipMethodChoice ? (
        <CleaningMethodStep
          plats={plats}
          onSelect={setStep}
          showOptions={!skipMethodChoice && step === "method"}
        />
      ) : null}

      {step === "method" ? <ServiceFaq service={service} /> : null}

      {step === "direct" ? (
        <>
          <CleaningDirectForm
            tjanst={tjanst}
            postnummer={postnummer}
            kommun={kommun}
            plats={plats}
            onBack={skipMethodChoice ? handleStorstadBack : () => setStep("method")}
          />
          {skipMethodChoice ? <ServiceFaq service={service} /> : null}
        </>
      ) : null}

      {step === "expert" ? (
        <CleaningExpertForm
          tjanst={tjanst}
          postnummer={postnummer}
          kommun={kommun}
          plats={plats}
          onBack={() => setStep("method")}
        />
      ) : null}
    </div>
  );
}
