"use client";

// The API section: data in from the systems a venue already runs, data out to
// whatever it builds next. Live, in progress and coming are labelled honestly —
// REST, the check feeds and signed webhooks run today; the partner plane and
// GraphQL are being built (docs/superpowers/specs/2026-10-12-public-api-platform-design.md
// in the synapse repo). Code samples use the
// real endpoints, fields and headers.

import { useState } from "react";
import { useInView, useReducedMotion } from "./motion";

type Status = "live" | "building" | "coming";
type Link = { name: string; what: string; status: Status };

const INBOUND: Link[] = [
  { name: "Salesforce", what: "Members and applicants, both ways — OAuth, a field mapper over your own objects, and a sync engine that never echoes.", status: "live" },
  { name: "SevenRooms", what: "Venues, clients and reservations in; every check out, so spend lands on the guest profile.", status: "live" },
  { name: "SynXis", what: "Hotel reservations in by activity date, check-ins and cancellations back — built against the published API, live once a venue's partner agreement is in place.", status: "building" },
  { name: "Tripleseat", what: "Events and banqueting in, on the same pattern as SevenRooms.", status: "coming" },
];

const OUTBOUND: Link[] = [
  { name: "REST API", what: "Every module — members, bookings, events, checks, menus, reports — versioned, with an OpenAPI reference and developer docs at gosynapse.net/docs.", status: "live" },
  { name: "Webhooks & events", what: "Signed callbacks when a check opens, changes or closes; a domain-event outbox behind every booking, ticket and member.", status: "live" },
  { name: "POS feeds", what: "Checks and reservations as Oracle Simphony-shaped documents, so anything that reads a POS feed reads ours.", status: "live" },
  { name: "GraphQL", what: "A read plane for composed views — a check with its table, member and totals in one query.", status: "building" },
  { name: "Partner API", what: "/public/v1 with scoped keys, idempotency, cursor pagination and per-key rate limits — the foundation is built, resources are rolling out, OAuth for installed apps follows.", status: "building" },
];

const SAMPLES = {
  rest: {
    label: "REST",
    note: "Live",
    code: `GET /v1/bookings?status=BOOKED
Authorization: Bearer <token>

[
  {
    "id": "cmv55zeip007nbdpvl0dvg9gn",
    "tableNumber": "3",
    "memberName": "Olivia Bennett",
    "partySize": 2,
    "startsAt": "2026-10-15T18:45:00.000Z",
    "status": "BOOKED",
    "source": "INTERNAL",
    "spendMinor": null
  }
]`,
  },
  webhook: {
    label: "Webhook",
    note: "Live",
    code: `POST https://your-system.example/hooks
x-pos-event: pos.check.closed
x-pos-signature: 9f2c…  # HMAC-SHA256 of the body

{
  "id": "evt_cmv4…_pos.check.closed",
  "type": "pos.check.closed",
  "occurredAt": "2026-10-15T21:12:04.000Z",
  "source": "POS",
  "match": { "venue": "Ashgrove House", "table": "3" },
  "guestCheck": {
    "chkNum": 129,
    "tblName": "3",
    "guest": { "firstName": "Olivia", "lastName": "Bennett", … },
    "totals": { "chkTtl": 84.00, "payTtl": 84.00, "balDueTtl": 0, … }
  }
}`,
  },
  graphql: {
    label: "GraphQL",
    note: "In progress — preview",
    code: `query {
  check(id: "chk_…") {
    checkNumber
    table { number }
    member { firstName lastName }
    totals { totalMinor currency }
  }
}`,
  },
} as const;
type SampleKey = keyof typeof SAMPLES;

function Badge({ status }: { status: Status }) {
  if (status === "building")
    return <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">In progress</span>;
  return status === "live" ? (
    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">Live</span>
  ) : (
    <span className="rounded-full bg-[var(--surface-3)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">Coming</span>
  );
}

function Column({ title, sub, items }: { title: string; sub: string; items: Link[] }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand-strong)]">{title}</p>
      <p className="mt-1 text-sm text-[var(--muted)]">{sub}</p>
      <ul className="mt-4 space-y-3">
        {items.map((l) => (
          <li key={l.name} className="rounded-2xl border border-[var(--border)] bg-white p-4">
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
      <div className="w-full rounded-2xl bg-[var(--ink-900)] p-5 text-center text-white shadow-[0_30px_80px_-40px_rgba(11,18,32,0.6)]">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/50">synapse</p>
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

      <div className="mx-auto mt-12 max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-[var(--ink-900)] shadow-[0_40px_100px_-40px_rgba(11,18,32,0.5)]">
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
