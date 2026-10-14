"use client";

// Blueprint-style system map for the hero: the surfaces people use feed one
// synapse record, which drives the connections a venue runs on. Drawn twice
// (wide and tall) so it stays legible on phones; CSS shows one or the other.
// Hovering or focusing a box lights the paths in its `keys`; the hub lights
// everything. Styles live in globals.css under .sysmap.

import { useState } from "react";

type Node = { id: string; label: string; tag: string; short?: string; shortTag?: string; future?: boolean; keys: string[] };
type Box = { x: number; y: number; w: number; h: number };

// Where data enters. `keys` are the connections a surface mostly talks to, so
// hovering the till lights payments and webhooks, the door lights wallets and
// messaging, and so on.
const SURFACES: Node[] = [
  { id: "admin", label: "ADMIN", tag: "S-01 · BACK OFFICE, WEB", shortTag: "S-01", keys: ["accounting", "crm", "messaging"] },
  { id: "till", label: "TILL", tag: "S-02 · iPAD POS", shortTag: "S-02", keys: ["payments", "webhooks"] },
  { id: "kds", label: "KITCHEN DISPLAY", short: "KITCHEN", tag: "S-03 · THE PASS", shortTag: "S-03", keys: [] },
  { id: "foh", label: "FRONT OF HOUSE", short: "DOOR", tag: "S-04 · THE DOOR", shortTag: "S-04", keys: ["wallets", "messaging"] },
  { id: "portal", label: "MEMBER PORTAL", short: "PORTAL", tag: "S-05 · IN THE WORKS", shortTag: "S-05", future: true, keys: ["payments", "wallets"] },
  { id: "partner", label: "PARTNER APPS", short: "PARTNERS", tag: "S-06 · PUBLIC API, BUILDING", shortTag: "S-06", future: true, keys: ["webhooks"] },
];

// Where data goes. Every one of these is live except what the tag says.
const CONNECTIONS: Node[] = [
  { id: "payments", label: "PAYMENTS", tag: "C-01 · STRIPE · ADYEN", shortTag: "C-01", keys: ["till", "portal"] },
  { id: "wallets", label: "WALLET PASSES", short: "WALLETS", tag: "C-02 · APPLE · GOOGLE", shortTag: "C-02", keys: ["foh", "portal"] },
  { id: "messaging", label: "MESSAGING", tag: "C-03 · EMAIL · SMS · WHATSAPP", shortTag: "C-03", keys: ["admin", "foh"] },
  { id: "accounting", label: "ACCOUNTING", tag: "C-04 · XERO · QUICKBOOKS", shortTag: "C-04", keys: ["admin"] },
  { id: "crm", label: "CRM & BOOKINGS", short: "CRM SYNC", tag: "C-05 · SALESFORCE · SEVENROOMS", shortTag: "C-05", keys: ["admin"] },
  { id: "webhooks", label: "WEBHOOKS & API", short: "API", tag: "C-06 · YOUR SYSTEMS", shortTag: "C-06", keys: ["till", "partner"] },
];

// The modules inside the hub — the whole product, in the order a venue meets it.
const MODULES = [
  "CRM & membership",
  "Bookings & events",
  "POS, tills & payments",
  "Kitchen & printing",
  "Marketing & messaging",
  "Procurement",
  "Accounting",
  "Passes & loyalty",
  "Insights",
];

type Link = { d: string; keys: string; slow?: boolean };
type Layout = {
  viewBox: string;
  compact?: boolean;
  boxes: Record<string, Box>;
  hub: Box;
  links: Link[];
  /** Where the module rows start inside the hub, and their pitch. */
  rows: { x: number; y: number; step: number; size: number };
};

const mid = (b: Box) => ({ x: b.x + b.w / 2, y: b.y + b.h / 2 });

