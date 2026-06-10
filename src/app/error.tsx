"use client";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center p-6">
      <div className="max-w-md rounded-lg border border-green/10 bg-card p-8 text-center">
        <h2 className="font-display text-3xl text-green">Något gick fel</h2>
        <p className="mt-4 text-sm text-muted">
          Sidan kunde inte laddas just nu.
        </p>
        {error.digest ? (
          <p className="mt-2 text-xs text-muted">Felkod: {error.digest}</p>
        ) : null}
        <button
          type="button"
          onClick={() => unstable_retry()}
          className="mt-6 rounded-full bg-green px-6 py-3 text-sm font-semibold text-white"
        >
          Försök igen
        </button>
      </div>
    </div>
  );
}
