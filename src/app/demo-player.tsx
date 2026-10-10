"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Chaptered product walkthrough. Mirrors how the live 30-minute demo is run, so
 * a visitor can jump straight to the part they care about rather than sitting
 * through a linear video. Each chapter deep-links (#demo-tour=<id>) so a chapter
 * can be shared or replayed on its own.
 */

type Chapter = {
  id: string;
  title: string;
  minutes: string;
  blurb: string;
  points: string[];
  src: string;
  alt: string;
  /** Landscape iPad shots get a tablet bezel rather than a browser frame. */
  device?: "tablet";
};

const CHAPTERS: Chapter[] = [
  {
    id: "overview",
    title: "The day at a glance",
    minutes: "3 min",
    blurb:
      "We start where a manager starts: today's sales, VAT owed and how full the room is — all computed live, not exported overnight.",
    points: ["Live sales and covers", "VAT as it accrues", "Occupancy across venues"],
    src: "/screenshots/dashboard.png",
    alt: "synapse admin — dashboard overview",
  },
  {
    id: "floor-plan",
    title: "Floor plan & service",
    minutes: "5 min",
    blurb:
      "Design the room once, then run service on it. Tables colour by state, and every cover, server and reservation is attached to the table it belongs to.",
    points: ["Seated, upcoming and open at a glance", "Covers and spend per server", "Move a table mid-service"],
    src: "/screenshots/floor-plan.png",
    alt: "synapse admin — live service floor plan",
  },
  {
    id: "till",
    title: "The iPad till",
    minutes: "6 min",
    blurb:
      "The same catalogue the admin manages, on the floor. Items ring up against the open check with the subtotal and VAT recalculating as you go — and it keeps working when the internet doesn't.",
    points: ["Tap to ring up", "Running subtotal and VAT", "Offline-first with an outbox"],
    src: "/screenshots/till-order.png",
    alt: "synapse till on iPad — ringing up a check",
    device: "tablet",
  },
  {
    id: "payments",
    title: "Payments & splits",
    minutes: "4 min",
    blurb:
      "Take the money however the table wants to pay it: split evenly, part-pay, or hand over to a card-present reader.",
    points: ["Split evenly or by amount", "Cash, card and card-present", "Stripe & Adyen per organisation"],
    src: "/screenshots/till-payment.png",
    alt: "synapse till on iPad — taking payment with splits and tenders",
    device: "tablet",
  },
  {
    id: "catalogue",
    title: "Catalogue & stock",
    minutes: "5 min",
    blurb:
      "Menus, recipes and suppliers in one place, with stock depleting as items sell and reorder points flagging what to buy.",
    points: ["Recipes roll up to cost", "Live stock and par levels", "Predictive reordering"],
    src: "/screenshots/catalog.png",
    alt: "synapse admin — catalogue and stock levels",
  },
  {
    id: "members",
    title: "Members & CRM",
    minutes: "4 min",
    blurb:
      "The whole member lifecycle — application, vetting, dues and wallet pass — with status driven by whether they've actually paid.",
    points: ["Applications and vetting", "Recurring dues and billing state", "Apple & Google wallet passes"],
    src: "/screenshots/members.png",
    alt: "synapse admin — members list",
  },
  {
    id: "loyalty",
    title: "Loyalty & insights",
    minutes: "3 min",
    blurb:
      "Close the loop: what members spend, how often they come back, and what that's worth — computed from the same records the till wrote.",
    points: ["Points and credit ledger", "Retention and cover trends", "One source of truth"],
    src: "/screenshots/loyalty.png",
    alt: "synapse admin — loyalty programmes",
  },
];

const HASH_KEY = "demo-tour";
const AUTO_MS = 7000;

export function DemoPlayer() {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const startedAt = useRef<number>(0);

  const go = useCallback((i: number) => {
    setActive(((i % CHAPTERS.length) + CHAPTERS.length) % CHAPTERS.length);
    setProgress(0);
  }, []);

  // Deep link in (on mount) and out (on change), so a chapter can be shared.
  useEffect(() => {
    const m = new URLSearchParams(window.location.hash.replace(/^#/, "")).get(HASH_KEY);
    const i = CHAPTERS.findIndex((c) => c.id === m);
    if (i >= 0) setActive(i);
  }, []);

  useEffect(() => {
    const id = CHAPTERS[active]?.id;
    if (!id) return;
    const url = new URL(window.location.href);
    url.hash = `${HASH_KEY}=${id}`;
    window.history.replaceState(null, "", url.toString());
  }, [active]);

  // Auto-advance. Opt-in (paused by default) and disabled under reduced-motion.
  useEffect(() => {
    if (!playing) return;
    startedAt.current = Date.now();
    const tick = window.setInterval(() => {
      const pct = Math.min(1, (Date.now() - startedAt.current) / AUTO_MS);
      setProgress(pct);
      if (pct >= 1) {
        startedAt.current = Date.now();
        setActive((a) => (a + 1) % CHAPTERS.length);
        setProgress(0);
      }
    }, 50);
    return () => window.clearInterval(tick);
  }, [playing, active]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(active + 1);
      if (e.key === "ArrowLeft") go(active - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, go]);

  const c = CHAPTERS[active]!;

  return (
    <div className="grid gap-8 lg:grid-cols-[300px_1fr] lg:gap-10">
      {/* chapter rail */}
      <ol className="order-2 space-y-1 lg:order-1">
        {CHAPTERS.map((ch, i) => {
          const isActive = i === active;
          return (
            <li key={ch.id}>
              <button
                type="button"
                onClick={() => go(i)}
                aria-current={isActive ? "true" : undefined}
                className={`normal-case tracking-normal relative w-full overflow-hidden rounded-xl px-4 py-3 text-left transition-colors ${
                  isActive ? "bg-white shadow-sm ring-1 ring-[var(--border)]" : "hover:bg-white/60"
                }`}
              >
                {isActive && playing && (
                  <span
                    className="absolute inset-y-0 left-0 -z-10 bg-[var(--brand)]/10"
                    style={{ width: `${progress * 100}%` }}
                    aria-hidden
                  />
                )}
                <span className="flex items-baseline gap-3">
                  <span
                    className={`text-xs font-semibold tabular-nums ${
                      isActive ? "text-[var(--brand)]" : "text-[var(--muted)]"
                    }`}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="flex-1">
                    <span className={`block text-sm font-semibold ${isActive ? "" : "text-[var(--ink)]"}`}>
                      {ch.title}
                    </span>
                    <span className="mt-0.5 block text-xs text-[var(--muted)]">{ch.minutes}</span>
                  </span>
                </span>
              </button>
            </li>
          );
        })}

        <li className="flex items-center gap-2 pt-3">
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            className="inline-flex items-center gap-2 rounded-full bg-[var(--ink)] px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
          >
            {playing ? (
              <>
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden>
                  <rect x="6" y="5" width="4" height="14" rx="1" />
                  <rect x="14" y="5" width="4" height="14" rx="1" />
                </svg>
                Pause
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden>
                  <path d="M8 5.5v13l11-6.5Z" />
                </svg>
                Play tour
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => go(active - 1)}
            aria-label="Previous chapter"
            className="rounded-full border border-[var(--border)] p-2 text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
              <path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => go(active + 1)}
            aria-label="Next chapter"
            className="rounded-full border border-[var(--border)] p-2 text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
              <path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </li>
      </ol>

      {/* stage — a fixed-aspect box, so switching chapters (whose screenshots
          have different aspect ratios) never changes the page height. */}
      <div className="order-1 lg:order-2">
        <div className="relative aspect-[7/5] w-full">
          {c.device === "tablet" ? (
            <div className="absolute inset-0 rounded-[26px] bg-[#1c1c1e] p-3 shadow-[0_40px_100px_-40px_rgba(11,18,32,0.55)] ring-1 ring-black/10 sm:rounded-[34px] sm:p-4">
              <div className="flex h-full items-center gap-3">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-white/25" aria-hidden />
                <div className="h-full min-w-0 flex-1 overflow-hidden rounded-[14px] bg-black sm:rounded-[18px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img key={c.src} src={c.src} alt={c.alt} className="block h-full w-full object-contain" />
                </div>
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-[0_40px_100px_-40px_rgba(11,18,32,0.4)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img key={c.src} src={c.src} alt={c.alt} className="block h-full w-full object-contain" />
            </div>
          )}
        </div>

        {/* Reserve room for the longest chapter's text so the rail below doesn't move. */}
        <div className="mt-6 min-h-[11rem]">
          <h3 className="text-2xl font-bold tracking-[-0.02em]">{c.title}</h3>
          <p className="mt-3 max-w-2xl text-[var(--muted)]">{c.blurb}</p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {c.points.map((p) => (
              <li
                key={p}
                className="rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--muted)]"
              >
                {p}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
