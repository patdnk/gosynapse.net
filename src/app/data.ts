// Real product data for the marketing illustrations — mirrored from the seed
// catalogue in the (private) synapse repo, so nothing shown is invented.
// Money math mirrors synapse's check-totals domain logic: menu prices are
// VAT-INCLUSIVE (UK hospitality convention), the check total is subtotal minus
// discounts, and VAT is EXTRACTED from the inclusive total (not added on top).

export const VENUE = {
  location: "Main Floor",
  currency: "GBP",
} as const;

export const VAT_RATE = 20; // "Standard VAT", seed.ts

export type MenuItem = {
  name: string;
  priceMinor: number;
  course: "STARTER" | "MAIN" | "DESSERT" | "DRINK";
  station: "KITCHEN" | "BAR" | "COLD";
};

// The "All Day" menu, priced exactly as seeded.
export const MENU: MenuItem[] = [
  { name: "Classic Burger", priceMinor: 1450, course: "MAIN", station: "KITCHEN" },
  { name: "Bacon Double", priceMinor: 1850, course: "MAIN", station: "KITCHEN" },
  { name: "Chicken Burger", priceMinor: 1350, course: "MAIN", station: "KITCHEN" },
  { name: "Margherita Pizza", priceMinor: 1250, course: "MAIN", station: "KITCHEN" },
  { name: "Fries", priceMinor: 450, course: "MAIN", station: "KITCHEN" },
  { name: "Cheesy Fries", priceMinor: 600, course: "MAIN", station: "KITCHEN" },
  { name: "Side Salad", priceMinor: 500, course: "STARTER", station: "COLD" },
  { name: "Espresso", priceMinor: 280, course: "DRINK", station: "BAR" },
  { name: "Flat White", priceMinor: 380, course: "DRINK", station: "BAR" },
  { name: "Gin & Tonic", priceMinor: 950, course: "DRINK", station: "BAR" },
];

const MENU_BY_NAME = new Map(MENU.map((m) => [m.name, m]));
export function priceOf(name: string): number {
  return MENU_BY_NAME.get(name)?.priceMinor ?? 0;
}

export type Discount = { name: string; type: "PERCENT" | "FIXED"; value: number };
export const DISCOUNTS: Record<string, Discount> = {
  "Staff 20%": { name: "Staff 20%", type: "PERCENT", value: 2000 },
  "Member 10%": { name: "Member 10%", type: "PERCENT", value: 1000 },
  "£5 off": { name: "£5 off", type: "FIXED", value: 500 },
};

export type Plan = { name: string; priceLabel: string; monthlyCreditMinor: number; rollover: "RESET" | "ACCUMULATE" };
export const PLANS: Record<string, Plan> = {
  Gold: { name: "Gold", priceLabel: "£100/mo", monthlyCreditMinor: 10000, rollover: "RESET" },
  Silver: { name: "Silver", priceLabel: "£40/mo", monthlyCreditMinor: 4000, rollover: "ACCUMULATE" },
};

export type Member = { ref: string; first: string; last: string; plan: "Gold" | "Silver" };
// SF-000x refs and names from seed.ts; plans from the loyalty programs seeded.
export const MEMBERS: Member[] = [
  { ref: "SF-0001", first: "Olivia", last: "Bennett", plan: "Gold" },
  { ref: "SF-0002", first: "James", last: "Whitmore", plan: "Silver" },
  { ref: "SF-0003", first: "Priya", last: "Shah", plan: "Gold" },
  { ref: "SF-0004", first: "Marcus", last: "Cole", plan: "Silver" },
];
export const memberName = (m: Member) => `${m.first} ${m.last}`;
export const initials = (m: Member) => `${m.first[0]}${m.last[0]}`;

// A few representative orders built entirely from real menu items, each tied to
// a real member and a real discount.
export type OrderLine = { name: string; qty: number };
export type Order = { memberRef: string; discount: keyof typeof DISCOUNTS; table: string; lines: OrderLine[] };
export const ORDERS: Order[] = [
  {
    memberRef: "SF-0001",
    discount: "Member 10%",
    table: "Window 4",
    lines: [
      { name: "Bacon Double", qty: 2 },
      { name: "Margherita Pizza", qty: 1 },
      { name: "Gin & Tonic", qty: 2 },
      { name: "Flat White", qty: 2 },
    ],
  },
  {
    memberRef: "SF-0003",
    discount: "Member 10%",
    table: "Window 2",
    lines: [
      { name: "Classic Burger", qty: 2 },
      { name: "Cheesy Fries", qty: 1 },
      { name: "Side Salad", qty: 1 },
      { name: "Espresso", qty: 2 },
    ],
  },
  {
    memberRef: "SF-0002",
    discount: "£5 off",
    table: "Bar 1",
    lines: [
      { name: "Chicken Burger", qty: 1 },
      { name: "Fries", qty: 2 },
      { name: "Gin & Tonic", qty: 3 },
    ],
  },
  {
    memberRef: "SF-0004",
    discount: "Staff 20%",
    table: "Bar 3",
    lines: [
      { name: "Bacon Double", qty: 1 },
      { name: "Classic Burger", qty: 1 },
      { name: "Flat White", qty: 2 },
    ],
  },
];

/* ------------------------------- money math ------------------------------ */
// Faithful to synapse's check-totals logic for a single VAT rate with an
// optional check-scoped discount (the common case for these illustrations).

const roundMinor = (v: number) => Math.sign(v) * Math.round(Math.abs(v));
const applyBps = (amountMinor: number, bps: number) => roundMinor((amountMinor * bps) / 10_000);

export type CheckTotals = {
  subtotalMinor: number;
  discountMinor: number;
  totalMinor: number;
  vatMinor: number;
  netMinor: number;
};

export function checkTotals(lines: OrderLine[], discount?: Discount): CheckTotals {
  const subtotalMinor = lines.reduce((a, l) => a + l.qty * priceOf(l.name), 0);
  let discountMinor = 0;
  if (discount && subtotalMinor > 0) {
    discountMinor =
      discount.type === "PERCENT"
        ? applyBps(subtotalMinor, discount.value)
        : Math.min(discount.value, subtotalMinor);
  }
  const totalMinor = subtotalMinor - discountMinor;
  const vatMinor = roundMinor((totalMinor * VAT_RATE) / (100 + VAT_RATE));
  return { subtotalMinor, discountMinor, totalMinor, vatMinor, netMinor: totalMinor - vatMinor };
}

export function fmt(amountMinor: number): string {
  const sign = amountMinor < 0 ? "-" : "";
  const abs = Math.abs(amountMinor);
  return `${sign}£${Math.floor(abs / 100)}.${String(abs % 100).padStart(2, "0")}`;
}

export const findMember = (ref: string) => MEMBERS.find((m) => m.ref === ref)!;
