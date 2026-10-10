"use client";

// Animated, self-contained SVG/CSS illustrations for the marketing site.
// Design intent: tiquo.co / kaluza.com — motion is ambient, slow and premium,
// never busy. Every animation is gated on visibility and honours
// prefers-reduced-motion (falls back to a representative static state).

import { type ReactNode } from "react";
import { useInView, useReducedMotion, useLoopStep, useEased } from "./motion";
import { VENUE, MEMBERS, ORDERS, DISCOUNTS, checkTotals, priceOf, fmt, findMember, memberName, initials } from "./data";

/* ----------------------------- browser frame ----------------------------- */

// A plain rounded card (no browser chrome), so animated illustrations sit in
// the page as first-class product surfaces.
export function Frame({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white text-left shadow-[0_40px_100px_-40px_rgba(11,18,32,0.4)]">
      {children}
    </div>
  );
}

/* --------------------------- 1. hero network ----------------------------- */

// The Synapse mark, animated: signals travel out from the hub along each spoke,
// nodes breathe as they arrive. Ambient background piece — deliberately faint.
const NET_NODES = [
  { x: 110, y: 46, dx: 0, dy: -64, kind: "card" }, // top
  { x: 46, y: 110, dx: -64, dy: 0, kind: "card" }, // left
  { x: 174, y: 110, dx: 64, dy: 0, kind: "card" }, // right
  { x: 156, y: 64, dx: 46, dy: -46, kind: "solid" }, // NE
  { x: 64, y: 64, dx: -46, dy: -46, kind: "solid" }, // NW
  { x: 156, y: 156, dx: 46, dy: 46, kind: "solid" }, // SE
  { x: 64, y: 156, dx: -46, dy: 46, kind: "solid" }, // SW
] as const;

export function HeroNetwork({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 220" fill="none" aria-hidden className={className}>
      {/* edges */}
      <g stroke="var(--brand)" strokeLinecap="round">
        {NET_NODES.map((n, i) => (
          <line
            key={`e${i}`}
            x1={110}
            y1={110}
            x2={n.x}
            y2={n.y}
            strokeWidth={n.kind === "card" ? 2.4 : 1.6}
            strokeOpacity={n.kind === "card" ? 0.5 : 0.32}
            strokeDasharray={n.kind === "solid" ? "5 5" : undefined}
            className={n.kind === "solid" ? "net-edge" : undefined}
          />
        ))}
      </g>
      {/* arriving nodes */}
      {NET_NODES.map((n, i) => (
        <circle
          key={`n${i}`}
          cx={n.x}
          cy={n.y}
          r={n.kind === "card" ? 7 : 5}
          fill={n.kind === "card" ? "var(--brand)" : "var(--accent)"}
          className="net-node"
          style={{ ["--delay" as string]: `${(i * 3.4) / NET_NODES.length}s` }}
        />
      ))}
      {/* travelling signals */}
      {NET_NODES.map((n, i) => (
        <circle
          key={`s${i}`}
          cx={110}
          cy={110}
          r={3}
          fill="var(--accent)"
          className="net-signal"
          style={{
            ["--dx" as string]: `${n.dx}px`,
            ["--dy" as string]: `${n.dy}px`,
            ["--delay" as string]: `${(i * 3.4) / NET_NODES.length}s`,
          }}
        />
      ))}
      {/* hub */}
      <circle cx={110} cy={110} r={22} fill="var(--brand)" fillOpacity={0.12} className="pulse-ring" style={{ transformBox: "fill-box", transformOrigin: "center" }} />
      <circle cx={110} cy={110} r={12} fill="var(--brand)" />
      <circle cx={110} cy={110} r={5} fill="#fff" />
    </svg>
  );
}

/* -------------------------- 2. real-time sync ---------------------------- */

