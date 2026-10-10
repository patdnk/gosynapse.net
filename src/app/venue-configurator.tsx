"use client";

import { useMemo, useState } from "react";

import { MODULES, VENUES, type ModuleKey } from "./venues";

/**
 * Pick a venue type, then add or remove modules. Selecting a venue loads what
 * that kind of place usually runs; everything stays switchable, because the
 * point being made is that the platform is modular — a bar shouldn't be sold
 * table service, but it should be able to turn it on.
 */

// Icons live here rather than being passed in: a server component can't hand a
// render function to a client component.
function VenueIcon({ name, className = "h-5 w-5" }: { name: string; className?: string }) {
  const p = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (name) {
    case "utensils": return <svg {...p}><path d="M6 3v8a2 2 0 0 0 4 0V3M8 3v18M18 3c-1.5 0-3 1.5-3 5s1.5 4 3 4v9" /></svg>;
    case "glass": return <svg {...p}><path d="M6 3h12l-5 8v7M9 21h8M6 3l7 8" /></svg>;
    case "crm": return <svg {...p}><circle cx="9" cy="8" r="3" /><path d="M4 20a5 5 0 0 1 10 0M16 11l2 2 4-4" /></svg>;
    case "bed": return <svg {...p}><path d="M3 18V8m0 6h18M21 18v-4a3 3 0 0 0-3-3H9v3" /><circle cx="6.5" cy="9.5" r="1.5" /></svg>;
    case "ticket": return <svg {...p}><path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2 2 2 0 0 0 0 4 2 2 0 0 1-2 2H5a2 2 0 0 1-2-2 2 2 0 0 0 0-4Z" /><path d="M15 6v12" strokeDasharray="2 2" /></svg>;
    case "sparkle": return <svg {...p}><path d="M12 3v6m0 6v6m-9-9h6m6 0h6M6 6l3 3m6 6 3 3m0-12-3 3m-6 6-3 3" /></svg>;
    case "frame": return <svg {...p}><rect x="3" y="3" width="18" height="18" rx="1.5" /><path d="M3 9h18M9 3v18" /></svg>;
    case "film": return <svg {...p}><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M7 4v16M17 4v16M3 9h4m10 0h4M3 15h4m10 0h4" /></svg>;
    case "dumbbell": return <svg {...p}><path d="M3 9v6M6 7v10M18 7v10M21 9v6M6 12h12" /></svg>;
    case "flag": return <svg {...p}><path d="M5 21V4m0 1 6-1 4 2 4-1v9l-4 1-4-2-6 1" /></svg>;
    default: return null;
  }
}

export function VenueConfigurator() {
  const [venueKey, setVenueKey] = useState(VENUES[0]!.key);
  const [overrides, setOverrides] = useState<Partial<Record<ModuleKey, boolean>>>({});

  const venue = VENUES.find((v) => v.key === venueKey)!;

  const enabled = useMemo(() => {
    const set = new Set<ModuleKey>(venue.recommended);
    for (const [k, on] of Object.entries(overrides) as [ModuleKey, boolean][]) {
      if (on) set.add(k);
      else set.delete(k);
    }
    return set;
  }, [venue, overrides]);

  const skipReason = (k: ModuleKey) => venue.skipped.find((s) => s.key === k)?.why;
  const dirty = Object.keys(overrides).length > 0;

  function selectVenue(key: string) {
    setVenueKey(key);
    setOverrides({}); // a different venue means a different starting point
  }

  function toggle(k: ModuleKey) {
    const isOn = enabled.has(k);
    setOverrides((o) => {
      const next = { ...o };
      // Back to the venue default? Drop the override rather than pinning it.
      if (venue.recommended.includes(k) === isOn) next[k] = !isOn;
      else delete next[k];
      return next;
    });
  }

  return (
    <div>
      {/* venue picker */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {VENUES.map((v) => {
          const active = v.key === venueKey;
          return (
            <button
              key={v.key}
              type="button"
              onClick={() => selectVenue(v.key)}
              aria-pressed={active}
              className={`normal-case tracking-normal group flex flex-col items-start gap-3 rounded-2xl border p-5 text-left transition-colors ${
                active
                  ? "border-[var(--brand)] bg-white ring-1 ring-[var(--brand)]"
                  : "border-[var(--border)] bg-white hover:border-[var(--brand)]"
              }`}
            >
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                  active ? "bg-[var(--brand)] text-white" : "bg-[var(--brand-soft)] text-[var(--brand-strong)]"
                }`}
              >
                <VenueIcon name={v.icon} />
              </span>
              <span className="text-sm font-semibold text-[var(--ink)]">{v.label}</span>
            </button>
          );
        })}
      </div>

      {/* module board */}
      <div className="mt-8 rounded-2xl border border-[var(--border)] bg-white p-6 sm:p-8">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold tracking-[-0.01em]">{venue.label}</h3>
            <p className="mt-1 text-sm text-[var(--muted)]">{venue.summary}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-[var(--muted)]">
              <strong className="text-[var(--ink)]">{enabled.size}</strong> of {MODULES.length} modules
            </span>
            {dirty && (
              <button
                type="button"
                onClick={() => setOverrides({})}
                className="normal-case tracking-normal text-sm text-[var(--brand)] underline underline-offset-4 hover:text-[var(--brand-strong)]"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        <ul className="mt-6 grid gap-2 sm:grid-cols-2">
          {MODULES.map((m) => {
            const on = enabled.has(m.key);
            const why = !on ? skipReason(m.key) : undefined;
            return (
              <li key={m.key}>
                <button
                  type="button"
                  onClick={() => toggle(m.key)}
                  aria-pressed={on}
                  className={`normal-case tracking-normal flex min-h-[5.5rem] w-full items-start gap-3 rounded-xl border p-3.5 text-left transition-colors ${
                    on
                      ? "border-[var(--brand)] bg-[var(--brand-soft)]"
                      : "border-[var(--border)] bg-[var(--surface-2)] hover:border-[var(--muted)]"
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                      on ? "border-[var(--brand)] bg-[var(--brand)] text-white" : "border-[var(--border)] bg-white"
                    }`}
                    aria-hidden
                  >
                    {on && (
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="m5 13 4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className={`block text-sm font-semibold ${on ? "text-[var(--ink)]" : "text-[var(--muted)]"}`}>
                      {m.label}
                    </span>
                    {/* When a module is off for a reason, say the reason — it's
                        more convincing than a generic description. */}
                    <span className="mt-0.5 block text-xs text-[var(--muted)]">{why ?? m.blurb}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <p className="mt-6 text-xs text-[var(--muted)]">
          Switch modules on or off at any time — the configurator gates what a venue isn&apos;t using, so nobody pays
          for a kitchen display they don&apos;t have.
        </p>
      </div>
    </div>
  );
}
