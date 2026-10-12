"use client";

// The marketing & messaging showcase: four views of the same engine — what
// triggers a message, the journey canvas, the campaign builder and the
// template editor. Names, venue, event, prices and message copy come from the
// synapse seed and its shipped templates (see data.ts); nothing is a mock-up
// of a feature that does not exist. Motion honours prefers-reduced-motion.

import { useEffect, useState } from "react";
import { useEased, useInView, useReducedMotion } from "./motion";
import { MEMBERS, initials, memberName, type Member } from "./data";
import { FlowIcon, MEMBER_TABLE, Pipeline, Row, StageBody, StageStack, useTick, type Stage } from "./flows";

const ORG = "Ashgrove Social Group";
const VENUE = "Ashgrove House";
// "Jazz in the Walled Garden": capacity 80, £30 — seed.ts events.
const EVENT = { title: "Jazz in the Walled Garden", price: "£30", capacity: 80 };
// Booking references are "BK-" + six characters derived from the id.
const BOOKING_REF: Record<string, string> = { "SF-0001": "BK-3F9Q2M", "SF-0002": "BK-7H2KX4", "SF-0003": "BK-Q8D1RW", "SF-0004": "BK-M5T6PA" };
const PARTY: Record<string, number> = { "SF-0001": 2, "SF-0002": 4, "SF-0003": 2, "SF-0004": 3 };

type View = "triggers" | "journeys" | "campaigns" | "templates";
const VIEWS: { key: View; label: string; icon: string }[] = [
  { key: "triggers", label: "Triggers", icon: "bolt" },
  { key: "journeys", label: "Journeys", icon: "branch" },
  { key: "campaigns", label: "Campaigns", icon: "send" },
  { key: "templates", label: "Templates", icon: "mail" },
];

