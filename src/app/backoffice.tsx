"use client";

// Back-office illustrations: a purchase order moving from "raised" to "matched
// against the supplier's invoice", and a sale moving from the till to the
// ledger. Both are built from the synapse seed (Ashgrove House, Fernhollow
// Cellars, the seeded check at Window 4) and the real money math in data.ts,
// so every reference, pack, price and VAT figure is one the product produces.
// Motion is gated on visibility and honours prefers-reduced-motion.

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion, useEased } from "./motion";
import { Pipeline, Row, StageBody, StageStack, useTick, type Stage } from "./flows";
import { MENU, ORDERS, DISCOUNTS, VAT_RATE, checkTotals, priceOf, fmt } from "./data";

// The demo club in apps/api/prisma/seed.ts. Invented, like every venue here.
const VENUE_NAME = "Ashgrove House";

/* ------------------------------ 1. procurement ---------------------------- */

// apps/api/prisma/seed.ts: Fernhollow Cellars' packs and the PO-0002 that
// waits for approval; the invoice/credit pair FC-INV-30152 / FC-DN-7804.
const PO = {
  number: "PO-0002",
  supplier: "Fernhollow Cellars",
  email: "trade@fernhollowcellars.example",
  raisedBy: "Priya Purchaser",
  lines: [
    { item: "House gin", pack: "Case 6 × 70cl", packs: 5, packPriceMinor: 7200 },
    { item: "Tonic water", pack: "Case 24 × 200ml", packs: 3, packPriceMinor: 1150 },
  ],
};
const DELIVERY = "FC-DN-7710";
const INVOICE = { number: "FC-INV-30152", tonicBilledMinor: 1210 }; // 60p a case over the PO
const CREDIT_NOTE = "FC-DN-7804";

const poSubtotal = PO.lines.reduce((a, l) => a + l.packs * l.packPriceMinor, 0);
const tonic = PO.lines[1]!;
const overMinor = tonic.packs * (INVOICE.tonicBilledMinor - tonic.packPriceMinor);

const PROC_STAGES: Stage[] = [
  { key: "order", label: "Order", icon: "po" },
  { key: "approve", label: "Approve", icon: "approve" },
  { key: "send", label: "Send", icon: "send" },
  { key: "receive", label: "Receive", icon: "truck" },
  { key: "invoice", label: "Invoice", icon: "invoice" },
  { key: "match", label: "Match", icon: "match" },
];

// The "Needs attention" queue: every notice is always laid out, so the card
// never changes height; what changes is whether each one is pending, open or
// cleared at the current stage.
const NOTICES: { text: string; opensAt: number; clearsAt: number }[] = [
  { text: `${PO.number} waiting for approval`, opensAt: 0, clearsAt: 2 },
  { text: `Delivery ${DELIVERY} to match`, opensAt: 3, clearsAt: 4 },
  { text: `${INVOICE.number} is ${fmt(overMinor)} over ${PO.number}`, opensAt: 4, clearsAt: 5 },
];

