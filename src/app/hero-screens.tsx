"use client";

import { PhoneCut, shotSize, type PhonePeekSpec } from "./peek";
import { useEffect, useState } from "react";

// The hero's picture: a gallery of the platform, one numbered screen per
// module, each a real capture from the demo clubs. Each screen slides in from
// the right with its number and title on a plate; the gallery advances on its
// own every few seconds, stops as soon as the reader picks a screen or rests
// the pointer on it, and keeps one aspect ratio so the hero never changes
// height. Under reduced motion nothing slides and nothing advances.

type HeroScreen = {
  key: string;
  app: string;
  title: string;
  caption: string;
  light: string;
  alt: string;
  /** A tablet capture (the till) sits in a bezel instead of a browser frame. */
  frame?: "browser" | "tablet";
  /** A phone in front of the frame, bottom left. */
  phone?: PhonePeekSpec;
  /** The wallet pass, in front on the right. */
  pass?: boolean;
};


const SCREENS: HeroScreen[] = [
  {
    key: "crm",
    app: "CRM",
    title: "CRM",
    caption: "Members and guests across venues and locations, with one record each: profile, membership, visits, bookings, spend and notes.",
    light: "/screenshots/members.png",
    alt: "synapse CRM — the members list with status, plan and venue",
  },
  {
    key: "events",
    app: "Events",
    title: "Events, with the door app",
    caption: "Ticket tiers, takings and the guest list in the office. At the door, the native app: scan, search, check in a whole party, seat them.",
    light: "/screenshots/event-night.png",
    alt: "synapse event page — the Summer Party tonight: places sold, takings, attendees, invitations, host lists and the report",
    phone: { device: "iphone", src: "/screenshots/door-ios-guests.png", alt: "The door app on an iPhone — the Summer Party guest list, 91 of 164 checked in, with its Guests, Seating, Scan, Add and More tabs" },
  },
  {
    key: "bookings",
    app: "Bookings",
    title: "Room and table booking",
    caption: "Tables by the slot, rooms by the night, the day or the hour, on one reservation spine. Staff book here; members book from the portal.",
    light: "/screenshots/rooms.png",
    alt: "synapse rooms calendar — a fortnight of room reservations",
  },
  {
    key: "marketing",
    app: "Marketing",
    title: "Marketing",
    caption: "Email, SMS and WhatsApp on the same member record. Audiences, templates and journeys: a promo goes out, a reminder follows if it is not opened.",
    light: "/screenshots/marketing-journey-builder.png",
    alt: "synapse journey builder — an event promo with a reminder step",
  },
  {
    key: "foh",
    app: "FOH",
    title: "FOH app",
    caption: "For reception and floor managers: who is in the building, who is due, passes read at the desk, the member's record a tap away.",
    light: "/screenshots/foh-reception.png",
    alt: "synapse front of house — Saturday at the door, who is in the house, on the shared theme",
  },
  {
    key: "plans",
    app: "Membership",
    title: "Membership plans and billing",
    caption: "Plans with their own fees, terms and perks. Subscriptions, pro-rata changes, freezes, credit notes and direct debit, billed on the record.",
    light: "/screenshots/plans.png",
    alt: "synapse membership plans — plans with fees, terms and members",
  },
  {
    key: "loyalty",
    app: "Loyalty",
    title: "Loyalty programmes",
    caption: "Points on spend or visits, tiers and rewards, earned at the till and shown on the wallet pass.",
    light: "/screenshots/loyalty.png",
    alt: "synapse loyalty programmes",
  },
  {
    key: "cloakroom",
    app: "Cloakroom",
    title: "Cloakroom",
    caption: "Check an item in against the member, hand back by ticket or by QR, see what is still on the rail.",
    light: "/screenshots/cloakroom.png",
    alt: "synapse cloakroom — items on the rail",
  },
  {
    key: "portal",
    app: "Member portal",
    title: "Members portal, with QR codes",
    caption: "The club's own colours. Members apply, book tables, rooms and events, and carry their membership card with its door code, or the wallet pass.",
    light: "/screenshots/portal-desktop-book-table.png",
    alt: "The member portal on the desktop — Ashgrove's booking page, black and gold",
    phone: { device: "pixel", src: "/screenshots/portal-android-qr.png", alt: "The member portal installed on a Pixel — the membership card turned to its QR door code, with Add to Google Wallet and the Home, Book, Calendar and Me tabs" },
    pass: true,
  },
  {
    key: "floor-plans",
    app: "Floor plans",
    title: "Floor plans for POS and events",
    caption: "One plan editor for the restaurant floor and for an event's layout: tables, the bar, a DJ booth. Live on the till and in the door app's seating.",
    light: "/screenshots/floor-plan.png",
    alt: "synapse floor plan editor",
    phone: { device: "pixel", src: "/screenshots/door-android-seating.png", alt: "The door app on a Pixel — the Summer Party seating plan filling as guests arrive" },
  },
  {
    key: "pos",
    app: "POS",
    title: "POS: till app and menus",
    caption: "The till on an iPad: checks by table, timed menus, modifiers, house accounts and card payments, with the kitchen and the books behind it.",
    light: "/screenshots/till-order.png",
    alt: "synapse till on an iPad — an open check with its items",
    frame: "tablet",
  },
  {
    key: "catalogue",
    app: "Catalogue",
    title: "Catalogue",
    caption: "Menu items, option sets, menus by time of day, tax rates, sales groups and the raw items behind them, shared by every till.",
    light: "/screenshots/catalog.png",
    alt: "synapse catalogue — menu items with their categories, options and prices",
  },
  {
    key: "kds",
    app: "KDS",
    title: "Kitchen display",
    caption: "Station and expo screens. Courses held and fired, times by table, bumped when the pass is clear.",
    light: "/screenshots/kds-expo.png",
    alt: "synapse kitchen display — the expo screen with three tables in progress, on the shared theme",
  },
  {
    key: "procurement",
    app: "Procurement",
    title: "Procurement",
    caption: "Purchase orders, deliveries, invoices and credits by supplier, matched to the catalogue and posted to the books.",
    light: "/screenshots/procurement.png",
    alt: "synapse procurement — purchase orders by supplier and status",
  },
  {
    key: "integrations",
    app: "Integrations",
    title: "Integrations",
    caption: "Salesforce, SevenRooms, SynXis, Xero and QuickBooks, card payments, wallet passes, email, SMS and WhatsApp, plus a public API and webhooks.",
    light: "/screenshots/integrations.png",
    alt: "synapse integrations — Salesforce, SevenRooms and Linked POS live, with the webhook deliveries and POS feeds",
  },
];