export function MarketingShowcase() {
  const [ref, inView] = useInView<HTMLDivElement>(0.25);
  const reduced = useReducedMotion();
  const run = inView && !reduced;
  const [view, setView] = useState<View>("triggers");
  const [picked, setPicked] = useState(false);

  // Walk through the four views on its own until someone picks one.
  useEffect(() => {
    if (!run || picked) return;
    const id = setInterval(() => setView((v) => VIEWS[(VIEWS.findIndex((x) => x.key === v) + 1) % VIEWS.length]!.key), 11_000);
    return () => clearInterval(id);
  }, [run, picked]);

  const panels: Record<View, React.ReactNode> = {
    triggers: <TriggersView run={run && view === "triggers"} />,
    journeys: <JourneysView run={run && view === "journeys"} />,
    campaigns: <CampaignsView run={run && view === "campaigns"} />,
    templates: <TemplatesView run={run && view === "templates"} />,
  };

  return (
    <div ref={ref} className="bg-white">
      <div role="tablist" aria-label="Marketing features" className="flex gap-1 overflow-x-auto overflow-y-hidden border-b border-[var(--border)] px-3 pt-2 [scrollbar-width:none]">
        {VIEWS.map((v) => {
          const on = v.key === view;
          return (
            <button
              key={v.key}
              role="tab"
              type="button"
              aria-selected={on}
              onClick={() => {
                setPicked(true);
                setView(v.key);
              }}
              className={`-mb-px flex flex-none items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-semibold transition-colors ${
                on ? "border-[var(--brand)] text-[var(--brand-strong)]" : "border-transparent text-[var(--muted)] hover:text-[var(--ink)]"
              }`}
            >
              <FlowIcon name={v.icon} className="h-4 w-4" />
              {v.label}
            </button>
          );
        })}
      </div>
      {/* All views share one grid cell, so the card is as tall as the tallest
          and never jumps when the tab changes. */}
      <div className="grid grid-cols-[minmax(0,1fr)]">
        {VIEWS.map((v) => {
          const on = v.key === view;
          return (
            <div key={v.key} role="tabpanel" style={{ gridArea: "1 / 1" }} className={`min-w-0 ${on ? "stage-in" : "invisible"}`} aria-hidden={!on}>
              {panels[v.key]}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ViewHeader({ title, note }: { title: string; note: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-5 pt-4">
      <span className="text-sm font-semibold text-[var(--ink)]">{title}</span>
      <span className="text-xs text-[var(--muted)]">{note}</span>
    </div>
  );
}

function MemberChip({ m }: { m: Member }) {
  return (
    <span className="flex items-center gap-2">
      <span className="flex h-6 w-6 flex-none items-center justify-center rounded-lg bg-[var(--brand-soft)] text-[10px] font-bold text-[var(--brand-strong)]">{initials(m)}</span>
      <span className="text-[var(--ink)]">{memberName(m)}</span>
    </span>
  );
}

/* ------------------------------ 1. triggers ------------------------------ */

// The booking automations as they ship: a confirmation the moment the table is
// booked, a wait until 24 hours before, a check that it still stands, then the
// reminder. Cancel in between and the reminder never sends.
const TRIGGER_STAGES: Stage[] = [
  { key: "booked", label: "Booked", icon: "calendar" },
  { key: "confirm", label: "Confirm", icon: "mail" },
  { key: "wait", label: "Wait", icon: "clock" },
  { key: "check", label: "Still on?", icon: "branch" },
  { key: "remind", label: "Remind", icon: "sms" },
];

function TriggersView({ run }: { run: boolean }) {
  const tick = useTick(1700, run);
  const stage = run ? tick % TRIGGER_STAGES.length : TRIGGER_STAGES.length - 1;
  const member = MEMBERS[run ? Math.floor(tick / TRIGGER_STAGES.length) % MEMBERS.length : 0]!;
  const seat = MEMBER_TABLE[member.ref]!;
  const party = PARTY[member.ref] ?? 2;
  const ref = BOOKING_REF[member.ref]!;
  const when = `Fri 16 Oct, ${seat.time}`;

  const log = [
    { at: "Mon 11:02", text: "booking.created" },
    { at: "Mon 11:02", text: "Confirmation emailed · delivered" },
    { at: "Mon 11:02", text: `Reminder due Thu ${seat.time}` },
    { at: `Thu ${seat.time}`, text: "Still booked · not opted out" },
    { at: `Thu ${seat.time}`, text: "Reminder texted · delivered" },
  ];

  return (
    <div>
      <ViewHeader title="Booking confirmation & reminder" note="Automations · on for every venue" />
      <div className="px-5 py-5">
        <Pipeline stages={TRIGGER_STAGES} active={stage} run={run} />
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <StageStack active={stage} panels={[
              <StageBody title="Table booked" icon="calendar">
                <Row k="Member" v={memberName(member)} />
                <Row k="When" v={when} />
                <Row k="Table" v={seat.table} muted />
                <Row k="Party" v={`${party} guests`} muted />
                <Row k="Reference" v={ref} muted />
              </StageBody>
            ,
              <StageBody title="Confirmation emailed" icon="mail">
                <div className="rounded-lg border border-[var(--border)] bg-white p-3">
                  <div className="text-[10px] text-[var(--muted)]">{ORG}</div>
                  <div className="mt-0.5 text-xs font-semibold text-[var(--ink)]">Your table is booked for {when}</div>
                  <p className="mt-1.5 text-xs leading-relaxed text-[var(--muted)]">
                    Hi {member.first}, we have a table for you at {VENUE}. Party of {party} · ref {ref}.
                  </p>
                </div>
                <div className="mt-2 text-[10px] text-[var(--muted)]">Sent the moment they booked</div>
              </StageBody>
            ,
              <StageBody title="Waiting" icon="clock">
                <Row k="Until" v={`Thu 15 Oct, ${seat.time}`} accent />
                <Row k="Rule" v="24 hours before" muted />
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--surface-3)]">
                  <div className="h-full rounded-full bg-[var(--brand)]" style={{ width: "100%", animation: run ? "grow-x 1.6s linear both" : undefined }} />
                </div>
                <div className="mt-2 text-[10px] text-[var(--muted)]">Moved the booking? The reminder moves with it.</div>
              </StageBody>
            ,
              <StageBody title="Checked before sending" icon="branch">
                <Row k="Booking still on" v="Yes" accent />
                <Row k="Opted out" v="No" muted />
                <Row k="Mobile on file" v="Yes" muted />
                <div className="mt-2 text-[10px] text-[var(--muted)]">Cancelled instead? The reminder never sends.</div>
              </StageBody>
            ,
              <StageBody title="Reminder texted" icon="sms">
                <div className="max-w-[17rem] rounded-2xl rounded-bl-md bg-[var(--brand)] px-3 py-2 text-xs leading-relaxed text-white">
                  Reminder from {VENUE}: your table for {party} is tomorrow, {when}. Ref {ref}. Can&apos;t make it? Please let us know.
                </div>
                <div className="mt-2 text-[10px] text-[var(--muted)]">Delivered · logged on {member.first}&apos;s record</div>
              </StageBody>
            ,
          ]} />
          <div className="rounded-xl border border-[var(--border)] bg-white p-4">
            <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">What happened</div>
            <ol className="space-y-2.5">
              {log.map((l, i) => {
                const shown = i <= stage;
                return (
                  <li key={l.text} className="flex items-start gap-2.5 text-xs transition-opacity duration-500" style={{ opacity: shown ? 1 : 0.25 }}>
                    <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full" style={{ background: shown ? "var(--brand)" : "var(--border)" }} />
                    <span className={`flex-1 ${i === 0 ? "font-mono" : ""} text-[var(--ink)]`}>{l.text}</span>
                    <span className="flex-none tabular-nums text-[var(--muted)]">{l.at}</span>
                  </li>
                );
              })}
            </ol>
            <div className="mt-4 border-t border-[var(--border)] pt-3 text-[10px] leading-relaxed text-[var(--muted)]">
              Also on: ticket confirmations, event reminders, cancellations and guest invitations.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ 2. journeys ------------------------------ */

// The example journey every venue is given as a draft: join the email
// audience → promo email → wait up to 48 hours for an open → opened: done /
// not opened: a follow-up text.
type JNode = { id: string; x: number; y: number; title: string; sub: string; icon: string };
const NODES: JNode[] = [
  { id: "entry", x: 11, y: 50, title: "Audience", sub: "Opted in", icon: "member" },
  { id: "email", x: 33, y: 50, title: "Email", sub: "Save the date", icon: "mail" },
  { id: "wait", x: 56, y: 50, title: "Wait for open", sub: "Up to 48h", icon: "clock" },
  { id: "done", x: 86, y: 20, title: "Done", sub: "Opened", icon: "tick" },
  { id: "sms", x: 86, y: 80, title: "Text", sub: "Follow-up", icon: "sms" },
];
const EDGES: { from: string; to: string; label?: string }[] = [
  { from: "entry", to: "email" },
  { from: "email", to: "wait" },
  { from: "wait", to: "done", label: "opened" },
  { from: "wait", to: "sms", label: "not opened" },
];
const PALETTE = ["Send", "Wait", "Wait for event", "Condition", "Split", "Update contact"];

function JourneysView({ run }: { run: boolean }) {
  const tick = useTick(1500, run);
  // Each member walks entry → email → wait → outcome; odd ones never open it.
  const step = run ? tick % 4 : 3;
  const memberIdx = run ? Math.floor(tick / 4) % MEMBERS.length : 0;
  const member = MEMBERS[memberIdx]!;
  const opens = memberIdx % 2 === 0;
  const path = ["entry", "email", "wait", opens ? "done" : "sms"];
  const activeId = path[step]!;

  // Running totals per node, as the live view shows them.
  const completed = run ? Math.floor(tick / 4) : MEMBERS.length;
  const totals = {
    entry: 12 + completed + (step >= 0 ? 1 : 0),
    email: 12 + completed + (step >= 1 ? 1 : 0),
    wait: 12 + completed + (step >= 2 ? 1 : 0),
    done: 7 + Math.ceil(completed / 2) + (step >= 3 && opens ? 1 : 0),
    sms: 5 + Math.floor(completed / 2) + (step >= 3 && !opens ? 1 : 0),
  } as Record<string, number>;

  const byId = Object.fromEntries(NODES.map((n) => [n.id, n]));
  const lit = new Set(path.slice(0, step + 1));

  return (
    <div>
      <ViewHeader title="Journey · Event promo with follow-up" note="Drag nodes in, connect them, publish" />
      <div className="px-5 py-4">
        <div className="mb-3 flex flex-wrap items-center gap-1.5">
          {PALETTE.map((p) => (
            <span key={p} className="flex items-center gap-1 rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-2 py-1 text-[10px] font-medium text-[var(--muted)]">
              <span className="text-[var(--muted)] opacity-60">⋮⋮</span>
              {p}
            </span>
          ))}
          <span className="ml-auto rounded-full bg-[var(--brand-soft)] px-2 py-0.5 text-[10px] font-semibold text-[var(--brand-strong)]">v2 · live</span>
        </div>
        {/* Wide canvas; on a phone it scrolls inside its own box, not the page. */}
        <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
          <div
            className="relative h-64 min-w-[640px]"
            style={{ backgroundImage: "radial-gradient(var(--border) 1px, transparent 1px)", backgroundSize: "16px 16px" }}
          >
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
              {EDGES.map((e) => {
                const a = byId[e.from]!;
                const b = byId[e.to]!;
                const on = lit.has(e.from) && lit.has(e.to);
                const midX = (a.x + b.x) / 2;
                return (
                  <path
                    key={`${e.from}-${e.to}`}
                    d={`M ${a.x + 8} ${a.y} C ${midX + 4} ${a.y}, ${midX - 4} ${b.y}, ${b.x - 8} ${b.y}`}
                    fill="none"
                    stroke={on ? "var(--brand)" : "var(--border)"}
                    strokeWidth={on ? 2 : 1.5}
                    vectorEffect="non-scaling-stroke"
                    style={{ transition: "stroke 300ms" }}
                  />
                );
              })}
            </svg>
            {EDGES.filter((e) => e.label).map((e) => {
              const a = byId[e.from]!;
              const b = byId[e.to]!;
              return (
                <span
                  key={e.label}
                  className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--border)] bg-white px-1.5 py-0.5 text-[9px] font-semibold text-[var(--muted)]"
                  style={{ left: `${(a.x + b.x) / 2 + 3}%`, top: `${(a.y + b.y) / 2}%` }}
                >
                  {e.label}
                </span>
              );
            })}
            {NODES.map((n) => {
              const on = n.id === activeId;
              const passed = lit.has(n.id);
              return (
                <div
                  key={n.id}
                  className="absolute w-[7.5rem] -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-white px-2.5 py-2 shadow-sm transition-[border-color,box-shadow] duration-300"
                  style={{
                    left: `${n.x}%`,
                    top: `${n.y}%`,
                    borderColor: on ? "var(--brand)" : "var(--border)",
                    boxShadow: on ? "0 0 0 3px var(--brand-soft)" : undefined,
                  }}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="flex h-5 w-5 flex-none items-center justify-center rounded-md" style={{ background: passed ? "var(--brand)" : "var(--surface-2)", color: passed ? "#fff" : "var(--muted)" }}>
                      <FlowIcon name={n.icon} className="h-3 w-3" />
                    </span>
                    <span className="truncate text-[11px] font-semibold text-[var(--ink)]">{n.title}</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between gap-1">
                    <span className="truncate text-[9px] text-[var(--muted)]">{n.sub}</span>
                    <span className="text-[10px] font-bold tabular-nums text-[var(--brand-strong)]">{totals[n.id]}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-[var(--muted)]">
          <span className="flex items-center gap-2">Now: <MemberChip m={member} /></span>
          <span>{step < 3 ? "in progress" : opens ? "opened the email — done" : "didn't open — texted instead"}</span>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- 3. campaigns ------------------------------ */

const CAMPAIGN_STAGES: Stage[] = [
  { key: "audience", label: "Audience", icon: "member" },
  { key: "template", label: "Template", icon: "mail" },
  { key: "review", label: "Review", icon: "tick" },
  { key: "send", label: "Send", icon: "send" },
  { key: "report", label: "Report", icon: "track" },
];

// Who the audience finds, and why the send gate leaves some of them out.
const RECIPIENTS: { m: Member; status: "send" | "no-consent" | "unsubscribed" }[] = [
  { m: MEMBERS[0]!, status: "send" },
  { m: MEMBERS[1]!, status: "no-consent" },
  { m: MEMBERS[2]!, status: "send" },
  { m: MEMBERS[3]!, status: "unsubscribed" },
];
const STATUS_LABEL = { send: "Will receive", "no-consent": "No marketing consent", unsubscribed: "Unsubscribed" };

function CampaignsView({ run }: { run: boolean }) {
  const tick = useTick(1900, run);
  const stage = run ? tick % CAMPAIGN_STAGES.length : CAMPAIGN_STAGES.length - 1;
  const reportOn = stage === 4;
  const delivered = useEased(reportOn ? 2 : 0, run);
  const opened = useEased(reportOn ? 2 : 0, run);
  const clicked = useEased(reportOn ? 1 : 0, run);

  return (
    <div>
      <ViewHeader title={`Campaign · ${EVENT.title}`} note="Audience → template → review → send" />
      <div className="px-5 py-5">
        <Pipeline stages={CAMPAIGN_STAGES} active={stage} run={run} />
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <StageStack active={stage} panels={[
              <StageBody title="Audience" icon="member">
                <div className="mb-2 flex flex-wrap gap-1.5">
                  {["Member status is Live", "Visited in the last 90 days"].map((c) => (
                    <span key={c} className="rounded-md bg-white px-2 py-1 text-[10px] font-medium text-[var(--ink)] ring-1 ring-[var(--border)]">{c}</span>
                  ))}
                </div>
                <Row k="Matches" v="4 members" accent />
                <Row k="Updates" v="When they visit or book" muted />
              </StageBody>
            ,
              <StageBody title="Template" icon="mail">
                <div className="rounded-lg border border-[var(--border)] bg-white p-3">
                  <div className="text-[10px] text-[var(--muted)]">{ORG}</div>
                  <div className="mt-0.5 text-xs font-semibold text-[var(--ink)]">{EVENT.title}</div>
                  <p className="mt-1.5 text-xs leading-relaxed text-[var(--muted)]">An evening of live jazz in the walled garden. {EVENT.price}, {EVENT.capacity} places.</p>
                  <span className="mt-2 inline-block rounded-md bg-[var(--brand)] px-2 py-1 text-[10px] font-semibold text-white">Book your place</span>
                </div>
              </StageBody>
            ,
              <StageBody title="Review" icon="tick">
                <Row k="Will receive" v="2" accent />
                <Row k="No marketing consent" v="1" muted />
                <Row k="Unsubscribed" v="1" muted />
                <div className="mt-2 text-[10px] text-[var(--muted)]">Scheduled overnight? It waits for quiet hours to end.</div>
              </StageBody>
            ,
              <StageBody title="Sending" icon="send">
                <Row k="Sent" v="2 of 2" accent />
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--surface-3)]">
                  <div className="h-full rounded-full bg-[var(--brand)]" style={{ width: "100%", animation: run ? "grow-x 1.8s ease-out both" : undefined }} />
                </div>
                <div className="mt-2 text-[10px] text-[var(--muted)]">One message per person, even if it runs twice.</div>
              </StageBody>
            ,
              <StageBody title="Report" icon="track">
                {[
                  ["Delivered", delivered, 2],
                  ["Opened", opened, 2],
                  ["Clicked", clicked, 2],
                ].map(([k, v, max]) => (
                  <div key={k as string} className="py-1">
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="text-[var(--ink)]">{k as string}</span>
                      <span className="tabular-nums text-[var(--muted)]">{Math.round(v as number)} / {max as number}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-[var(--surface-3)]">
                      <div className="h-full rounded-full bg-[var(--brand)]" style={{ width: `${((v as number) / (max as number)) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </StageBody>
            ,
          ]} />
          <div className="rounded-xl border border-[var(--border)] bg-white p-4">
            <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Recipients</div>
            <ul className="space-y-2.5 text-xs">
              {RECIPIENTS.map((r) => {
                const decided = stage >= 2;
                const ok = r.status === "send";
                return (
                  <li key={r.m.ref} className="flex items-center justify-between gap-2">
                    <MemberChip m={r.m} />
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-semibold transition-colors duration-300"
                      style={{
                        background: !decided ? "var(--surface-2)" : ok ? "var(--brand-soft)" : "var(--surface-2)",
                        color: !decided ? "var(--muted)" : ok ? "var(--brand-strong)" : "var(--muted)",
                      }}
                    >
                      {!decided ? "In audience" : stage >= 3 && ok ? "Sent" : STATUS_LABEL[r.status]}
                    </span>
                  </li>
                );
              })}
            </ul>
            <div className="mt-4 border-t border-[var(--border)] pt-3 text-[10px] leading-relaxed text-[var(--muted)]">
              Consent, unsubscribes and the weekly limit are checked for every person, every send.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- 4. templates ------------------------------ */

const BLOCKS = ["Heading", "Text", "Image", "Button", "Divider", "Columns"];
// The example journey's follow-up text, as shipped.
const SMS_SOURCE = "{{ org.name }}: something special is coming up and we'd love to see you there. Reply to this number for details.";
const SMS_RENDERED = SMS_SOURCE.replace("{{ org.name }}", ORG);

function Merge({ field, value, preview }: { field: string; value: string; preview: boolean }) {
  return preview ? (
    <span className="font-semibold text-[var(--ink)]">{value}</span>
  ) : (
    <span className="rounded bg-[var(--brand-soft)] px-1 font-mono text-[10px] text-[var(--brand-strong)]">{`{{ ${field} }}`}</span>
  );
}

function TemplatesView({ run }: { run: boolean }) {
  const tick = useTick(1800, run);
  const dragging = run ? tick % BLOCKS.length : -1;
  const preview = run ? Math.floor(tick / 3) % 2 === 1 : true;
  const member = MEMBERS[0]!;
  const segments = Math.ceil(SMS_RENDERED.length / 160);

  return (
    <div>
      <ViewHeader title="Template · Save the date" note="Drag-and-drop email · SMS with a live count" />
      <div className="grid gap-4 px-5 py-5 sm:grid-cols-[7rem_1fr]">
        <div className="hidden flex-col gap-1.5 sm:flex">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">Blocks</div>
          {BLOCKS.map((b, i) => (
            <span
              key={b}
              className="rounded-md border px-2 py-1.5 text-[11px] font-medium transition-all duration-300"
              style={{
                borderColor: i === dragging ? "var(--brand)" : "var(--border)",
                color: i === dragging ? "var(--brand-strong)" : "var(--ink)",
                transform: i === dragging ? "translateX(6px)" : undefined,
                background: i === dragging ? "var(--brand-soft)" : "white",
              }}
            >
              {b}
            </span>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-[1fr_12rem]">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex rounded-md bg-white p-0.5 text-[10px] font-semibold ring-1 ring-[var(--border)]">
                <span className={`rounded px-2 py-0.5 ${!preview ? "bg-[var(--brand)] text-white" : "text-[var(--muted)]"}`}>Design</span>
                <span className={`rounded px-2 py-0.5 ${preview ? "bg-[var(--brand)] text-white" : "text-[var(--muted)]"}`}>Preview</span>
              </div>
              <span className="text-[10px] text-[var(--muted)]">{preview ? `as ${memberName(member)}` : "merge fields"}</span>
            </div>
            <div className="rounded-lg bg-white p-4 text-xs leading-relaxed text-[var(--muted)] shadow-sm">
              <div className="text-center text-[10px] tracking-[0.2em]">
                <Merge field="org.name | upcase" value={ORG.toUpperCase()} preview={preview} />
              </div>
              <div className="mt-3 text-sm font-semibold text-[var(--ink)]">Save the date</div>
              <p className="mt-1.5">
                Hi <Merge field={'contact.firstName | default: "there"'} value={member.first} preview={preview} />, we have something
                special coming up at <Merge field="venue.name | default: org.name" value={VENUE} preview={preview} /> and we would love you to be there.
              </p>
              <div className="mt-3 rounded-md border border-dashed border-[var(--border)] px-2 py-3 text-center text-[10px]">
                {EVENT.title} · {EVENT.price}
              </div>
              <span className="mt-3 inline-block rounded-md bg-[var(--brand)] px-2.5 py-1 text-[10px] font-semibold text-white">Book your place</span>
            </div>
          </div>
          <div className="flex flex-col rounded-xl border border-[var(--border)] bg-white p-3">
            <div className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">SMS template</div>
            <div className="rounded-2xl rounded-bl-md bg-[var(--surface-2)] px-3 py-2 text-[11px] leading-relaxed text-[var(--ink)]">
              {preview ? SMS_RENDERED : (
                <>
                  <Merge field="org.name" value={ORG} preview={false} />
                  {SMS_SOURCE.replace("{{ org.name }}", "")}
                </>
              )}
            </div>
            <div className="mt-auto flex justify-between pt-3 text-[10px] text-[var(--muted)]">
              <span className="tabular-nums">{SMS_RENDERED.length} / 160</span>
              <span>{segments} segment{segments > 1 ? "s" : ""} · GSM-7</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