/* Wide: surfaces down the left, hub in the middle, connections down the right. */
function wideLayout(): Layout {
  const boxes: Record<string, Box> = {};
  SURFACES.forEach((n, i) => (boxes[n.id] = { x: 40, y: 56 + i * 88, w: 200, h: 56 }));
  // A touch wider than the left column so the longest tag ("SALESFORCE · SEVENROOMS") fits.
  CONNECTIONS.forEach((n, i) => (boxes[n.id] = { x: 744, y: 56 + i * 88, w: 216, h: 56 }));
  const hub: Box = { x: 385, y: 130, w: 230, h: 340 };
  const links: Link[] = [];
  SURFACES.forEach((n, i) => {
    const b = boxes[n.id]!;
    const entry = hub.y + 40 + i * 52;
    links.push({ d: `M${b.x + b.w} ${mid(b).y} H${300 + i * 14} V${entry} H${hub.x}`, keys: [n.id, ...n.keys].join(" "), slow: i % 2 === 1 });
  });
  CONNECTIONS.forEach((n, i) => {
    const b = boxes[n.id]!;
    const entry = hub.y + 40 + i * 52;
    links.push({ d: `M${hub.x + hub.w} ${entry} H${700 - i * 14} V${mid(b).y} H${b.x}`, keys: [n.id, ...n.keys].join(" "), slow: i % 2 === 0 });
  });
  return { viewBox: "0 0 1000 600", boxes, hub, links, rows: { x: hub.x + 22, y: hub.y + 78, step: 29, size: 12 } };
}

/* Tall: two rows of three above the hub, two rows of three below it. Top-row
   boxes leave by their right edge into the gap beside them so their paths
   clear the row beneath; the mirror happens under the hub. */
function tallLayout(): Layout {
  const W = 100, H = 48;
  const cols = [8, 134, 260];
  const gapX = [121, 247, 370];
  const boxes: Record<string, Box> = {};
  SURFACES.forEach((n, i) => (boxes[n.id] = { x: cols[i % 3]!, y: i < 3 ? 44 : 120, w: W, h: H }));
  CONNECTIONS.forEach((n, i) => (boxes[n.id] = { x: cols[i % 3]!, y: i < 3 ? 610 : 690, w: W, h: H }));
  const hub: Box = { x: 40, y: 300, w: 300, h: 262 };
  const links: Link[] = [];
  SURFACES.forEach((n, i) => {
    const b = boxes[n.id]!;
    const c = i % 3;
    const entryX = hub.x + 30 + i * 48;
    const lane = 212 + i * 11;
    const d = i < 3
      ? `M${b.x + b.w} ${mid(b).y} H${gapX[c]} V${lane} H${entryX} V${hub.y}`
      : `M${mid(b).x} ${b.y + b.h} V${lane} H${entryX} V${hub.y}`;
    links.push({ d, keys: [n.id, ...n.keys].join(" "), slow: i % 2 === 1 });
  });
  CONNECTIONS.forEach((n, i) => {
    const b = boxes[n.id]!;
    const c = i % 3;
    const entryX = hub.x + 30 + i * 48;
    const lane = 572 + i * 6;
    const d = i < 3
      ? `M${entryX} ${hub.y + hub.h} V${lane} H${mid(b).x} V${b.y}`
      : `M${entryX} ${hub.y + hub.h} V${lane} H${gapX[c]} V${mid(b).y} H${b.x + b.w}`;
    links.push({ d, keys: [n.id, ...n.keys].join(" "), slow: i % 2 === 0 });
  });
  return { viewBox: "0 0 380 760", compact: true, boxes, hub, links, rows: { x: hub.x + 18, y: hub.y + 66, step: 22, size: 11 } };
}

const LAYOUTS = [
  { name: "wide", layout: wideLayout() },
  { name: "tall", layout: tallLayout() },
];

/** Corner points of an orthogonal path, for the little joint dots. */
function joints(d: string): [number, number][] {
  const points: [number, number][] = [];
  let x = 0, y = 0;
  for (const m of d.matchAll(/([MHV])\s*(-?[\d.]+)(?:\s+(-?[\d.]+))?/g)) {
    const [, cmd, a, b] = m;
    if (cmd === "M") { x = +a!; y = +b!; continue; }
    if (cmd === "H") x = +a!; else y = +a!;
    points.push([x, y]);
  }
  return points.slice(0, -1);
}

