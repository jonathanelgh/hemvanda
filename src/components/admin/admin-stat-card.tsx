type AdminStatCardProps = {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "urgent";
};

export function AdminStatCard({
  label,
  value,
  hint,
  tone = "default",
}: AdminStatCardProps) {
  return (
    <div
      className={`rounded-2xl border bg-white p-5 shadow-sm ${
        tone === "urgent"
          ? "border-gold/40 bg-[linear-gradient(180deg,#fffaf2_0%,#ffffff_100%)]"
          : "border-green/10"
      }`}
    >
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted">
        {label}
      </p>
      <p className="mt-3 font-display text-4xl text-green">{value}</p>
      {hint ? <p className="mt-2 text-sm text-muted">{hint}</p> : null}
    </div>
  );
}
