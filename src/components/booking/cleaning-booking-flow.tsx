"use client";

import { useState } from "react";
import { CleaningDirectForm } from "@/components/booking/cleaning-direct-form";
import { CleaningExpertForm } from "@/components/booking/cleaning-expert-form";
import { CleaningMethodStep } from "@/components/booking/cleaning-method-step";
import type { BookingParams, CleaningBookingPath } from "@/lib/booking";
import { getService } from "@/lib/services";

type CleaningBookingFlowProps = BookingParams;

type FlowStep = "method" | CleaningBookingPath;

export function CleaningBookingFlow({
  tjanst,
  postnummer,
  kommun,
}: CleaningBookingFlowProps) {
  const [step, setStep] = useState<FlowStep>("method");
  const service = getService(tjanst);

  if (!service) return null;

  return (
    <div className="space-y-8">
      {step === "method" ? (
        <CleaningMethodStep onSelect={setStep} />
      ) : null}

      {step === "direct" ? (
        <CleaningDirectForm
          tjanst={tjanst}
          postnummer={postnummer}
          kommun={kommun}
          onBack={() => setStep("method")}
        />
      ) : null}

      {step === "expert" ? (
        <CleaningExpertForm
          tjanst={tjanst}
          postnummer={postnummer}
          kommun={kommun}
          onBack={() => setStep("method")}
        />
      ) : null}
    </div>
  );
}