export function ProcurementFlow() {
  const [ref, inView] = useInView<HTMLDivElement>(0.3);
  const reduced = useReducedMotion();
  const run = inView && !reduced;
  const tick = useTick(1400, run);
  const stage = run ? tick % PROC_STAGES.length : PROC_STAGES.length - 1;

  // On order from the moment it is sent until it is signed for.
  const onOrder = useEased(stage >= 2 && stage < 3 ? poSubtotal : 0, run);

  return (
    <div ref={ref} className="bg-white">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-[var(--ink)]">
          <span className="h-2 w-2 rounded-full bg-[#12a150]" />
          {VENUE_NAME} · purchasing
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-wide text-[var(--muted)]">On order</div>
          <div className="text-sm font-bold tabular-nums text-[var(--ink)]">{fmt(Math.round(onOrder))}</div>
        </div>
      </div>

      <div className="px-5 py-5">
        <Pipeline stages={PROC_STAGES} active={stage} run={run} />

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <StageStack active={stage} panels={[
            <StageBody title={`Purchase order · ${PO.number}`} icon="po">
              {PO.lines.map((l) => (
                <Row key={l.item} k={`${l.packs} × ${l.item} · ${l.pack}`} v={fmt(l.packs * l.packPriceMinor)} muted />
              ))}
              <Row k="Before VAT" v={fmt(poSubtotal)} big />
              <p className="mt-2 text-xs text-[var(--muted)]">Raised by {PO.raisedBy} for {VENUE_NAME}, from the supplier&apos;s own pack catalogue.</p>
            </StageBody>,
            <StageBody title="Approval policy" icon="approve">
              <Row k="Rule" v="Over £250 needs a manager" muted />
              <Row k="Submitted" v={PO.raisedBy} muted />
              <Row k="Decision" v="Approved" accent />
              <p className="mt-2 text-xs text-[var(--muted)]">The approver gets an email with the order in it and approves from there — no login hunt.</p>
            </StageBody>,
            <StageBody title={`Sent to ${PO.supplier}`} icon="send">
              <Row k="To" v={PO.email} muted />
              <Row k="On order" v={fmt(poSubtotal)} accent />
              <Row k="House gin" v="2 on hand · 5 on order" muted />
              <p className="mt-2 text-xs text-[var(--muted)]">Stock on order is netted against reorder points, so nothing gets ordered twice.</p>
            </StageBody>,
            <StageBody title={`Delivery ${DELIVERY}`} icon="truck">
              {PO.lines.map((l) => (
                <Row key={l.item} k={l.item} v={`${l.packs} of ${l.packs} cases`} muted />
              ))}
              <Row k="Stock" v="Updated on signature" accent />
              <p className="mt-2 text-xs text-[var(--muted)]">Short or wrong? Receive what arrived; the rest stays on order or is reversed.</p>
            </StageBody>,
            <StageBody title={`Invoice ${INVOICE.number}`} icon="invoice">
              <Row k={`5 × House gin @ ${fmt(PO.lines[0]!.packPriceMinor)}`} v={fmt(5 * PO.lines[0]!.packPriceMinor)} muted />
              <Row k={`3 × Tonic water @ ${fmt(INVOICE.tonicBilledMinor)}`} v={fmt(3 * INVOICE.tonicBilledMinor)} accent />
              <Row k={`PO price was ${fmt(tonic.packPriceMinor)}`} v={`+${fmt(overMinor)}`} muted />
              <p className="mt-2 text-xs text-[var(--muted)]">Matched line by line to {DELIVERY} and {PO.number}; the agreed price is named, not guessed.</p>
            </StageBody>,
            <StageBody title="Decision" icon="match">
              <Row k="Tonic water" v={`${fmt(overMinor)} over the order`} muted />
              <Row k="Approve, credit owed" v={fmt(overMinor)} accent />
              <Row k="Credit note expected" v={CREDIT_NOTE} muted />
              <p className="mt-2 text-xs text-[var(--muted)]">Approved invoices export to Xero as a CSV today; the live connector posts them with the daily journal.</p>
            </StageBody>,
          ]} />

          <div className="rounded-xl border border-[var(--border)] bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Needs attention</span>
              <span className="text-[10px] font-semibold text-[var(--muted)]">emailed to whoever can act</span>
            </div>
            <ul className="space-y-2">
              {NOTICES.map((n) => {
                const state = stage < n.opensAt ? "pending" : stage < n.clearsAt ? "open" : "done";
                return (
                  <li
                    key={n.text}
                    className="flex items-center gap-2.5 rounded-lg border px-3 py-2 text-xs transition-colors duration-500"
                    style={{
                      borderColor: state === "open" ? "#f59e0b" : state === "done" ? "#10b981" : "var(--border)",
                      background: state === "open" ? "#fffbeb" : state === "done" ? "#ecfdf5" : "var(--surface-2)",
                      color: state === "pending" ? "var(--muted)" : "var(--ink)",
                    }}
                  >
                    <span
                      className="flex h-4 w-4 flex-none items-center justify-center rounded-full text-[9px] font-bold text-white transition-colors duration-500"
                      style={{ background: state === "open" ? "#f59e0b" : state === "done" ? "#10b981" : "#d4d4d8" }}
                    >
                      {state === "done" ? "✓" : state === "open" ? "!" : ""}
                    </span>
                    <span className={state === "done" ? "line-through decoration-[#10b981]/60" : ""}>{n.text}</span>
                  </li>
                );
              })}
            </ul>
            <p className="mt-3 text-[10px] text-[var(--muted)]">Unmatched deliveries and invoices, orders and invoices awaiting approval — one queue, cleared in the order they arrived.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------- 2. ledger ------------------------------- */

// The seeded check at Window 4, split by sales group the way the accounting
// module does it: each menu item belongs to a sales group (here Food for the
// kitchen, Drinks for the bar), the discount is allocated across groups, and
// VAT is extracted from the inclusive price — never added on top.
const SALE = ORDERS[0]!;
const SALE_DISCOUNT = DISCOUNTS[SALE.discount]!;
const saleTotals = checkTotals(SALE.lines, SALE_DISCOUNT);
const CHECK_NUMBER = 129; // the webhook sample on this page uses the same check

type Group = { name: string; grossMinor: number; discountMinor: number; vatMinor: number; netMinor: number };

function splitByGroup(lines: typeof SALE.lines, discountMinor: number): Group[] {
  const gross = { Food: 0, Drinks: 0 };
  for (const l of lines) {
    const item = MENU.find((m) => m.name === l.name);
    const key = item?.station === "BAR" ? "Drinks" : "Food";
    gross[key] += l.qty * priceOf(l.name);
  }
  const total = gross.Food + gross.Drinks;
  const foodDiscount = total ? Math.round((discountMinor * gross.Food) / total) : 0;
  const out: Group[] = [];
  for (const [name, g, d] of [["Food", gross.Food, foodDiscount], ["Drinks", gross.Drinks, discountMinor - foodDiscount]] as const) {
    const after = g - d;
    const net = Math.round((after * 100) / (100 + VAT_RATE));
    out.push({ name, grossMinor: g, discountMinor: d, vatMinor: after - net, netMinor: net });
  }
  return out;
}
const SALE_GROUPS = splitByGroup(SALE.lines, saleTotals.discountMinor);

// The trading day: every seeded check, the way the daily source rolls them up.
const DAY = ORDERS.map((o) => checkTotals(o.lines, DISCOUNTS[o.discount]));
const dayGross = DAY.reduce((a, t) => a + t.subtotalMinor, 0);
const dayDiscount = DAY.reduce((a, t) => a + t.discountMinor, 0);
const dayTotal = DAY.reduce((a, t) => a + t.totalMinor, 0);
const DAY_GROUPS = ORDERS.map((o) => splitByGroup(o.lines, checkTotals(o.lines, DISCOUNTS[o.discount]).discountMinor));
const dayFoodNet = DAY_GROUPS.reduce((a, g) => a + g[0]!.netMinor, 0);
const dayDrinksNet = DAY_GROUPS.reduce((a, g) => a + g[1]!.netMinor, 0);
const dayNet = dayFoodNet + dayDrinksNet;
// VAT is what is left of the takings after the net sales lines, so the journal
// balances to the penny — the engine's own rounding line exists for the same
// reason and is expected to stay at zero.
const dayVat = dayTotal - dayNet;

const LEDGER_STAGES: Stage[] = [
  { key: "sale", label: "Sale", icon: "check" },
  { key: "record", label: "Sales record", icon: "track" },
  { key: "day", label: "Trading day", icon: "day" },
  { key: "journal", label: "Journal", icon: "journal" },
  { key: "ledger", label: "Ledger", icon: "ledger" },
];

const JOURNAL: { side: "Dr" | "Cr"; account: string; amountMinor: number }[] = [
  { side: "Dr", account: "Card clearing", amountMinor: dayTotal },
  { side: "Cr", account: "Food sales", amountMinor: dayFoodNet },
  { side: "Cr", account: "Drinks sales", amountMinor: dayDrinksNet },
  { side: "Cr", account: `VAT output ${VAT_RATE}%`, amountMinor: dayVat },
];
const journalDr = JOURNAL.filter((j) => j.side === "Dr").reduce((a, j) => a + j.amountMinor, 0);
const journalCr = JOURNAL.filter((j) => j.side === "Cr").reduce((a, j) => a + j.amountMinor, 0);

export function LedgerFlow() {
  const [ref, inView] = useInView<HTMLDivElement>(0.3);
  const reduced = useReducedMotion();
  const run = inView && !reduced;
  const tick = useTick(1400, run);
  const stage = run ? tick % LEDGER_STAGES.length : LEDGER_STAGES.length - 1;

  // The journal fills in line by line from the Journal stage on.
  const [shownLines, setShownLines] = useState(JOURNAL.length);
  const lastStage = useRef(stage);
  useEffect(() => {
    if (!run) { setShownLines(JOURNAL.length); return; }
    if (stage === 3 && lastStage.current !== 3) setShownLines(0);
    lastStage.current = stage;
    if (stage < 3) { setShownLines(0); return; }
    if (stage > 3) { setShownLines(JOURNAL.length); return; }
    const id = setInterval(() => setShownLines((n) => Math.min(JOURNAL.length, n + 1)), 280);
    return () => clearInterval(id);
  }, [stage, run]);
  const balanced = shownLines === JOURNAL.length;

  return (
    <div ref={ref} className="bg-white">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-[var(--ink)]">
          <span className="h-2 w-2 rounded-full bg-[#12a150]" />
          {VENUE_NAME} · books
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-wide text-[var(--muted)]">Posts automatically</div>
          <div className="text-sm font-bold tabular-nums text-[var(--ink)]">6h after close</div>
        </div>
      </div>

      <div className="px-5 py-5">
        <Pipeline stages={LEDGER_STAGES} active={stage} run={run} />

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <StageStack active={stage} panels={[
            <StageBody title={`Check ${CHECK_NUMBER} · ${SALE.table}`} icon="check">
              <Row k="Subtotal" v={fmt(saleTotals.subtotalMinor)} muted />
              <Row k={SALE_DISCOUNT.name} v={`−${fmt(saleTotals.discountMinor)}`} muted />
              <Row k="Total" v={fmt(saleTotals.totalMinor)} big />
              <Row k={`includes VAT @ ${VAT_RATE}%`} v={fmt(saleTotals.vatMinor)} muted />
            </StageBody>,
            <StageBody title="Sales record · SALE" icon="track">
              {SALE_GROUPS.map((g) => (
                <Row key={g.name} k={`${g.name} · net ${fmt(g.netMinor)}`} v={`VAT ${fmt(g.vatMinor)}`} muted />
              ))}
              <Row k="Discount, allocated" v={`−${fmt(saleTotals.discountMinor)}`} muted />
              <Row k="Signed" v="Append-only" accent />
              <p className="mt-2 text-xs text-[var(--muted)]">A refund adds a REFUND row; a reopen adds a REVERSAL. Nothing already written is edited.</p>
            </StageBody>,
            <StageBody title="Trading day · closes 05:00" icon="day">
              <Row k={`${ORDERS.length} checks · gross`} v={fmt(dayGross)} muted />
              <Row k="Discounts" v={`−${fmt(dayDiscount)}`} muted />
              <Row k="Takings" v={fmt(dayTotal)} big />
              <Row k={`of which VAT @ ${VAT_RATE}%`} v={fmt(dayVat)} muted />
              <p className="mt-2 text-xs text-[var(--muted)]">A check settled at 01:30 belongs to the night it was traded, not the calendar date.</p>
            </StageBody>,
            <StageBody title="Daily journal" icon="journal">
              {JOURNAL.map((j) => (
                <Row key={j.account} k={`${j.side} ${j.account}`} v={fmt(j.amountMinor)} muted={j.side === "Cr"} />
              ))}
              <Row k="Net sales" v={fmt(dayNet)} accent />
              <p className="mt-2 text-xs text-[var(--muted)]">Gross sales and discount lines, through clearing accounts; card payouts post as bank deposits.</p>
            </StageBody>,
            <StageBody title="Posted to Xero" icon="ledger">
              <Row k="Connector" v="Xero · QuickBooks · file" muted />
              <Row k="Tracking" v={VENUE_NAME} muted />
              <Row k="Status" v="Posted" accent />
              <p className="mt-2 text-xs text-[var(--muted)]">A late change after posting raises an adjusting journal. Every account is mapped once, in the admin, and validated against your chart.</p>
            </StageBody>,
          ]} />

          <div className="rounded-xl border border-[var(--border)] bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Journal lines</span>
              <span
                className="flex items-center gap-1 text-[10px] font-semibold transition-colors duration-500"
                style={{ color: balanced ? "#12a150" : "var(--muted)" }}
              >
                <span className="h-1.5 w-1.5 rounded-full transition-colors duration-500" style={{ background: balanced ? "#12a150" : "var(--border)" }} />
                {balanced ? "Dr = Cr" : "building"}
              </span>
            </div>
            <ul className="space-y-1.5 text-xs">
              {JOURNAL.map((j, i) => {
                const on = i < shownLines;
                return (
                  <li
                    key={j.account}
                    className={`flex items-center justify-between rounded-lg px-3 py-1.5 transition-opacity duration-300 ${j.side === "Dr" ? "bg-[var(--brand-soft)]" : "bg-[var(--surface-2)]"}`}
                    style={{ opacity: on ? 1 : 0.25 }}
                  >
                    <span className="text-[var(--ink)]"><span className="mr-1.5 font-bold tabular-nums text-[var(--brand-strong)]">{j.side}</span>{j.account}</span>
                    <span className="tabular-nums font-medium text-[var(--ink)]">{fmt(j.amountMinor)}</span>
                  </li>
                );
              })}
            </ul>
            <div className="mt-3 flex justify-between border-t border-[var(--border)] pt-2 text-xs font-semibold tabular-nums text-[var(--ink)]">
              <span>Dr {fmt(journalDr)}</span>
              <span>Cr {fmt(journalCr)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
