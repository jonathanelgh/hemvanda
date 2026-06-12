type AdminStatCardProps = {
  label: string;
  value: string | number;
  hint?: string;
};

export function AdminStatCard({ label, value, hint }: AdminStatCardProps) {
  return (
    <div className="rounded-2xl border border-green/10 bg-white p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted">
        {label}
      </p>
      <p className="mt-3 font-display text-4xl text-green">{value}</p>
      {hint ? <p className="mt-2 text-sm text-muted">{hint}</p> : null}
    </div>
  );
}
