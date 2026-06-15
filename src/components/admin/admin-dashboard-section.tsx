import Link from "next/link";

type AdminDashboardSectionProps = {
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
  children: React.ReactNode;
};

export function AdminDashboardSection({
  title,
  description,
  href,
  linkLabel = "Visa alla",
  children,
}: AdminDashboardSectionProps) {
  return (
    <section className="rounded-2xl border border-green/10 bg-white shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-green/10 px-5 py-4 md:px-6">
        <div>
          <h2 className="font-display text-2xl text-green">{title}</h2>
          {description ? (
            <p className="mt-1 text-sm text-muted">{description}</p>
          ) : null}
        </div>
        {href ? (
          <Link
            href={href}
            className="text-sm font-semibold text-gold transition hover:text-green"
          >
            {linkLabel}
          </Link>
        ) : null}
      </div>
      <div className="p-5 md:p-6">{children}</div>
    </section>
  );
}
