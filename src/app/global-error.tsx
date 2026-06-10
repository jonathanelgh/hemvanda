"use client";

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <html lang="sv">
      <body className="flex min-h-screen items-center justify-center bg-[#f8f5ef] p-6 text-[#2f3a33]">
        <div className="max-w-md rounded-lg border border-[#2f3a33]/10 bg-white p-8 text-center shadow-lg">
          <h2 className="font-serif text-3xl">Något gick fel</h2>
          <p className="mt-4 text-sm text-[#6f726b]">
            Sidan kunde inte laddas just nu. Försök igen om en stund.
          </p>
          {error.digest ? (
            <p className="mt-2 text-xs text-[#6f726b]">Felkod: {error.digest}</p>
          ) : null}
          <button
            type="button"
            onClick={() => unstable_retry()}
            className="mt-6 rounded-full bg-[#2f3a33] px-6 py-3 text-sm font-semibold text-white"
          >
            Försök igen
          </button>
        </div>
      </body>
    </html>
  );
}