const SYNC_ROWS = [
  { name: "Admin", meta: "menu edited", icon: "insights" as const },
  { name: "Till · iPad", meta: "catalogue", icon: "pos" as const },
  { name: "Front-of-house", meta: "board", icon: "crm" as const },
];

export function SyncFlow() {
  const [ref, inView] = useInView<HTMLDivElement>(0.3);
  const reduced = useReducedMotion();
  const run = inView && !reduced;
  const liveStep = useLoopStep(3, 1400, run);
  const step = reduced ? 2 : liveStep;

  return (
    <div
      ref={ref}
      className="relative rounded-2xl border border-[var(--border)] bg-white p-6 shadow-[0_30px_70px_-36px_rgba(11,18,32,0.3)]"
    >
      {/* connector rail + travelling pulse down the left of the rows */}
      <div className="pointer-events-none absolute left-[34px] top-[42px] bottom-[86px] w-px bg-[var(--border)]">
        {run && (
          <span
            className="absolute -left-[3px] h-1.5 w-1.5 rounded-full bg-[var(--brand)] sync-travel"
            style={{ ["--dist" as string]: "112px" }}
          />
        )}
      </div>

      <div className="space-y-3">
        {SYNC_ROWS.map((s, i) => {
          const source = i === 0;
          const updated = i <= step; // 0 is always "source"; 1,2 light up in turn
          const active = source ? step === 0 : i === step;
          return (
            <div
              key={s.name}
              className="relative flex items-center gap-3 rounded-xl border bg-white px-4 py-3 transition-colors duration-500"
              style={{
                borderColor: active ? "var(--brand)" : "var(--border)",
                boxShadow: active ? "0 0 0 3px var(--brand-soft)" : "none",
              }}
            >
              <span
                className="relative flex h-8 w-8 flex-none items-center justify-center rounded-lg transition-colors duration-500"
                style={{
                  background: source ? "var(--brand)" : updated ? "var(--brand-soft)" : "var(--surface-2)",
                  color: source ? "#fff" : updated ? "var(--brand-strong)" : "var(--muted)",
                }}
              >
                {active && run && (
                  <span className="absolute inset-0 rounded-lg bg-[var(--brand)] opacity-30 pulse-ring" />
                )}
                <MiniIcon name={s.icon} />
              </span>
              <div className="flex-1">
                <div className="text-sm font-semibold text-[var(--ink)]">{s.name}</div>
                <div className="text-xs text-[var(--muted)]">{s.meta}</div>
              </div>
              {source ? (
                <span className="flex items-center gap-1 text-xs font-semibold text-[var(--brand-strong)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand)]" />
                  source
                </span>
              ) : (
                <span
                  className="flex items-center gap-1 text-xs font-semibold transition-colors duration-500"
                  style={{ color: updated ? "#12a150" : "var(--muted)" }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full transition-colors duration-500"
                    style={{ background: updated ? "#12a150" : "var(--border)" }}
                  />
                  {updated ? "~1s" : "waiting"}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-[var(--ink-900)] px-4 py-3 text-xs font-semibold text-white/80">
        <MiniIcon name="bolt" className="h-3.5 w-3.5" />
        change event · broadcast to every subscriber
      </div>
    </div>
  );
}

/* --------------------------- 3. live floor plan -------------------------- */
// Faithful to the real admin floor plan (the synapse admin floor plan):
// grid canvas, zinc chair pips around each table, and status colours —
// emerald = Seated, amber = Upcoming (reservation), zinc/white = Open.

type TShape = "round" | "pill" | "rect" | "booth";
type TState = "open" | "seated" | "reserved";

// Server initials come from the real members (Olivia Bennett → OB, …).
const SERVERS = MEMBERS.map(initials); // ["OB","JW","PS","MC"]

type Table = { id: string; shape: TShape; x: number; y: number; w: number; h: number; seats: number };
const FTABLES: Table[] = [
  { id: "1", shape: "round", x: 58, y: 40, w: 82, h: 82, seats: 4 },
  { id: "2", shape: "round", x: 250, y: 30, w: 98, h: 98, seats: 4 },
  { id: "3", shape: "round", x: 468, y: 42, w: 82, h: 82, seats: 4 },
  { id: "4", shape: "pill", x: 60, y: 182, w: 214, h: 64, seats: 6 },
  { id: "5", shape: "round", x: 430, y: 156, w: 120, h: 120, seats: 8 },
  { id: "B1", shape: "booth", x: 58, y: 300, w: 120, h: 82, seats: 4 },
  { id: "B2", shape: "rect", x: 252, y: 302, w: 92, h: 82, seats: 4 },
  { id: "B3", shape: "round", x: 450, y: 308, w: 66, h: 66, seats: 2 },
  { id: "B4", shape: "round", x: 548, y: 308, w: 66, h: 66, seats: 2 },
];

// Per-table service data (covers seated, assigned server, reservation label).
const TMETA: Record<string, { cover: number; srv: string; resv?: string }> = {
  "1": { cover: 2, srv: SERVERS[0]! },
  "2": { cover: 4, srv: SERVERS[0]! },
  "3": { cover: 4, srv: SERVERS[1]! },
  "4": { cover: 4, srv: SERVERS[2]!, resv: "20:00 · 4p" },
  "5": { cover: 6, srv: SERVERS[1]! },
  B1: { cover: 2, srv: SERVERS[2]! },
  B2: { cover: 4, srv: SERVERS[3]! },
  B3: { cover: 2, srv: SERVERS[3]! },
  B4: { cover: 2, srv: SERVERS[3]! },
};

// Scenes: the room filling up over a service (table id → state).
const FSCENES: Record<string, TState>[] = [
  { "1": "open", "2": "seated", "3": "open", "4": "reserved", "5": "seated", B1: "seated", B2: "open", B3: "open", B4: "seated" },
  { "1": "seated", "2": "seated", "3": "open", "4": "reserved", "5": "seated", B1: "seated", B2: "open", B3: "seated", B4: "seated" },
  { "1": "seated", "2": "seated", "3": "seated", "4": "seated", "5": "seated", B1: "seated", B2: "seated", B3: "seated", B4: "seated" },
  { "1": "seated", "2": "open", "3": "seated", "4": "seated", "5": "seated", B1: "seated", B2: "seated", B3: "open", B4: "seated" },
];

const FCOLOR: Record<TState, { fill: string; stroke: string; num: string; sub: string }> = {
  open: { fill: "#ffffff", stroke: "#d4d4d8", num: "#52525b", sub: "#a1a1aa" }, // zinc
  seated: { fill: "#d1fae5", stroke: "#10b981", num: "#065f46", sub: "#047857" }, // emerald
  reserved: { fill: "#fef3c7", stroke: "#f59e0b", num: "#92400e", sub: "#b45309" }, // amber
};

function tableRx(shape: TShape, w: number, h: number): number {
  if (shape === "round") return Math.min(w, h) / 2;
  if (shape === "pill") return h / 2;
  return 8; // rect / booth body
}

// Chair-pip centres relative to the table's top-left (ported from the admin's
// seatOffsets: round shapes ring the ellipse, rects line the edges).
// Trig can differ in the last ULP between Node and the browser, which makes the
// SSR'd SVG coordinates serialise differently from the client's and breaks
// hydration. Rounding to 3dp is far finer than a pixel and is stable on both.
const r3 = (n: number) => Math.round(n * 1000) / 1000;

function seatOffsets(shape: TShape, seats: number, w: number, h: number) {
  const n = Math.max(0, Math.min(seats, 16));
  if (n === 0) return [] as { x: number; y: number }[];
  const gap = 12;
  const cx = w / 2;
  const cy = h / 2;
  if (shape === "round") {
    const rx = w / 2 + gap;
    const ry = h / 2 + gap;
    return Array.from({ length: n }, (_, i) => {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
      return { x: r3(cx + rx * Math.cos(a)), y: r3(cy + ry * Math.sin(a)) };
    });
  }
  if (shape === "booth") {
    // curved back only (top semicircle)
    const rx = w / 2 + gap;
    const ry = h / 2 + gap;
    return Array.from({ length: n }, (_, i) => {
      const a = Math.PI + (n === 1 ? Math.PI / 2 : (i * Math.PI) / (n - 1));
      return { x: r3(cx + rx * Math.cos(a)), y: r3(cy + ry * Math.sin(a)) };
    });
  }
  // rect / pill — distribute across edges by length
  const edges = [
    { len: w, place: (t: number) => ({ x: t * w, y: -gap }) },
    { len: w, place: (t: number) => ({ x: t * w, y: h + gap }) },
    { len: h, place: (t: number) => ({ x: -gap, y: t * h }) },
    { len: h, place: (t: number) => ({ x: w + gap, y: t * h }) },
  ];
  const total = edges.reduce((s, e) => s + e.len, 0);
  const counts = edges.map((e) => Math.floor((n * e.len) / total));
  let assigned = counts.reduce((a, b) => a + b, 0);
  const order = edges.map((_, i) => i).sort((a, b) => edges[b]!.len - edges[a]!.len);
  for (let k = 0; assigned < n; k++, assigned++) counts[order[k % order.length]!]!++;
  const out: { x: number; y: number }[] = [];
  edges.forEach((e, i) => {
    for (let j = 0; j < counts[i]!; j++) out.push(e.place((j + 1) / (counts[i]! + 1)));
  });
  return out;
}

// Booth path: curved back, flatter front (mirrors the admin's radius).
function boothPath(x: number, y: number, w: number, h: number) {
  const rt = Math.min(w, h) * 0.45;
  const rb = 10;
  return `M${x},${y + rt} Q${x},${y} ${x + rt},${y} L${x + w - rt},${y} Q${x + w},${y} ${x + w},${y + rt} L${x + w},${y + h - rb} Q${x + w},${y + h} ${x + w - rb},${y + h} L${x + rb},${y + h} Q${x},${y + h} ${x},${y + h - rb} Z`;
}

function FTableNode({ t, state }: { t: Table; state: TState }) {
  const c = FCOLOR[state];
  const meta = TMETA[t.id]!;
  const cx = t.x + t.w / 2;
  const cy = t.y + t.h / 2;
  const chairs = seatOffsets(t.shape, t.seats, t.w, t.h);
  const small = t.w < 74;
  const sub =
    state === "seated" ? `${meta.cover}/${t.seats} · ${meta.srv}` : state === "reserved" ? meta.resv! : `${t.seats} seats`;
  const trans = { transition: "fill 700ms ease, stroke 700ms ease" } as const;
  return (
    <g>
      {/* chairs */}
      {chairs.map((ch, i) => (
        <rect key={i} x={t.x + ch.x - 4.5} y={t.y + ch.y - 4.5} width={9} height={9} rx={2.5} fill="#d4d4d8" />
      ))}
      {/* table body */}
      {t.shape === "round" ? (
        <ellipse cx={cx} cy={cy} rx={t.w / 2} ry={t.h / 2} fill={c.fill} stroke={c.stroke} strokeWidth={2} style={trans} />
      ) : t.shape === "booth" ? (
        <path d={boothPath(t.x, t.y, t.w, t.h)} fill={c.fill} stroke={c.stroke} strokeWidth={2} style={trans} />
      ) : (
        <rect x={t.x} y={t.y} width={t.w} height={t.h} rx={tableRx(t.shape, t.w, t.h)} fill={c.fill} stroke={c.stroke} strokeWidth={2} style={trans} />
      )}
      {/* labels */}
      <text x={cx} y={cy - (small ? 1 : 3)} textAnchor="middle" fontSize={small ? 12 : 14} fontWeight={700} fill={c.num} style={{ transition: "fill 700ms ease" }}>
        {t.id}
      </text>
      <text x={cx} y={cy + (small ? 12 : 14)} textAnchor="middle" fontSize={small ? 9 : 11} fontWeight={600} fill={c.sub} style={{ transition: "fill 700ms ease" }}>
        {sub}
      </text>
    </g>
  );
}

function LegendDot({ fill, stroke, label }: { fill: string; stroke: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-[11px] text-[var(--muted)]">
      <span className="h-3 w-3 rounded" style={{ background: fill, border: `1.5px solid ${stroke}` }} />
      {label}
    </span>
  );
}

export function FloorPlanLive() {
  const [ref, inView] = useInView<HTMLDivElement>(0.3);
  const reduced = useReducedMotion();
  const run = inView && !reduced;
  const liveStep = useLoopStep(FSCENES.length, 2200, run);
  const idx = reduced ? FSCENES.length - 1 : liveStep;
  const scene = FSCENES[idx]!;

  const covers = useEased(
    FTABLES.reduce((sum, t) => (scene[t.id] === "seated" ? sum + TMETA[t.id]!.cover : sum), 0),
    run,
  );
  const busy = FTABLES.filter((t) => scene[t.id] !== "open").length;
  const occPct = useEased(Math.round((busy / FTABLES.length) * 100), run);

  return (
    <div ref={ref} className="bg-white">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-[var(--ink)]">
          <span className="h-2 w-2 rounded-full bg-[#12a150]" />
          {VENUE.location} · live service
        </div>
        <div className="flex items-center gap-5 text-xs">
          <span className="text-[var(--muted)]">Covers <b className="text-[var(--ink)] tabular-nums">{Math.round(covers)}</b></span>
          <span className="text-[var(--muted)]">Occupancy <b className="text-[var(--ink)] tabular-nums">{Math.round(occPct)}%</b></span>
        </div>
      </div>

      <div className="bg-white p-3">
        <div className="overflow-hidden rounded-xl border border-[#e4e4e7]" style={{ backgroundColor: "#fafafa", backgroundImage: "linear-gradient(#eef0f2 1px, transparent 1px), linear-gradient(90deg, #eef0f2 1px, transparent 1px)", backgroundSize: "26px 26px" }}>
          <svg viewBox="0 0 620 400" className="block w-full">
            {FTABLES.map((t) => (
              <FTableNode key={t.id} t={t} state={scene[t.id]!} />
            ))}
          </svg>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-[var(--border)] px-5 py-2.5">
        <LegendDot fill="#d1fae5" stroke="#10b981" label="Seated" />
        <LegendDot fill="#fef3c7" stroke="#f59e0b" label="Upcoming" />
        <LegendDot fill="#ffffff" stroke="#d4d4d8" label="Open" />
      </div>
    </div>
  );
}

/* ----------------------------- 4. live till ------------------------------ */

// A real order from the seed catalogue: Olivia Bennett (Gold), Member 10%.
const TILL_ORDER = ORDERS[0]!;
const TILL_MEMBER = findMember(TILL_ORDER.memberRef);
const TILL_DISCOUNT = DISCOUNTS[TILL_ORDER.discount];

export function TillLive() {
  const [ref, inView] = useInView<HTMLDivElement>(0.3);
  const reduced = useReducedMotion();
  const run = inView && !reduced;
  const L = TILL_ORDER.lines.length;
  // steps: 0 empty · 1..L reveal items · L+1 apply member discount · L+2 authorising · L+3 approved.
  const count = L + 4;
  const liveStep = useLoopStep(count, 850, run);
  const step = reduced ? count - 1 : liveStep;

  const visible = Math.min(step, L);
  const lines = TILL_ORDER.lines.slice(0, visible);
  const discountOn = step >= L + 1;
  const totals = checkTotals(lines, discountOn ? TILL_DISCOUNT : undefined);
  const easedTotal = useEased(totals.totalMinor, run);

  const paying = step === L + 2;
  const paid = step >= L + 3;

  return (
    <div ref={ref} className="bg-white">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-3">
        <div className="text-sm font-semibold text-[var(--ink)]">{TILL_ORDER.table} · {memberName(TILL_MEMBER)}</div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--brand-strong)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand)]" />
          {paid ? "settled" : paying ? "taking payment" : "open"}
        </div>
      </div>

      <div className="px-5 py-4">
        <div className="min-h-[150px] space-y-1.5">
          {lines.map((it) => (
            <div key={it.name} className="item-in flex items-center justify-between text-sm">
              <span className="text-[var(--ink)]">
                <span className="tabular-nums text-[var(--muted)]">{it.qty}×</span> {it.name}
              </span>
              <span className="tabular-nums font-medium text-[var(--ink)]">{fmt(it.qty * priceOf(it.name))}</span>
            </div>
          ))}
          {visible === 0 && <div className="pt-6 text-center text-sm text-[var(--muted)]">New check opened…</div>}
        </div>

        <div className="mt-3 space-y-1 border-t border-[var(--border)] pt-3 text-sm">
          <div className="flex justify-between text-[var(--muted)]">
            <span>Subtotal</span>
            <span className="tabular-nums">{fmt(totals.subtotalMinor)}</span>
          </div>
          {/* Always laid out, so the check doesn't grow when the discount lands. */}
          <div
            key={discountOn ? "on" : "off"}
            className={`flex justify-between font-medium text-[var(--brand-strong)] ${discountOn ? "item-in" : "invisible"}`}
            aria-hidden={!discountOn}
          >
            <span>{TILL_DISCOUNT.name}</span>
            <span className="tabular-nums">−{fmt(totals.discountMinor)}</span>
          </div>
          <div className="flex justify-between pt-1 text-base font-bold text-[var(--ink)]">
            <span>Total</span>
            <span className="tabular-nums">{fmt(Math.round(easedTotal))}</span>
          </div>
          <div className="flex justify-between text-xs text-[var(--muted)]">
            <span>includes VAT @ {20}%</span>
            <span className="tabular-nums">{fmt(totals.vatMinor)}</span>
          </div>
        </div>

        {/* tender state */}
        <div className="mt-4">
          {paid ? (
            <div className="item-in flex items-center justify-center gap-2 rounded-xl bg-[#e9f7ef] px-4 py-3 text-sm font-semibold text-[#12a150]">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="3"><path d="m5 12 5 5L20 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              Card approved · Visa ····4242
            </div>
          ) : (
            <div
              className="flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-colors duration-300"
              style={{
                background: paying ? "var(--brand)" : "var(--surface-2)",
                color: paying ? "#fff" : "var(--muted)",
              }}
            >
              {paying && run && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
              {paying ? "Contactless · authorising…" : "Tap, insert or swipe card"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* --------------------------- shared mini-icons --------------------------- */

function MiniIcon({ name, className = "h-4 w-4" }: { name: "insights" | "pos" | "crm" | "bolt"; className?: string }) {
  const p = { className, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (name) {
    case "insights": return <svg {...p}><path d="M4 20V10M10 20V4M16 20v-6M22 20H2" /></svg>;
    case "pos": return <svg {...p}><rect x="4" y="3" width="16" height="13" rx="2" /><path d="M8 20h8M12 16v4M8 7h8M8 11h5" /></svg>;
    case "crm": return <svg {...p}><circle cx="9" cy="8" r="3" /><path d="M4 20a5 5 0 0 1 10 0M16 11l2 2 4-4" /></svg>;
    case "bolt": return <svg {...p}><path d="M13 2 4 14h7l-1 8 9-12h-7Z" /></svg>;
  }
}
