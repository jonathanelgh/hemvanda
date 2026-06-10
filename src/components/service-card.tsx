import Link from "next/link";
import type { Service } from "@/lib/services";
import { Icon } from "./icons";

export function ServiceCard({ service }: { service: Service }) {
  return (
    <Link
      href={`/tjanster/${service.slug}`}
      className="group rounded-lg border border-green/10 bg-card p-6 transition duration-300 hover:-translate-y-1 hover:border-gold/60 hover:shadow-[0_24px_70px_rgba(47,58,51,0.12)]"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-gold/50 bg-background text-green transition group-hover:bg-green group-hover:text-white">
        <Icon name={service.icon} className="h-8 w-8" />
      </div>
      <p className="mt-8 text-xs font-bold uppercase tracking-[0.28em] text-gold">
        {service.accent}
      </p>
      <h3 className="mt-3 font-display text-3xl text-green">
        {service.title}
      </h3>
      <p className="mt-4 text-sm leading-7 text-muted">{service.description}</p>
      <span className="mt-6 inline-flex text-sm font-bold text-green transition group-hover:text-gold">
        Läs mer
      </span>
    </Link>
  );
}
