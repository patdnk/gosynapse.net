"use client";

// Data-flow illustrations: a transaction moving through the platform, and a
// member's lifecycle. Both are driven by the real seed catalogue + real money
// math (see data.ts) so every name, price, discount and total is authentic.
// Motion is subtle and honours prefers-reduced-motion.

import { Fragment, useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion, useEased } from "./motion";
import {
  ORDERS, MEMBERS, PLANS, DISCOUNTS, checkTotals, priceOf, fmt,
  findMember, memberName, initials, type Order, type Member,
} from "./data";

/* -------------------------------- tick hook ------------------------------ */

// A monotonically increasing tick, used to derive stage/record indices so we
// can detect wrap-around and "commit" a completed record to the graphs.
function useTick(intervalMs: number, active: boolean) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setTick((t) => t + 1), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs, active]);
  return tick;
}

/* --------------------------------- icons --------------------------------- */

function FlowIcon({ name, className = "h-4 w-4" }: { name: string; className?: string }) {
  const p = { className, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (name) {
    case "order": return <svg {...p}><path d="M6 2 4 6v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6l-2-4Z" /><path d="M4 6h16M9 10a3 3 0 0 0 6 0" /></svg>;
    case "discount": return <svg {...p}><path d="M20 12.5 12.5 20a2 2 0 0 1-2.8 0l-5.7-5.7a2 2 0 0 1 0-2.8L11 4h7a2 2 0 0 1 2 2Z" /><circle cx="15.5" cy="8.5" r="1.2" fill="currentColor" /></svg>;
    case "check": return <svg {...p}><path d="M6 2h9l5 5v15a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Z" /><path d="M14 2v5h5M8 13h8M8 17h5" /></svg>;
    case "intake": return <svg {...p}><rect x="2" y="6" width="20" height="13" rx="2" /><path d="M2 10h20M6 15h4" /></svg>;
    case "member": return <svg {...p}><circle cx="12" cy="8" r="3.4" /><path d="M5 20a7 7 0 0 1 14 0" /></svg>;
    case "checkin": return <svg {...p}><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><path d="M10 17l5-5-5-5M15 12H3" /></svg>;
    case "track": return <svg {...p}><path d="M3 3v18h18" /><path d="M7 14l3-4 3 3 5-7" /></svg>;
    case "bolt": return <svg {...p}><path d="M13 2 4 14h7l-1 8 9-12h-7Z" /></svg>;
    default: return <svg {...p}><circle cx="12" cy="12" r="8" /></svg>;
  }
}

/* ------------------------------- pipeline -------------------------------- */

type Stage = { key: string; label: string; icon: string };

function Pipeline({ stages, active, run }: { stages: Stage[]; active: number; run: boolean }) {
  return (
    <div className="flex items-start">
      {stages.map((s, i) => {
        const done = i < active;
        const isActive = i === active;
        return (
          <Fragment key={s.key}>
            <div className="flex w-16 flex-none flex-col items-center gap-1.5 sm:w-20">
              <span
                className="relative flex h-9 w-9 items-center justify-center rounded-xl transition-colors duration-300"
                style={{
                  background: done || isActive ? "var(--brand)" : "var(--surface-2)",
                  color: done || isActive ? "#fff" : "var(--muted)",
                }}
              >
                {isActive && run && <span className="absolute inset-0 rounded-xl bg-[var(--brand)] opacity-30 pulse-ring" />}
                <FlowIcon name={s.icon} />
              </span>
              <span className="text-center text-[10px] font-semibold leading-tight" style={{ color: done || isActive ? "var(--ink)" : "var(--muted)" }}>
                {s.label}
              </span>
            </div>
            {i < stages.length - 1 && (
              <div className="relative mt-4 h-px flex-1" style={{ background: done ? "var(--brand)" : "var(--border)" }}>
                {run && i === active && (
                  <span className="flow-dot absolute -top-[3px] h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                )}
              </div>
            )}
          </Fragment>
        );
      })}
    </div>
  );
}

// A little bar graph that gains bars as records commit.
function BarGraph({ values, highlightLast }: { values: number[]; highlightLast: boolean }) {
  const max = Math.max(1, ...values);
  return (
    <div className="flex h-24 items-end gap-1.5">
      {values.map((v, i) => {
        const last = i === values.length - 1;
        return (
          <div
            key={i}
            className="flex-1 rounded-t transition-[height,background-color] duration-500"
            style={{
              height: `${Math.max(6, (v / max) * 100)}%`,
              background: last && highlightLast ? "var(--accent)" : "var(--brand-soft)",
              boxShadow: last && highlightLast ? "0 0 0 1px var(--brand)" : "none",
            }}
          />
        );
      })}
    </div>
  );
}

/* ----------------------- 1. order → … → member --------------------------- */

const REV_STAGES: Stage[] = [
  { key: "order", label: "Order", icon: "order" },
  { key: "discount", label: "Discount", icon: "discount" },
  { key: "check", label: "Check", icon: "check" },
  { key: "intake", label: "Intake", icon: "intake" },
  { key: "member", label: "Member", icon: "member" },
];

function orderTotals(o: Order) {
  return checkTotals(o.lines, DISCOUNTS[o.discount]);
}

export function RevenueFlow() {
  const [ref, inView] = useInView<HTMLDivElement>(0.3);
  const reduced = useReducedMotion();
  const run = inView && !reduced;
  const tick = useTick(1150, run);

  const stage = run ? tick % REV_STAGES.length : REV_STAGES.length - 1;
  const orderIdx = run ? Math.floor(tick / REV_STAGES.length) % ORDERS.length : 0;
  const order = ORDERS[orderIdx]!;
  const member = findMember(order.memberRef);
  const discount = DISCOUNTS[order.discount];
  const t = orderTotals(order);

  // Registering graph + cumulative intake: commit each check once, at Intake.
  const seed = ORDERS.map((o) => orderTotals(o).totalMinor);
  const [bars, setBars] = useState<number[]>([...seed, seed[1]!, seed[0]!, seed[2]!]);
  const [intakeMinor, setIntakeMinor] = useState(428_60 + seed.reduce((a, b) => a + b, 0));
  const committedRef = useRef(-1);
  useEffect(() => {
    if (!run) return;
    if (stage === 3 && committedRef.current !== tick) {
      committedRef.current = tick;
      setBars((b) => [...b.slice(-8), t.totalMinor]);
      setIntakeMinor((v) => v + t.totalMinor);
    }
  }, [stage, tick, run, t.totalMinor]);
  const easedIntake = useEased(intakeMinor, run);

  return (
    <div ref={ref} className="bg-white">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-[var(--ink)]">
          <span className="h-2 w-2 rounded-full bg-[#12a150]" />
          Revenue engine
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-wide text-[var(--muted)]">Intake today</div>
          <div className="text-sm font-bold tabular-nums text-[var(--ink)]">{fmt(Math.round(easedIntake))}</div>
        </div>
      </div>

      <div className="px-5 py-5">
        <Pipeline stages={REV_STAGES} active={stage} run={run} />

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {/* active-stage record */}
          <StageStack active={stage} panels={[
              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--brand-strong)]">Order · {order.table}</div>
                <OrderLines lines={order.lines} />
                <div className="mt-2 flex justify-between border-t border-[var(--border)] pt-2 font-semibold text-[var(--ink)]">
                  <span>Subtotal</span><span className="tabular-nums">{fmt(t.subtotalMinor)}</span>
                </div>
              </div>
            ,
              <StageBody title="Discount applied" icon="discount">
                <Row k={discount.name} v={"−" + fmt(t.discountMinor)} accent />
                <Row k="Subtotal" v={fmt(t.subtotalMinor)} muted />
                <p className="mt-2 text-xs text-[var(--muted)]">{PLANS[member.plan].name} member rate — allocated across lines for a correct VAT split.</p>
              </StageBody>
            ,
              <StageBody title="Check settled" icon="check">
                <Row k="Subtotal" v={fmt(t.subtotalMinor)} muted />
                <Row k={discount.name} v={"−" + fmt(t.discountMinor)} muted />
                <Row k="Total" v={fmt(t.totalMinor)} big />
                <Row k="includes VAT @ 20%" v={fmt(t.vatMinor)} muted />
              </StageBody>
            ,
              <StageBody title="Payment captured" icon="intake">
                <Row k="Card · Visa ····4242" v={"+" + fmt(t.totalMinor)} accent />
                <Row k="Net of VAT" v={fmt(t.netMinor)} muted />
                <Row k="To VAT account" v={fmt(t.vatMinor)} muted />
                <p className="mt-2 text-xs text-[var(--muted)]">Settled to the org's connected Stripe/Adyen account.</p>
              </StageBody>
            ,
              <StageBody title="Attributed to member" icon="member">
                <div className="mb-1 flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--brand-soft)] text-[11px] font-bold text-[var(--brand-strong)]">{initials(member)}</span>
                  <span className="font-semibold text-[var(--ink)]">{memberName(member)}</span>
                  <span className="rounded-full bg-[var(--brand)] px-2 py-0.5 text-[10px] font-bold text-white">{PLANS[member.plan].name}</span>
                </div>
                <Row k="Spend recorded" v={"+" + fmt(t.totalMinor)} accent />
                <Row k="Loyalty credit earned" v={fmt(Math.round(t.totalMinor * 0.1))} muted />
                <Row k="Ref" v={member.ref} muted />
              </StageBody>
            ,
          ]} />

          {/* registering graph */}
          <div className="rounded-xl border border-[var(--border)] bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Intake · last {bars.length} checks</span>
              <span className="flex items-center gap-1 text-[10px] font-semibold text-[#12a150]"><span className="h-1.5 w-1.5 rounded-full bg-[#12a150]" />live</span>
            </div>
            <BarGraph values={bars} highlightLast={stage >= 3} />
            <div className="mt-2 flex justify-between text-[10px] text-[var(--muted)]">
              <span>each bar = one settled check</span>
              <span className="tabular-nums">latest {fmt(bars[bars.length - 1]!)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* --------------------- 2. member check-in → tracking --------------------- */

const MEM_STAGES: Stage[] = [
  { key: "checkin", label: "Check-in", icon: "checkin" },
  { key: "order", label: "Order", icon: "order" },
  { key: "track", label: "Tracking", icon: "track" },
];

const MEMBER_TABLE: Record<string, { table: string; time: string }> = {
  "SF-0001": { table: "Window 4", time: "19:45" },
  "SF-0002": { table: "Bar 1", time: "20:00" },
  "SF-0003": { table: "Window 2", time: "20:15" },
  "SF-0004": { table: "Bar 3", time: "20:30" },
};

// Seed each member with a plausible history so the tracker isn't empty.
type Stat = { visits: number; spendMinor: number; usedMinor: number; spends: number[] };
function seedStats(): Record<string, Stat> {
  const out: Record<string, Stat> = {};
  for (const m of MEMBERS) {
    const o = ORDERS.find((x) => x.memberRef === m.ref)!;
    const base = checkTotals(o.lines, DISCOUNTS[o.discount]).totalMinor;
    const spends = [0.82, 1.05, 0.71, 1.18, 0.94, 1.0].map((f) => Math.round(base * f));
    out[m.ref] = {
      visits: m.plan === "Gold" ? 24 : 11,
      spendMinor: spends.reduce((a, b) => a + b, 0) + (m.plan === "Gold" ? 210_00 : 90_00),
      usedMinor: m.plan === "Gold" ? 62_00 : 18_00,
      spends,
    };
  }
  return out;
}

function orderForMember(ref: string): Order {
  return ORDERS.find((o) => o.memberRef === ref)!;
}

export function MemberJourney() {
  const [ref, inView] = useInView<HTMLDivElement>(0.3);
  const reduced = useReducedMotion();
  const run = inView && !reduced;
  const tick = useTick(1300, run);

  const stage = run ? tick % MEM_STAGES.length : MEM_STAGES.length - 1;
  const memberIdx = run ? Math.floor(tick / MEM_STAGES.length) % MEMBERS.length : 0;
  const member: Member = MEMBERS[memberIdx]!;
  const plan = PLANS[member.plan];
  const order = orderForMember(member.ref);
  const t = checkTotals(order.lines, DISCOUNTS[order.discount]);
  const seat = MEMBER_TABLE[member.ref]!;

  const [stats, setStats] = useState<Record<string, Stat>>(seedStats);
  const committedRef = useRef(-1);
  useEffect(() => {
    if (!run) return;
    if (stage === 2 && committedRef.current !== tick) {
      committedRef.current = tick;
      setStats((prev) => {
        const s = prev[member.ref]!;
        return {
          ...prev,
          [member.ref]: {
            visits: s.visits + 1,
            spendMinor: s.spendMinor + t.totalMinor,
            usedMinor: Math.min(plan.monthlyCreditMinor, s.usedMinor + Math.round(t.totalMinor * 0.1)),
            spends: [...s.spends.slice(-7), t.totalMinor],
          },
        };
      });
    }
  }, [stage, tick, run, member.ref, t.totalMinor, plan.monthlyCreditMinor]);

  const stat = stats[member.ref]!;
  const easedVisits = useEased(stat.visits, run);
  const easedSpend = useEased(stat.spendMinor, run);
  const creditPct = Math.round((stat.usedMinor / plan.monthlyCreditMinor) * 100);

  return (
    <div ref={ref} className="bg-white">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-[var(--ink)]">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[var(--brand-soft)] text-[10px] font-bold text-[var(--brand-strong)]">{initials(member)}</span>
          {memberName(member)}
          <span className="rounded-full bg-[var(--brand)] px-2 py-0.5 text-[10px] font-bold text-white">{plan.name}</span>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-wide text-[var(--muted)]">Visits</div>
          <div className="text-sm font-bold tabular-nums text-[var(--ink)]">{Math.round(easedVisits)}</div>
        </div>
      </div>

      <div className="px-5 py-5">
        <Pipeline stages={MEM_STAGES} active={stage} run={run} />

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <StageStack active={stage} panels={[
              <StageBody title="Checked in" icon="checkin">
                <Row k="Member" v={memberName(member)} />
                <Row k="Plan" v={`${plan.name} · ${plan.priceLabel}`} muted />
                <Row k="Seated" v={`${seat.time} · ${seat.table}`} muted />
                <Row k="Ref" v={member.ref} muted />
              </StageBody>
            ,
              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--brand-strong)]">Order placed</div>
                <OrderLines lines={order.lines} />
                <div className="mt-2 flex justify-between border-t border-[var(--border)] pt-2 font-semibold text-[var(--ink)]">
                  <span>Total</span><span className="tabular-nums">{fmt(t.totalMinor)}</span>
                </div>
              </div>
            ,
              <StageBody title="Profile updated" icon="track">
                <Row k="Visits" v={String(stat.visits)} accent />
                <Row k="Total spend" v={fmt(stat.spendMinor)} />
                <Row k="Avg / visit" v={fmt(Math.round(stat.spendMinor / stat.visits))} muted />
                <div className="mt-2">
                  <div className="mb-1 flex justify-between text-xs text-[var(--muted)]">
                    <span>{plan.name} credit used</span>
                    <span className="tabular-nums">{fmt(stat.usedMinor)} / {plan.priceLabel.replace("/mo", "")}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-3)]">
                    <div className="h-full rounded-full bg-[var(--brand)] transition-[width] duration-500" style={{ width: `${creditPct}%` }} />
                  </div>
                </div>
              </StageBody>
            ,
          ]} />

          {/* spend tracker */}
          <div className="rounded-xl border border-[var(--border)] bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Spend · recent visits</span>
              <span className="text-sm font-bold tabular-nums text-[var(--ink)]">{fmt(Math.round(easedSpend))}</span>
            </div>
            <BarGraph values={stat.spends} highlightLast={stage >= 2} />
            <div className="mt-2 flex justify-between text-[10px] text-[var(--muted)]">
              <span>each bar = one visit</span>
              <span className="tabular-nums">latest {fmt(stat.spends[stat.spends.length - 1]!)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ small parts ------------------------------ */

// The longest order in the seed data sets the row count for every order
// panel: shorter orders get invisible filler rows, so a panel's height never
// depends on which order is showing and the card never shifts as they cycle.
const MAX_ORDER_LINES = Math.max(...ORDERS.map((o) => o.lines.length));

function OrderLines({ lines }: { lines: Order["lines"] }) {
  const filler = Array.from({ length: Math.max(0, MAX_ORDER_LINES - lines.length) });
  return (
    <>
      {lines.map((l) => (
        <div key={l.name} className="flex justify-between py-0.5">
          <span className="text-[var(--ink)]"><span className="text-[var(--muted)] tabular-nums">{l.qty}×</span> {l.name}</span>
          <span className="tabular-nums text-[var(--muted)]">{fmt(l.qty * priceOf(l.name))}</span>
        </div>
      ))}
      {filler.map((_, i) => (
        <div key={`pad-${i}`} className="invisible flex justify-between py-0.5" aria-hidden>
          <span>&nbsp;</span>
        </div>
      ))}
    </>
  );
}

// Every stage panel is rendered at once, stacked in a single grid cell, with
// only the active one visible. The card is always as tall as its tallest
// stage, so the page never shifts as the stages cycle. The active panel is
// re-keyed when it becomes active so its entrance animation replays.
function StageStack({ active, panels }: { active: number; panels: React.ReactNode[] }) {
  return (
    <div className="grid rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4 text-sm">
      {panels.map((panel, i) => {
        const on = i === active;
        return (
          <div key={`${i}-${on ? "on" : "off"}`} style={{ gridArea: "1 / 1" }} className={on ? "stage-in" : "invisible"} aria-hidden={!on}>
            {panel}
          </div>
        );
      })}
    </div>
  );
}

function StageBody({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--brand-strong)]">
        <FlowIcon name={icon} className="h-3.5 w-3.5" />
        {title}
      </div>
      {children}
    </div>
  );
}

function Row({ k, v, accent, muted, big }: { k: string; v: string; accent?: boolean; muted?: boolean; big?: boolean }) {
  return (
    <div className={"flex justify-between py-0.5 " + (big ? "border-t border-[var(--border)] pt-2 mt-1 text-base font-bold text-[var(--ink)]" : "")}>
      <span className={accent ? "font-semibold text-[var(--brand-strong)]" : muted ? "text-[var(--muted)]" : "text-[var(--ink)]"}>{k}</span>
      <span className={"tabular-nums " + (accent ? "font-semibold text-[var(--brand-strong)]" : muted ? "text-[var(--muted)]" : "font-medium text-[var(--ink)]")}>{v}</span>
    </div>
  );
}
