"use client";

import { useEffect, useRef, useState } from "react";
import { searchClientsAction } from "@/app/admin/(dashboard)/schedule/actions";
import type { ScheduleClient } from "@/lib/admin/clients";

type ScheduleClientComboboxProps = {
  selectedClient: ScheduleClient | null;
  onSelect: (client: ScheduleClient) => void;
  disabled?: boolean;
};

export function ScheduleClientCombobox({
  selectedClient,
  onSelect,
  disabled = false,
}: ScheduleClientComboboxProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [clients, setClients] = useState<ScheduleClient[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    searchInputRef.current?.focus();

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let cancelled = false;
    const timeout = window.setTimeout(async () => {
      setLoading(true);
      const result = await searchClientsAction(searchQuery);

      if (!cancelled) {
        if (result.ok) {
          setClients(result.clients);
        }
        setLoading(false);
      }
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [isOpen, searchQuery]);

  function handleSelect(client: ScheduleClient) {
    onSelect(client);
    setIsOpen(false);
    setSearchQuery("");
  }

  function handleToggle() {
    if (disabled) {
      return;
    }

    setIsOpen((open) => !open);
    if (!isOpen) {
      setSearchQuery("");
    }
  }

  return (
    <div ref={containerRef} className="relative mt-4">
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className="flex w-full items-center justify-between gap-3 rounded-xl border border-green/15 bg-white px-4 py-3 text-left text-sm transition hover:border-gold disabled:opacity-60"
      >
        <span className="min-w-0 flex-1">
          {selectedClient ? (
            <>
              <span className="block truncate font-semibold text-green">
                {selectedClient.name}
              </span>
              <span className="mt-0.5 block truncate text-xs text-muted">
                {selectedClient.email} · {selectedClient.postalCode}{" "}
                {selectedClient.municipality}
              </span>
            </>
          ) : (
            <span className="text-muted">Välj kund...</span>
          )}
        </span>
        <span
          className={`shrink-0 text-xs text-muted transition ${isOpen ? "rotate-180" : ""}`}
          aria-hidden
        >
          ▾
        </span>
      </button>

      {isOpen ? (
        <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-green/10 bg-white shadow-[0_20px_50px_rgba(47,58,51,0.14)]">
          <div className="border-b border-green/10 p-3">
            <input
              ref={searchInputRef}
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Sök namn, e-post eller telefon..."
              className="w-full rounded-lg border border-green/15 bg-ivory/40 px-3 py-2 text-sm text-green outline-none focus:border-gold"
            />
          </div>

          <ul
            role="listbox"
            className="max-h-52 overflow-y-auto"
            aria-label="Kunder"
          >
            {loading ? (
              <li className="px-4 py-3 text-sm text-muted">Söker...</li>
            ) : clients.length === 0 ? (
              <li className="px-4 py-3 text-sm text-muted">
                Inga kunder hittades.
              </li>
            ) : (
              clients.map((client) => (
                <li key={client.key}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={selectedClient?.key === client.key}
                    onClick={() => handleSelect(client)}
                    className={`flex w-full flex-col px-4 py-3 text-left transition hover:bg-ivory/70 ${
                      selectedClient?.key === client.key ? "bg-gold/10" : ""
                    }`}
                  >
                    <span className="text-sm font-semibold text-green">
                      {client.name}
                    </span>
                    <span className="mt-0.5 text-xs text-muted">
                      {client.email} · {client.postalCode} {client.municipality}
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