const ADVANCE_MS = 5000;

export function HeroScreens() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const current = SCREENS[active];

  useEffect(() => {
    if (paused) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setActive((i) => (i + 1) % SCREENS.length), ADVANCE_MS);
    return () => clearInterval(t);
  }, [paused]);

  const pick = (i: number) => {
    setActive(i);
    setPaused(true);
  };

  return (
    <div className="hero-screens" onMouseEnter={() => setPaused(true)} onFocus={() => setPaused(true)}>
      {/* The scene: the admin in a browser frame, or the till in a bezel; a
          phone in front on the left and a wallet pass on the right where the
          screen has them. */}
      <div className="relative" style={{ aspectRatio: "16 / 11" }}>
        <figure className="absolute top-0 right-0 left-0 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-1)] shadow-sm">
          <div className="flex items-center gap-1.5 border-b border-[var(--border)] bg-[var(--surface-2)] px-3 py-1.5" aria-hidden>
            <span className="h-2 w-2 rounded-full bg-[var(--surface-3)]" />
            <span className="h-2 w-2 rounded-full bg-[var(--surface-3)]" />
            <span className="h-2 w-2 rounded-full bg-[var(--surface-3)]" />
            <span className="ml-2 truncate text-[10px] text-[var(--muted)]">
              synapse · {current.app}
            </span>
          </div>
          <div className="relative" style={{ aspectRatio: "16 / 10" }}>
            {SCREENS.map((s, i) => {
              const on = i === active;
              const eager = i < 3 ? "eager" : "lazy";
              const [sw, sh] = shotSize(s.light);
              if (s.frame === "tablet") {
                return (
                  <div key={s.key} className={`hero-slide absolute inset-0 overflow-hidden bg-[#15131a] ${on ? "hero-slide-on" : ""}`} aria-hidden={!on}>
                    <div className="absolute top-[9%] left-[6%] w-[104%] rounded-tl-[22px] bg-black pt-[1.6%] pl-[1.6%] ring-1 ring-white/15">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={s.light} alt={on ? s.alt : ""} width={sw} height={sh} loading={eager} className="block h-auto w-full rounded-tl-[14px]" />
                    </div>
                  </div>
                );
              }
              return (
                <div key={s.key} className={`hero-slide absolute inset-0 overflow-hidden ${on ? "hero-slide-on" : ""}`} aria-hidden={!on}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.light} alt={on ? s.alt : ""} width={sw} height={sh} loading={eager} className="absolute inset-0 block h-full w-full object-cover object-left-top" />
                </div>
              );
            })}
            <div key={current.key} className="hero-enter pointer-events-none absolute top-[5%] left-[4%] max-w-[70%] rounded-lg bg-[var(--brand)] px-3 py-2 text-white shadow-[0_12px_32px_-8px_rgba(20,14,40,0.5)] sm:px-4 sm:py-2.5">
              <span className="block font-mono text-[10px] text-white/70 sm:text-[11px]">{String(active + 1).padStart(2, "0")} · {current.app}</span>
              <span className="block text-sm leading-tight font-semibold sm:text-base lg:text-lg">{current.title}</span>
            </div>
          </div>
        </figure>

        {current.phone && (
          <div key={`phone-${current.key}`} className="hero-enter absolute bottom-0 left-[-2%] w-[25%]">
            <PhoneCut {...current.phone} eager />
          </div>
        )}

        {current.pass && (
          <div key={`pass-${current.key}`} className="hero-enter absolute right-[-2%] bottom-[4%] w-[26%] -rotate-3 overflow-hidden rounded-[6%] shadow-[0_24px_48px_-12px_rgba(20,14,40,0.45)] ring-1 ring-black/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/screenshots/pass-card.png" alt="A membership pass for Apple Wallet, designed in synapse" width={600} height={600} className="block h-auto w-full" />
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5" role="tablist" aria-label="Platform screens">
        {SCREENS.map((s, i) => (
          <button
            key={s.key}
            type="button"
            role="tab"
            aria-selected={i === active}
            onClick={() => pick(i)}
            className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
              i === active
                ? "border-[var(--brand)] bg-[var(--brand)] text-white"
                : "border-[var(--border)] bg-[var(--surface-1)] text-[var(--muted)] hover:border-[var(--brand)] hover:text-[var(--ink)]"
            }`}
          >
            <span className={`mr-1 font-mono text-[10px] ${i === active ? "text-white/70" : "text-[var(--muted)]"}`}>{String(i + 1).padStart(2, "0")}</span>
            {s.app}
          </button>
        ))}
      </div>

      <p key={current.key} className="hero-enter mt-3 min-h-[4.5rem] text-sm text-[var(--muted)]" aria-live="polite">
        <span className="font-medium text-[var(--ink)]">{current.title}.</span> {current.caption}
      </p>
    </div>
  );
}
