"use client";

import { useState, useTransition } from "react";
import { updateCustomerProfileAction } from "@/app/(site)/mitt-konto/actions";
import { formatPhoneDisplay } from "@/lib/phone";
import { formatZipCode, maskZipCodeInput } from "@/lib/coverage";

type CustomerProfileFormProps = {
  fullName: string;
  email: string | null;
  phone: string | null;
  streetAddress: string;
  postalCode: string;
  municipality: string;
};

const fieldClassName =
  "mt-1 h-12 w-full rounded-full border border-green/15 bg-white px-5 text-sm text-green outline-none placeholder:text-muted/70";
const labelClassName =
  "block text-xs font-bold uppercase tracking-[0.2em] text-green/60";

export function CustomerProfileForm({
  fullName,
  email,
  phone,
  streetAddress,
  postalCode,
  municipality,
}: CustomerProfileFormProps) {
  const [name, setName] = useState(fullName);
  const [phoneValue, setPhoneValue] = useState(
    phone ? formatPhoneDisplay(phone) : "",
  );
  const [address, setAddress] = useState(streetAddress);
  const [zip, setZip] = useState(postalCode ? formatZipCode(postalCode) : "");
  const [city, setCity] = useState(municipality);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    startTransition(async () => {
      const result = await updateCustomerProfileAction({
        fullName: name,
        phone: phoneValue,
        streetAddress: address,
        postalCode: zip,
        municipality: city,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setMessage(result.message ?? "Sparat.");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className={labelClassName}>Namn</span>
          <input
            className={fieldClassName}
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </label>
        <label className="block">
          <span className={labelClassName}>E-post</span>
          <input
            className={`${fieldClassName} bg-ivory/50`}
            value={email ?? ""}
            disabled
            readOnly
          />
        </label>
        <label className="block">
          <span className={labelClassName}>Telefon</span>
          <input
            className={fieldClassName}
            value={phoneValue}
            onChange={(event) => setPhoneValue(event.target.value)}
            required
          />
        </label>
        <label className="block sm:col-span-2">
          <span className={labelClassName}>Adress</span>
          <input
            className={fieldClassName}
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            required
          />
        </label>
        <label className="block">
          <span className={labelClassName}>Postnummer</span>
          <input
            className={fieldClassName}
            value={zip}
            onChange={(event) => setZip(maskZipCodeInput(event.target.value))}
            required
          />
        </label>
        <label className="block">
          <span className={labelClassName}>Ort</span>
          <input
            className={fieldClassName}
            value={city}
            onChange={(event) => setCity(event.target.value)}
            required
          />
        </label>
      </div>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      {message ? <p className="text-sm text-green">{message}</p> : null}

      <button
        type="submit"
        disabled={pending}
        className="h-12 rounded-full bg-green px-6 text-sm font-bold text-white transition hover:bg-ink disabled:opacity-60"
      >
        {pending ? "Sparar..." : "Spara uppgifter"}
      </button>
    </form>
  );
}
