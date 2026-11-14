"use client";

// The API section: data in from the systems a venue already runs, data out to
// whatever it builds next. Live, in progress and coming are labelled honestly:
// the partner REST API, webhooks v2 and the GraphQL read plane all run on main
// (docs/superpowers/specs/2026-10-12-public-api-platform-design.md in the
// synapse repo, M0–M6 built); SynXis waits on a partner agreement. Code
// samples use the real endpoints, fields and headers.

import { useState } from "react";
import { useInView, useReducedMotion } from "./motion";

type Status = "live" | "building" | "coming";
type Link = { name: string; what: string; status: Status };

const INBOUND: Link[] = [
  { name: "Salesforce", what: "Members and applicants, both ways — OAuth, a field mapper over your own objects, and a sync engine that never echoes.", status: "live" },
  { name: "SevenRooms", what: "Two-way: a booking made at the desk lands on the SevenRooms floor, reservations and members sync both ways, and POS tickets arrive as linked checks.", status: "live" },
  { name: "Oracle Simphony · Lightspeed · Toast", what: "Linked POS: checks, tables and customers in, read-only, matched to your bookings and members, with the club's own patterns learned from staff answers.", status: "live" },
  { name: "SynXis", what: "Hotel reservations in by activity date, check-ins and cancellations back — built against the published API, live once a venue's partner agreement is in place.", status: "building" },
  { name: "Tripleseat", what: "Events and banqueting in, on the same pattern as SevenRooms.", status: "coming" },
];

const OUTBOUND: Link[] = [
  { name: "REST API", what: "/public/v1 — members, applicants, reservations, events and tickets, the door, loyalty, passes, billing, cases, checks and payments — with scoped live and test keys, idempotency, cursor pagination, per-key rate limits and an OpenAPI reference at gosynapse.net/docs.", status: "live" },
  { name: "GraphQL", what: "POST /public/graphql, read-only and costed per query: a member with their reservations, check-ins, tickets, loyalty and spend in one round trip.", status: "live" },
  { name: "Webhooks v2", what: "Up to twenty HTTPS endpoints per key, a Synapse-Signature over the raw body, retries from a minute to a day, a test send, resend, and an event log to reconcile against.", status: "live" },
  { name: "POS feeds", what: "Checks and reservations as Oracle Simphony-shaped documents, so anything that reads a POS feed reads ours.", status: "live" },
  { name: "OAuth for installed apps", what: "Partner apps installed by a club, with persisted GraphQL queries. After the key-based plane.", status: "coming" },
];

const SAMPLES = {
  rest: {
    label: "REST",
    note: "Live",
    code: `GET /public/v1/reservations?status=confirmed&updated_since=2026-11-14T00:00:00Z
Authorization: Bearer syn_live_…

{
  "data": [
    {
 "id": "res_cmv55zeip007nbdpvl0dvg9gn",
 "kind": "table",
 "status": "confirmed",
 "reference": "R-2041",
 "member_id": "mem_cmv4…",
 "starts_at": "2026-11-14T18:45:00.000Z",
 "adults": 2,
 "table": { "number": "3" },
 "total": { "minor": 0, "currency": "GBP" }
    }
  ],
  "has_more": false,
  "next_cursor": null
}`,
  },
  webhook: {
    label: "Webhook",
    note: "Live — v2",
    code: `POST https://your-system.example/hooks
Synapse-Signature: t=1763142724,v1=9f2c…  # HMAC-SHA256 over the raw body

{
  "id": "evt_cmv4…",
  "type": "reservation.seated",
  "api_version": "v1",
  "occurred_at": "2026-11-14T19:02:11.000Z",
  "org_id": "org_cmv4…",
  "venue_id": "ven_cmv4…",
  "business_date": null,
  "data": { "object": { "id": "res_cmv55…", "status": "checked_in", … } },
  "previous_attributes": { "status": "confirmed" }
}`,
  },
  graphql: {
    label: "GraphQL",
    note: "Live — read-only",
    code: `POST /public/graphql

query {
  member(id: "mem_cmv4…") {
    firstName lastName status
    spend { visits checks total { minor currency } }
    reservations(first: 3) {
      edges { node { startsAt status venue { name } } }
    }
    loyalty { programName balance { minor } }
  }
}`,
  },
} as const;
type SampleKey = keyof typeof SAMPLES;

