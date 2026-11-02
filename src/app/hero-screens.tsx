"use client";

import { useState } from "react";

// The hero's picture: the CRM side of synapse, one surface per tab, each a
// real capture from the demo club. Where the screen has both themes the dark
// capture wipes slowly across the light one; the member portal is the club's
// own colours and shows as it is. Tabs switch at once, nothing slides or
// fades, and the frame keeps one aspect ratio so the hero never changes
// height. Under reduced motion the wipe holds still.

type HeroScreen = {
  key: string;
  app: string;
  title: string;
  caption: string;
  light?: string;
  dark?: string;
  alt: string;
};

const SCREENS: HeroScreen[] = [
  {
    key: "crm",
    app: "CRM",
    title: "One record per member",
    caption: "Profile, membership, house account, visits, bookings, wallet pass, credit and feedback on one page, with what they like at the table.",
    light: "/screenshots/member-record.png",
    dark: "/screenshots/member-record-dark.png",
    alt: "synapse CRM, light and dark — a member's record: profile, house account, visits and preferences",
  },
  {
    key: "applications",
    app: "Applications",
    title: "From applicant to member",
    caption: "Online applications arrive on a board: new, rating, pipeline, approved. Rate, freeze, reject or convert to a member record.",
    light: "/screenshots/applicants.png",
    dark: "/screenshots/applicants-dark.png",
    alt: "synapse applications board, light and dark — new, rating, pipeline and approved columns",
  },
  {
    key: "door",
    app: "Bookings & the door",
    title: "Tonight, as a timeline",
    caption: "Who is due, who is seated, who is late, with the member's record a tap away. Light for the office, dark for the door.",
    light: "/screenshots/bookings-door.png",
    dark: "/screenshots/bookings-door-dark.png",
    alt: "synapse bookings door view, light and dark — tonight's arrivals in order",
  },
  {
    key: "events",
    app: "Events & tickets",
    title: "Tiers, takings and the door list",
    caption: "Ticket tiers with their own prices and limits, paid or free, sold from the portal and scanned at the door.",
    light: "/screenshots/event-tickets.png",
    dark: "/screenshots/event-tickets-dark.png",
    alt: "synapse event with ticket tiers, light and dark — tiers, takings and who is coming",
  },
  {
    key: "passes",
    app: "Passes",
    title: "Apple and Google Wallet, designed here",
    caption: "One design per pass type: membership, loyalty, day and guest passes. Issued from the member's record, delivered by email, SMS or WhatsApp, read by NFC or QR at the door.",
    light: "/screenshots/pass-designer.png",
    dark: "/screenshots/pass-designer-dark.png",
    alt: "synapse wallet pass designer, light and dark — the membership pass previewed for Apple and Google Wallet",
  },
  {
    key: "marketing",
    app: "Marketing",
    title: "Journeys on the canvas",
    caption: "Email, SMS and WhatsApp built on the same member record: an audience joins, a promo goes out, a reminder follows if it is not opened in two days.",
    light: "/screenshots/marketing-journey-builder.png",
    dark: "/screenshots/marketing-journey-builder-dark.png",
    alt: "synapse journey builder, light and dark — an event promo with a reminder step",
  },
];

export function HeroScreens() {
  const [active, setActive] = useState(0);
  const current = SCREENS[active];

  return (
    <div className="hero-screens">
      {/* The scene: the admin at the back in a browser frame, the member's
          phone in front on the left, a wallet pass in front on the right. */}
      <div className="relative" style={{ aspectRatio: "16 / 11" }}>
        <figure className="absolute top-0 right-0 left-[9%] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-1)] shadow-sm">
          <div className="flex items-center gap-1.5 border-b border-[var(--border)] bg-[var(--surface-2)] px-3 py-1.5" aria-hidden>
            <span className="h-2 w-2 rounded-full bg-[var(--surface-3)]" />
            <span className="h-2 w-2 rounded-full bg-[var(--surface-3)]" />
            <span className="h-2 w-2 rounded-full bg-[var(--surface-3)]" />
            <span className="ml-2 truncate text-[10px] text-[var(--muted)]">synapse admin · {current.app}</span>
          </div>
          <div className="relative" style={{ aspectRatio: "16 / 10" }}>
            {SCREENS.map((s, i) => {
              const on = i === active;
              return (
                <div key={s.key} className={`hero-slide absolute inset-0 ${on ? "hero-slide-on" : ""}`} aria-hidden={!on}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.light ?? s.dark} alt={on ? s.alt : ""} width={2880} height={1800} loading={i === 0 ? "eager" : "lazy"} className="absolute inset-0 block h-full w-full object-cover" />
                  {s.light && s.dark && (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={s.dark} alt="" aria-hidden width={2880} height={1800} loading={i === 0 ? "eager" : "lazy"} className="theme-wipe-dark absolute inset-0 block h-full w-full object-cover" />
                      <span className="theme-wipe-line absolute inset-y-0 w-px bg-[var(--accent)]" aria-hidden />
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </figure>

        {/* The member's phone: Ashgrove's portal, black and gold. */}
        <div className="absolute bottom-0 left-0 w-[21%] rounded-[12px] bg-[#1c1c1e] p-[4px] shadow-[0_24px_48px_-12px_rgba(20,14,40,0.45)] ring-1 ring-black/10 sm:rounded-[18px] sm:p-[5px] lg:rounded-[20px] lg:p-[6px]">
          <div className="overflow-hidden rounded-[9px] sm:rounded-[14px] lg:rounded-[15px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/screenshots/portal-phone-public.png" alt="The member portal on a phone — Ashgrove Social Group's public page, black and gold" width={1170} height={2532} className="block h-auto w-full" />
          </div>
        </div>

        {/* A wallet pass, as the designer previews it for Apple Wallet. */}
        <div className="absolute right-[-2%] bottom-[5%] w-[27%] -rotate-3 overflow-hidden rounded-[6%] shadow-[0_24px_48px_-12px_rgba(20,14,40,0.45)] ring-1 ring-black/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/screenshots/pass-card.png" alt="A membership pass for Apple Wallet, designed in synapse" width={600} height={600} className="block h-auto w-full" />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5" role="tablist" aria-label="Admin screens">
        {SCREENS.map((s, i) => (
          <button
            key={s.key}
            type="button"
            role="tab"
            aria-selected={i === active}
            onClick={() => setActive(i)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              i === active
                ? "border-[var(--brand)] bg-[var(--brand)] text-white"
                : "border-[var(--border)] bg-[var(--surface-1)] text-[var(--muted)] hover:border-[var(--brand)] hover:text-[var(--ink)]"
            }`}
          >
            {s.app}
          </button>
        ))}
      </div>

      <p className="mt-3 min-h-[3.75rem] text-sm text-[var(--muted)]">
        <span className="font-medium text-[var(--ink)]">{current.title}.</span> {current.caption}
      </p>
    </div>
  );
}