export function SystemMap() {
  const [lit, setLit] = useState<string | null>(null);
  const tracing = lit !== null;
  const isLit = (keys: string) => lit === "hub" || (lit !== null && keys.split(" ").includes(lit));

  const nodeProps = (id: string) => ({
    tabIndex: 0,
    onMouseEnter: () => setLit(id),
    onFocus: () => setLit(id),
    onMouseLeave: () => setLit(null),
    onBlur: () => setLit(null),
  });

  return (
    <figure className={`sysmap${tracing ? " tracing" : ""}`}>
      {LAYOUTS.map(({ name, layout }) => (
        <svg
          key={name}
          className={`sysmap-${name}`}
          viewBox={layout.viewBox}
          role="img"
          aria-label="The admin, till, kitchen display, front of house, member portal and partner apps feed one synapse record, which drives payments, wallet passes, messaging, accounting, CRM and booking sync, and webhooks."
        >
          <defs>
            <pattern id={`sysgrid-minor-${name}`} width="20" height="20" patternUnits="userSpaceOnUse"><path className="grid-minor" d="M20 0H0V20" fill="none" /></pattern>
            <pattern id={`sysgrid-major-${name}`} width="100" height="100" patternUnits="userSpaceOnUse"><path className="grid-major" d="M100 0H0V100" fill="none" /></pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#sysgrid-minor-${name})`} />
          <rect width="100%" height="100%" fill={`url(#sysgrid-major-${name})`} />
          <text className="tag sheet" x="16" y="22">SYNAPSE · SYSTEM OVERVIEW · REV 02</text>

          {layout.links.map((l) => (
            <path key={"l" + l.d} className={`link${isLit(l.keys) ? " lit" : ""}`} d={l.d} />
          ))}
          {layout.links.map((l) => (
            <path key={"f" + l.d} className={`flow${l.slow ? " slow" : ""}${isLit(l.keys) ? " lit" : ""}`} d={l.d} />
          ))}
          {layout.links.flatMap((l) => joints(l.d)).map(([cx, cy], i) => (
            <circle key={i} className="joint" cx={cx} cy={cy} r="3.5" />
          ))}

          <g className="hub" {...nodeProps("hub")}>
            <rect x={layout.hub.x} y={layout.hub.y} width={layout.hub.w} height={layout.hub.h} />
            <rect className="core" x={layout.hub.x} y={layout.hub.y} width="6" height={layout.hub.h} />
            <text className="title" x={layout.hub.x + layout.hub.w / 2 + 3} y={layout.hub.y + 36}>SYNAPSE</text>
            <text className="tag" x={layout.hub.x} y={layout.hub.y - 9}>ONE RECORD · ONE REAL-TIME BUS</text>
            <line className="rule" x1={layout.hub.x + 18} x2={layout.hub.x + layout.hub.w - 18} y1={layout.hub.y + 52} y2={layout.hub.y + 52} />
            {MODULES.map((m, i) => (
              <g key={m} className="module">
                <circle cx={layout.rows.x} cy={layout.rows.y + i * layout.rows.step - 4} r="2.5" />
                <text x={layout.rows.x + 12} y={layout.rows.y + i * layout.rows.step} style={{ fontSize: layout.rows.size }}>{m}</text>
              </g>
            ))}
          </g>

          {[...SURFACES, ...CONNECTIONS].map((node) => {
            const box = layout.boxes[node.id]!;
            return (
              <g key={node.id} className={`node${node.future ? " future" : ""}${lit === node.id ? " lit" : ""}`} {...nodeProps(node.id)}>
                <rect x={box.x} y={box.y} width={box.w} height={box.h} />
                <text x={box.x + box.w / 2} y={box.y + box.h / 2 + 5}>{layout.compact ? node.short ?? node.label : node.label}</text>
                <text className="tag" x={box.x} y={box.y - 9}>{layout.compact ? node.shortTag ?? node.tag : node.tag}</text>
              </g>
            );
          })}
        </svg>
      ))}
      <figcaption>Hover a box to trace what it talks to. Dashed boxes are being built.</figcaption>
    </figure>
  );
}