function Badge({ status }: { status: Status }) {
  if (status === "building")
    return <span className="rounded-full bg-[var(--warn-soft)] px-2 py-0.5 text-[10px] font-semibold  text-[var(--warn)]">In progress</span>;
  return status === "live" ? (
    <span className="rounded-full bg-[var(--success-soft)] px-2 py-0.5 text-[10px] font-semibold  text-[var(--success)]">Live</span>
  ) : (
    <span className="rounded-full bg-[var(--surface-3)] px-2 py-0.5 text-[10px] font-semibold  text-[var(--muted)]">Coming</span>
  );
}

function Column({ title, sub, items }: { title: string; sub: string; items: Link[] }) {
  return (
    <div>
      <p className="text-xs font-semibold  text-[var(--brand-strong)]">{title}</p>
      <p className="mt-1 text-sm text-[var(--muted)]">{sub}</p>
      <ul className="mt-4 space-y-3">
        {items.map((l) => (
          <li key={l.name} className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold tracking-tight text-[var(--ink)]">{l.name}</span>
              <Badge status={l.status} />
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-[var(--muted)]">{l.what}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** In → one service layer → out, with traffic moving through it. */
function Core({ run }: { run: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-2 lg:py-0">
      <div className="relative hidden h-px w-full bg-[var(--border)] lg:block">
        {run && <span className="flow-dot absolute -top-[3px] h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />}
      </div>
      <div className="w-full rounded-xl bg-[var(--ink-900)] p-5 text-center text-white shadow-[0_30px_80px_-40px_rgba(11,18,32,0.6)]">
        <p className="text-xs font-semibold  text-white/50">synapse</p>
        <p className="mt-1 text-lg font-bold">One service layer</p>
        <p className="mt-1 text-xs leading-relaxed text-white/60">Every route — yours, a partner&apos;s, the till&apos;s — passes the same validation, permissions and audit.</p>
        <div className="mt-4 flex flex-wrap justify-center gap-1.5 text-[10px] font-semibold">
          {["Members", "Bookings", "Events", "Checks", "Menus", "Loyalty"].map((t) => (
            <span key={t} className="rounded-md bg-white/10 px-2 py-1 text-white/80">{t}</span>
          ))}
        </div>
      </div>
      <div className="relative hidden h-px w-full bg-[var(--border)] lg:block">
        {run && <span className="flow-dot absolute -top-[3px] h-1.5 w-1.5 rounded-full bg-[var(--accent)]" style={{ animationDelay: "0.55s" }} />}
      </div>
    </div>
  );
}

export function ApiSection() {
  const [ref, inView] = useInView<HTMLDivElement>(0.2);
  const reduced = useReducedMotion();
  const run = inView && !reduced;
  const [sample, setSample] = useState<SampleKey>("rest");
  const s = SAMPLES[sample];

  return (
    <div ref={ref}>
      <div className="grid items-center gap-6 lg:grid-cols-[1fr_15rem_1fr]">
        <Column title="Inwards" sub="Consume what your other platforms already hold." items={INBOUND} />
        <Core run={run} />
        <Column title="Outwards" sub="Serve your data to your apps and partners." items={OUTBOUND} />
      </div>

      <div className="mx-auto mt-12 max-w-3xl overflow-hidden rounded-xl border border-white/10 bg-[var(--ink-900)] shadow-sm">
        <div role="tablist" aria-label="API examples" className="flex items-center gap-1 border-b border-white/10 px-3 pt-2">
          {(Object.keys(SAMPLES) as SampleKey[]).map((k) => {
            const on = k === sample;
            return (
              <button
                key={k}
                role="tab"
                type="button"
                aria-selected={on}
                onClick={() => setSample(k)}
                className={`-mb-px border-b-2 px-3 py-2 text-sm font-semibold transition-colors ${on ? "border-[var(--accent)] text-white" : "border-transparent text-white/50 hover:text-white/80"}`}
              >
                {SAMPLES[k].label}
              </button>
            );
          })}
          <span className="ml-auto pr-2 text-[11px] font-medium text-white/50">{s.note}</span>
        </div>
        <pre className="overflow-x-auto p-5 font-mono text-[12px] leading-relaxed text-white/85"><code>{s.code}</code></pre>
      </div>
    </div>
  );
}
