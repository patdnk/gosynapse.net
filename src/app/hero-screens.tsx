"use client";

import { useEffect, useState } from "react";

// The hero's picture: every surface of synapse in turn, each a real capture
// from the demo club. Where the app has both themes the dark capture wipes
// across the light one; the kitchen display and the till are dark by design,
// and the member portal is light by design, so those show as they are.
//
// The frame keeps one aspect ratio (16:10) across every slide so the hero
// never changes height while it cycles. The till is an iPad capture (3:2),
// so it sits on its own dark ground inside the same frame.

type HeroScreen = {
  key: string;
  app: string;
  title: string;
  caption: string;
  light?: string;
  dark?: string;
  alt: string;
  /** "contain" letterboxes the capture on `ground` instead of filling the frame. */
  fit?: "cover" | "contain";
  ground?: string;
};

const SCREENS: HeroScreen[] = [
  {
    key: "admin",
    app: "Admin",
    title: "Tonight at Fernhollow Gardens",
    caption: "38 covers booked, who is next to arrive, rooms let tonight. Light for the office, dark for the door.",
    light: "/screenshots/dashboard.png",
    dark: "/screenshots/dashboard-dark.png",
    alt: "synapse admin dashboard, light and dark — tonight at Fernhollow Gardens: covers booked, next to arrive, rooms let",
  },
  {
    key: "door",
    app: "The door",
    title: "Bookings as they arrive",
    caption: "The evening as a timeline: who is due, who is seated, who is late, with the member's record a tap away.",
    light: "/screenshots/bookings-door.png",
    dark: "/screenshots/bookings-door-dark.png",
    alt: "synapse bookings door view, light and dark — tonight's arrivals in order",
  },
  {
    key: "foh",
    app: "Front of house",
    title: "Reception at Fernhollow",
    caption: "Members checked in by pass, with access needs and notes on the screen before they reach the desk. Day and dark, plus a night mode.",
    light: "/screenshots/foh-reception.png",
    dark: "/screenshots/foh-reception-dark.png",
    alt: "synapse front-of-house reception, day and dark — members arriving and checked in",
  },
  {
    key: "kds",
    app: "Kitchen display",
    title: "The pass, mid-service",
    caption: "Tickets by course with prep notes and timers. Dark by design, for a kitchen under service lighting.",
    dark: "/screenshots/kds-expo.png",
    alt: "synapse kitchen display at the pass — tickets by course with timers",
  },
  {
    key: "till",
    app: "Till",
    title: "A check on the Main Floor",
    caption: "The till on an iPad: courses, modifiers and the member's house account on one check. The same warm dark as the kitchen.",
    dark: "/screenshots/till-order.png",
    alt: "synapse till on an iPad — an open check with courses and modifiers",
    fit: "contain",
    ground: "#101008",
  },
  {
    key: "portal",
    app: "Member portal",
    title: "A member booking a table",
    caption: "Members apply, sign in by email code, book tables, rooms and events, and see their account. Desktop and phone.",
    light: "/screenshots/portal-desktop-book-table.png",
    alt: "synapse member portal on desktop — a member choosing a time to book a table",
  },
];

const HOLD_MS = 7000;

export function HeroScreens() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (paused || reduced) return;
    const t = window.setTimeout(() => setActive((i) => (i + 1) % SCREENS.length), HOLD_MS);
    return () => window.clearTimeout(t);
  }, [active, paused, reduced]);

  const current = SCREENS[active];

  return (
    <div
      className="hero-screens"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <figure className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-1)] shadow-sm">
        <div className="relative" style={{ aspectRatio: "16 / 10" }} aria-live="polite">
          {SCREENS.map((s, i) => {
            const on = i === active;
            // Mount the current slide and its neighbours so the next one is
            // decoded before it fades in, without pulling every capture at once.
            const near = on || i === (active + 1) % SCREENS.length || i === (active + SCREENS.length - 1) % SCREENS.length;
            if (!near) return null;
            const fit = s.fit === "contain" ? "object-contain" : "object-cover";
            const base = s.light ?? s.dark!;
            return (
              <div
                key={s.key}
                className={`hero-slide absolute inset-0 ${on ? "hero-slide-on" : ""}`}
                style={{ background: s.ground }}
                aria-hidden={!on}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={base} alt={on ? s.alt : ""} width={2880} height={1800} loading={i === 0 ? "eager" : "lazy"} className={`absolute inset-0 block h-full w-full ${fit}`} />
                {s.light && s.dark && (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={s.dark} alt="" aria-hidden width={2880} height={1800} loading={i === 0 ? "eager" : "lazy"} className={`theme-wipe-dark absolute inset-0 block h-full w-full ${fit}`} />
                    <span className="theme-wipe-line absolute inset-y-0 w-px bg-[var(--accent)]" aria-hidden />
                  </>
                )}
              </div>
            );
          })}
        </div>
      </figure>

      <div className="mt-3 flex flex-wrap gap-1.5" role="tablist" aria-label="Surfaces">
        {SCREENS.map((s, i) => (
          <button
            key={s.key}
            type="button"
            role="tab"
            aria-selected={i === active}
            onClick={() => setActive(i)}
            className={`hero-tab rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              i === active
                ? "border-[var(--brand)] bg-[var(--brand)] text-white"
                : "border-[var(--border)] bg-[var(--surface-1)] text-[var(--muted)] hover:border-[var(--brand)] hover:text-[var(--ink)]"
            }`}
          >
            {s.app}
            {i === active && !paused && !reduced && <span className="hero-tab-bar" aria-hidden />}
          </button>
        ))}
      </div>

      <p className="mt-3 min-h-[3.75rem] text-sm text-[var(--muted)]">
        <span className="font-medium text-[var(--ink)]">{current.title}.</span> {current.caption}
      </p>
    </div>
  );
}
