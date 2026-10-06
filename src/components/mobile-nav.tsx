"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { getNavServices } from "@/lib/services";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const primaryServices = getNavServices();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const scrollY = window.scrollY;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      window.scrollTo(0, scrollY);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  function closeMenu() {
    setOpen(false);
  }

  const menu = open ? (
    <div className="fixed inset-0 z-[80] flex h-[100dvh] w-full flex-col bg-background lg:hidden">
      <div className="flex h-20 shrink-0 items-center justify-end px-4 sm:px-6">
        <button
          type="button"
          onClick={closeMenu}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-green/15 bg-background text-green transition hover:border-gold hover:text-gold"
          aria-label="Stäng meny"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path d="M6 6l12 12" />
            <path d="M18 6 6 18" />
          </svg>
        </button>
      </div>
      <nav className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-8 sm:px-6">
        <div className="space-y-1">
          {primaryServices.map((service) => (
            <Link
              key={service.slug}
              href={`/tjanster/${service.slug}`}
              onClick={closeMenu}
              className="block rounded-lg px-4 py-3 text-base font-semibold text-green transition hover:bg-ivory hover:text-gold"
            >
              {service.title}
            </Link>
          ))}

          <Link
            href="/om-oss"
            onClick={closeMenu}
            className="block rounded-lg px-4 py-3 text-base font-semibold text-green transition hover:bg-ivory hover:text-gold"
          >
            Om oss
          </Link>
          <Link
            href="/blog"
            onClick={closeMenu}
            className="block rounded-lg px-4 py-3 text-base font-semibold text-green transition hover:bg-ivory hover:text-gold"
          >
            Blogg
          </Link>
          <Link
            href="/referenser"
            onClick={closeMenu}
            className="block rounded-lg px-4 py-3 text-base font-semibold text-green transition hover:bg-ivory hover:text-gold"
          >
            Referenser
          </Link>
          <Link
            href="/#sa-fungerar-det"
            onClick={closeMenu}
            className="block rounded-lg px-4 py-3 text-base font-semibold text-green transition hover:bg-ivory hover:text-gold"
          >
            Så fungerar det
          </Link>
        </div>

        <div className="mt-6 space-y-3 border-t border-green/10 pt-6">
          <Link
            href="/logga-in"
            onClick={closeMenu}
            className="block rounded-lg px-4 py-3 text-base font-semibold text-green transition hover:bg-ivory hover:text-gold"
          >
            Logga in
          </Link>
          <Link
            href="#boka"
            onClick={closeMenu}
            className="flex h-14 items-center justify-center rounded-full bg-green px-7 text-sm font-bold text-white transition hover:bg-ink"
          >
            Boka hjälp
          </Link>
        </div>
      </nav>
    </div>
  ) : null;

  return (
    <div className="relative z-[60] lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-green/15 bg-background text-green transition hover:border-gold hover:text-gold"
        aria-expanded={open}
        aria-label={open ? "Stäng meny" : "Öppna meny"}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          className="h-5 w-5"
          aria-hidden="true"
        >
          {open ? (
            <>
              <path d="M6 6l12 12" />
              <path d="M18 6 6 18" />
            </>
          ) : (
            <>
              <path d="M4 7h16" />
              <path d="M4 12h16" />
              <path d="M4 17h16" />
            </>
          )}
        </svg>
      </button>

      {mounted && menu ? createPortal(menu, document.documentElement) : null}
    </div>
  );
}
