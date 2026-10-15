// Synapse marketing / showcase landing page. Server component, self-contained
// (inline SVG, no external assets). Design language channels tiquo.co + kaluza.com:
// light, deep-navy ink, big bold headlines, generous whitespace, a teal/cyan
// accent, pill buttons, an integrations strip, a verticals grid and a "live in
// days" timeline.

import { DemoModal } from "./demo-modal";
import { VenueConfigurator } from "./venue-configurator";
import { Reveal } from "./reveal";
import { HeroNetwork, SyncFlow, FloorPlanLive, TillLive, Frame } from "./anim";
import { ProcurementFlow, LedgerFlow } from "./backoffice";
import { SystemMap } from "./sysmap";
import { RevenueFlow, MemberJourney, MemberTrail } from "./flows";
import { MarketingShowcase } from "./marketing";
import { ApiSection } from "./api";

/* ---------------------------------- data --------------------------------- */

const NAV = [
  { label: "Modules", href: "#products" },
  { label: "Marketing", href: "#marketing" },
  { label: "Billing", href: "#billing" },
  { label: "Back office", href: "#backoffice" },
  { label: "Hardware", href: "#hardware" },
  { label: "API", href: "#api" },
  { label: "Solutions", href: "#solutions" },
  { label: "Security", href: "#security" },
  { label: "Roadmap", href: "#roadmap" },
];

// Footer links resolve to real sections on the page — no dead "#" anchors.
const FOOTER_COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Product",
    links: [
      { label: "CRM", href: "#products" },
      { label: "POS system", href: "#products" },
      { label: "Till", href: "#products" },
      { label: "Kitchen display", href: "#products" },
      { label: "Marketing & messaging", href: "#marketing" },
      { label: "Membership billing", href: "#billing" },
      { label: "Wallet passes", href: "#passes" },
      { label: "Hardware", href: "#hardware" },
      { label: "Procurement", href: "#backoffice" },
      { label: "Accounting & house accounts", href: "#backoffice" },
      { label: "Payments & insights", href: "#products" },
    ],
  },
  {
    title: "Solutions",
    links: [
      { label: "Restaurants", href: "#solutions" },
      { label: "Bars", href: "#solutions" },
      { label: "Members' clubs", href: "#solutions" },
      { label: "Hotels", href: "#solutions" },
      { label: "Events", href: "#solutions" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Platform", href: "#platform" },
      { label: "API", href: "#api" },
      { label: "Security", href: "#security" },
      { label: "Roadmap", href: "#roadmap" },
      { label: "Book a demo", href: "#demo" },
    ],
  },
];

/**
 * One product, synapse, made of modules a venue switches on to suit its
 * business. CRM is the members'-club module; POS is the trading module and is
 * itself three pieces — the back-office system, the till on the floor and the
 * kitchen display at the pass — because that is how a venue installs it.
 * Payments and insights come with whichever modules you run.
 */
const PRODUCT_LINES: {
  key: string;
  name: string;
  tagline: string;
  desc: string;
  icon: string;
  parts: { name: string; desc: string; icon: string }[];
  includes: string[];
}[] = [
  {
    key: "crm",
    name: "CRM",
    tagline: "For members' clubs",
    desc: "The whole member lifecycle — from application to renewal — and the door that greets them.",
    icon: "crm",
    parts: [
      { name: "Members", desc: "Applications and vetting, plans and recurring dues, member records and cases.", icon: "member" },
      { name: "Reception", desc: "The front-of-house app on the door: who's in, check-in by NFC tap or QR scan, one-tap check-out, guests and cloakroom.", icon: "frame" },
      { name: "Engagement", desc: "Bookings, events and tickets, Apple & Google wallet passes, loyalty credit — and the emails, texts and WhatsApp messages that follow up on all of it.", icon: "pass" },
    ],
    includes: ["Billing with credit notes & freezes", "Direct Debit house accounts", "Email & SMS journeys", "Salesforce, SevenRooms, PeopleVine", "CRM reporting: growth, attendance, churn"],
  },
  {
    key: "pos",
    name: "POS",
    tagline: "For anywhere that trades",
    desc: "One system to configure, a till to take the order, a screen to cook it. Pair it with CRM or run it alongside whichever modules the venue needs.",
    icon: "pos",
    parts: [
      { name: "System", desc: "The back office: catalogue, recipes, stock and purchasing, floor plans and revenue centres, routing, discounts, reports.", icon: "sliders" },
      { name: "Till", desc: "The iPad on the floor: checks, splits, discounts, tips and card-present payments — online first, with an offline option.", icon: "pos" },
      { name: "KDS", desc: "The kitchen display at the pass: a screen per station with course pacing, hold-and-fire and an expo view, paired like a till, bumped when food leaves.", icon: "printer" },
    ],
    includes: ["Card-present terminals", "Stripe & Adyen, marketplace payouts", "Sales insights: covers, spend, service"],
  },
];

const OPERATIONS = [
  { title: "Real-time data engine", desc: "Every write broadcasts a change. Admin, floor and till catch up in about a second.", icon: "bolt" },
  { title: "Role-based control", desc: "Owners, managers, waiters and finance each see exactly what they should.", icon: "shield" },
  { title: "Online first, offline optional", desc: "Cloud by default. An on-premises server and a sync step keep a venue trading through an outage.", icon: "cloud" },
  { title: "Configurable per venue", desc: "Turn modules, tipping, receipts and journeys on or off. The configurator gates the rest.", icon: "sliders" },
];

const FEATURES = [
  { title: "Floor plans & table service", desc: "Design rooms, route orders by station, move tables and follow service in real time.", icon: "floor" },
  { title: "Bookings & availability", desc: "Member → table → date with live availability, covers and spend on every reservation.", icon: "calendar" },
  { title: "Membership & billing", desc: "Plans and recurring dues with VAT invoices, credit notes, plan changes and freezes — member status driven by payment state.", icon: "member" },
  { title: "Wallet passes", desc: "Design Apple & Google passes per organisation, then send each holder one link that opens the right wallet.", icon: "pass" },
  { title: "Kitchen & printing", desc: "KDS routing, ESC/POS chits and receipts, and a compliant electronic journal for every sale.", icon: "printer" },
  { title: "Events & cloakroom", desc: "Ticketing, invoices and QR cloakroom tags — the extras a members' club runs on.", icon: "ticket" },
  { title: "Email, SMS & WhatsApp", desc: "Booking and ticket confirmations, reminders the day before, and journeys you draw — wait, branch, follow up if unopened.", icon: "mail" },
  { title: "Audiences & campaigns", desc: "Segments that keep themselves current — VIPs not seen in a month, everyone booked this week — and campaigns from your own designed templates.", icon: "flow" },
  { title: "Consent & deliverability", desc: "Opt-ins recorded with their wording, one-click unsubscribe and STOP, quiet hours, and sending from your own domain.", icon: "consent" },
  { title: "Purchasing & suppliers", desc: "Stock per site, supplier pack catalogues, purchase orders with an approval policy, receiving, and invoices matched line by line.", icon: "catalogue" },
  { title: "Accounting export", desc: "Signed sales records by sales group and VAT, a daily journal, and connectors for Xero and QuickBooks with your own account mapping.", icon: "insights" },
  { title: "House accounts", desc: "A ledger per member: credit limits, charges and payments, with GoCardless Direct Debit mandates set up by link or at reception.", icon: "payments" },
];

const BACKOFFICE_POINTS = [
  { title: "Procurement", desc: "Stock per site and a pack catalogue per supplier. Purchase orders go through your approval policy and straight to the supplier; deliveries update stock on signature; invoices match line by line, with credits tracked and a Xero CSV ready.", icon: "catalogue" },
  { title: "Accounting export", desc: "Every sale is a signed, append-only record by sales group and VAT treatment, on the trading day it belongs to. Connect Xero or QuickBooks, map your accounts once, and journals post automatically after a grace period.", icon: "insights" },
  { title: "House accounts", desc: "A ledger per member with a credit limit, charges and payments, so a tab at the bar and a ticket for Friday land in one place. Direct Debit mandates run through GoCardless; collections and statements are next.", icon: "payments" },
];

const MARKETING_POINTS = [
  { title: "Templates you design", desc: "Drag-and-drop email in your own branding, SMS with a live character count, merge fields from the member record.", icon: "mail" },
  { title: "Audiences that keep up", desc: "VIPs not seen in a month, everyone with a ticket for Friday — segments update themselves as members visit, book and buy.", icon: "member" },
  { title: "Journeys with a plan B", desc: "Wait, branch and split. Follow up by text if the email goes unopened, send the wallet pass by WhatsApp and fall back to SMS without an opt-in.", icon: "flow" },
];

// Membership billing: what the screenshots in #billing show, in the order a
// finance team meets it. All of it is on main except where a line says next.
const BILLING_POINTS = [
  { title: "VAT on every line", desc: "Plans and events carry their own VAT treatment and rate, so an invoice that mixes them still adds up for your accountant.", icon: "insights" },
  { title: "Credit notes and refunds", desc: "Credit any part of a paid invoice back to the card that paid it or to the member's account, with a numbered PDF.", icon: "payments" },
  { title: "Plan changes", desc: "Now, with the unused days credited and the new plan charged pro rata, or at renewal with nothing to work out.", icon: "flow" },
  { title: "Freezes", desc: "A date range or until resumed, an optional holding fee, a maximum per plan. Billing restarts on its own.", icon: "calendar" },
  { title: "House accounts", desc: "One ledger per member with a credit limit: dues, bar tabs and bookings signed to it, payments and credits against it.", icon: "member" },
  { title: "Direct Debit", desc: "GoCardless mandates set up from a link or a QR at reception. Collections and statements are next.", icon: "consent" },
];

const PASS_POINTS = [
  { title: "One design per pass type", desc: "Membership, loyalty card, day pass and guest pass, each previewed as Apple and Google will draw it." },
  { title: "One link per holder", desc: "The same URL opens the .pkpass on an iPhone and Google's save flow on Android. A desktop shows a QR to scan." },
  { title: "Expiring, revocable links", desc: "Links last seven days and can be revoked; erasing a member revokes theirs." },
  { title: "Kept up to date", desc: "Tier and loyalty credit change on the pass when they change on the record; the barcode checks the member in at the door." },
];

// Devices synapse runs on. synapse does not sell hardware (it can broker it
// on request): these are what we advise, each true to the code — the till is an Expo app, the kitchen display
// and front of house are web apps, printers speak ESC/POS over the network,
// card readers pair through Stripe Terminal or Adyen's Terminal API, and the
// door reads NFC wallet passes through a keyboard-mode VTAP reader.
const HARDWARE: { title: string; icon: string; runs: string; desc: string; picks: string[] }[] = [
  {
    title: "Till",
    icon: "tablet",
    runs: "iPad · Android tablet",
    desc: "Runs on an iPad or an Android tablet. Landscape, full screen, paired to its venue with a one-time code.",
    picks: ["Any recent iPad", "Android tablets, 10\" and up", "A stand or enclosure that suits the bar"],
  },
  {
    title: "Kitchen display",
    icon: "monitor",
    runs: "Any screen with a browser",
    desc: "Runs on a wall-mounted TV with a mini PC, a touchscreen, or a tablet. Paired once, then it comes back on its own.",
    picks: ["Touchscreens for bumping", "TV + mini PC for the wall", "Tablets for small sections"],
  },
  {
    title: "Front of house",
    icon: "frame",
    runs: "PC · mobile · tablet",
    desc: "Runs on a PC (with a camera added), a phone or a tablet. The device's own camera scans QR passes, so no extra kit is needed to start; Bluetooth or USB cameras can be attached for QR reading too.",
    picks: ["iPad or Android tablet", "A phone at the door", "A PC with a USB camera"],
  },
  {
    title: "Door readers",
    icon: "nfc",
    runs: "NFC · QR",
    desc: "Members tap their Apple or Google Wallet pass on an NFC reader that types the code into the door board — USB on a laptop, Bluetooth on a tablet, no drivers. Any keyboard-mode scanner works the same way.",
    picks: ["VTAP NFC readers", "USB or Bluetooth QR scanners"],
  },
  {
    title: "Printers & cash drawers",
    icon: "printer",
    runs: "Network ESC/POS",
    desc: "Receipts and kitchen chits go to thermal printers on the venue network, routed by station. The cash drawer opens through the receipt printer.",
    picks: ["Epson TM and Bixolon SRP series", "80 mm or 58 mm paper", "Ethernet or Wi-Fi"],
  },
  {
    title: "Card readers",
    icon: "reader",
    runs: "Stripe · Adyen",
    desc: "Card-present payments on smart readers paired from the admin and driven from the till — chip, contactless, Apple Pay and Google Pay, with the tip added on the till first.",
    picks: ["Stripe: WisePOS E, Reader S700", "Adyen: V400m, S1F2 and other terminals"],
  },
];

// What landed on main most recently, newest first. Trim from the bottom.
const SHIPPED = [
  "Direct Debit mandates through GoCardless",
  "Credit notes, refunds, plan changes and freezes",
  "Daily sales and billing journals",
  "Pass links that open the right wallet",
  "Xero and QuickBooks connectors",
  "House-account ledger with credit limits",
  "WhatsApp as a messaging channel",
  "Supplier invoices matched to deliveries",
];

// Each item says where it stands: shipped, being built now, or planned (no status).
type RoadmapStatus = "shipped" | "building";

const ROADMAP: { phase: string; why: string; items: { title: string; desc: string; status?: RoadmapStatus }[] }[] = [
  {
    phase: "Foundations",
    why: "Reach members without a staff member holding the phone.",
    items: [
      { title: "WhatsApp and pass delivery", desc: "WhatsApp is live as a channel, and each holder gets a link that opens the right wallet. Next: sending it from the profile with a WhatsApp → SMS → email fallback, then issuing to a whole plan.", status: "building" },
      { title: "Billing adjustments", desc: "VAT invoice lines, credit notes and refunds, plan changes now or at renewal, and freezes with holding fees are live. Next: a fixed billing day per plan.", status: "building" },
      { title: "Accounting export", desc: "Xero and QuickBooks connectors, account mapping and the daily sales and billing journals are live, with VAT reported by treatment. Supplier bills and card payouts follow.", status: "building" },
      { title: "Procurement", desc: "Per-site stock, supplier packs, purchase orders with approval, receiving, invoice matching and a needs-attention queue.", status: "shipped" },
    ],
  },
  {
    phase: "Member-facing",
    why: "A home for the member, deep-linked from their wallet pass.",
    items: [
      { title: "Member portal", desc: "Book, buy tickets, see the bill and top up credit — a web app, no app store." },
      { title: "Passwordless sign-in", desc: "A magic link by SMS or email." },
      { title: "Bookings & events v2", desc: "Ticket tiers, holds, waitlists, deposits and no-show fees. The services layer is in; tiers are next.", status: "building" },
      { title: "Member accounts & Direct Debit", desc: "The house-account ledger and GoCardless mandates are live — set up from a link or a QR at reception. Collections and statements follow, then dues and bookings charged to the account.", status: "building" },
      { title: "Tap to Pay", desc: "Any staff phone as a card terminal; pay at the table." },
    ],
  },
  {
    phase: "Developer-facing",
    why: "Partners and a venue's own apps build on the same data.",
    items: [
      { title: "Public REST API", desc: "/public/v1 foundation built — scoped keys, idempotency, cursor paging and rate limits per key. Members, bookings, events and checks next.", status: "building" },
      { title: "GraphQL read plane", desc: "Member 360, a booking with its spend, an event with its tickets — one query.", status: "building" },
      { title: "Webhooks v2", desc: "Many endpoints per club, signed envelopes, retries and replay.", status: "building" },
      { title: "Docs, sandbox, SDKs", desc: "Everything a partner needs to ship without a call." },
    ],
  },
  {
    phase: "Intelligence & trust",
    why: "Answers from the venue's own data, and the certificates buyers ask for.",
    items: [
      { title: "AI insights", desc: "Questions in plain language, automatic reports and forecasts." },
      { title: "Kitchen display", desc: "Course pacing, hold-and-fire and an expo view.", status: "shipped" },
      { title: "SOC 2 Type II, then ISO 27001", desc: "Most controls already exist in code; the programme does the rest." },
    ],
  },
];

const PAYMENTS = ["Visa", "Mastercard", "Amex", "Apple Pay", "Google Pay", "Card-present"];

// Split by what is actually built. A prospect reads an integrations list as a
// commitment, so anything not written yet is labelled as such rather than
// quietly implying parity.
const PAYMENT_PROVIDERS = [
  {
    name: "Stripe",
    status: "live" as const,
    detail: "Online and card-present via Stripe Terminal, with tips and refunds.",
  },
  {
    name: "Adyen",
    status: "live" as const,
    detail: "Adyen Terminal API for card-present, plus marketplace payouts.",
  },
  {
    name: "Your acquirer",
    status: "roadmap" as const,
    detail: "Providers sit behind one interface, so adding another is an adapter, not a rebuild.",
  },
];

const PARTNER_INTEGRATIONS = [
  {
    name: "API gateway",
    status: "live" as const,
    detail: "An extensive, versioned REST API with webhooks on every change, so your own desktop and mobile apps — and any upstream system — build on the same data the tills run on.",
  },
  {
    name: "Salesforce",
    status: "live" as const,
    detail: "Members and applicants both ways, mapped onto your own objects.",
  },
  {
    name: "SevenRooms",
    status: "live" as const,
    detail: "Checks export in an Oracle Simphony-shaped document, with webhooks on every change.",
  },
  {
    name: "Apple & Google Wallet",
    status: "live" as const,
    detail: "Member passes issued and updated from the platform.",
  },
  {
    name: "Identity provider",
    status: "live" as const,
    detail: "Secure sign-in built on current standards — OAuth2, OpenID Connect and enforced MFA — with SSO for your team.",
  },
  {
    name: "Xero & QuickBooks",
    status: "live" as const,
    detail: "Daily sales and billing journals posted to your own account mapping, or as a file.",
  },
  {
    name: "GoCardless",
    status: "live" as const,
    detail: "Direct Debit mandates for house accounts, set up from a link or a QR at reception.",
  },
  {
    name: "Email, SMS & WhatsApp",
    status: "live" as const,
    detail: "Amazon SES for email, Twilio for SMS and WhatsApp — from your own domain and number.",
  },
  {
    name: "Tripleseat",
    status: "roadmap" as const,
    detail: "Events and banqueting — same check-export shape as SevenRooms.",
  },
];

const TIMELINE = [
  { day: "Day 1", title: "Import & configure", desc: "Load your menu, rooms and members. Switch on the modules the venue needs." },
  { day: "Day 3", title: "Train the floor", desc: "Tills, floor plan and front-of-house board — the team is running live in a shift." },
  { day: "Day 5", title: "Go live", desc: "Payments connected, passes issued, insights flowing. Open the doors." },
];

const SECURITY = [
  "MFA / OAuth2 secure authentication",
  "Device pairing with instant revocation",
  "Append-only, signed sales records",
  "AES-256-GCM secrets at rest",
  "SOC 2 audit trail",
  "GDPR data-subject tooling",
  "Rate limiting & security headers",
  "SCIM 2.0 provisioning",
];

/* --------------------------------- icons --------------------------------- */

function Icon({ name, className = "h-6 w-6" }: { name: string; className?: string }) {
  const p = { className, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (name) {
    case "pos": return <svg {...p}><rect x="4" y="3" width="16" height="13" rx="2" /><path d="M8 20h8M12 16v4M8 7h8M8 11h5" /></svg>;
    case "catalogue": return <svg {...p}><path d="M4 5a2 2 0 0 1 2-2h9l5 5v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" /><path d="M14 3v5h5M8 13h8M8 17h6" /></svg>;
    case "crm": return <svg {...p}><circle cx="9" cy="8" r="3" /><path d="M4 20a5 5 0 0 1 10 0M16 11l2 2 4-4" /></svg>;
    case "payments": return <svg {...p}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18M7 15h4" /></svg>;
    case "insights": return <svg {...p}><path d="M4 20V10M10 20V4M16 20v-6M22 20H2" /></svg>;
    case "floor": return <svg {...p}><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="4" rx="1.5" /><rect x="3" y="14" width="4" height="7" rx="1.5" /><circle cx="16" cy="15" r="4" /></svg>;
    case "calendar": return <svg {...p}><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M3 9h18M8 2v4M16 2v4" /></svg>;
    case "member": return <svg {...p}><circle cx="12" cy="8" r="3.5" /><path d="M5 20a7 7 0 0 1 14 0" /></svg>;
    case "pass": return <svg {...p}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 9h18M7 14h6M16 13v2" /></svg>;
    case "printer": return <svg {...p}><path d="M6 9V3h12v6" /><rect x="4" y="9" width="16" height="7" rx="2" /><path d="M8 16h8v5H8z" /></svg>;
    case "mail": return <svg {...p}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>;
    case "flow": return <svg {...p}><circle cx="5" cy="6" r="2" /><circle cx="5" cy="18" r="2" /><circle cx="19" cy="12" r="2" /><path d="M7 6h3l7 6M7 18h3l7-6" /></svg>;
    case "consent": return <svg {...p}><path d="M12 3 5 6v5c0 4.5 3 8.3 7 10 4-1.7 7-5.5 7-10V6Z" /><path d="m9 12 2 2 4-4" /></svg>;
    case "ticket": return <svg {...p}><path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2 2 2 0 0 0 0 4 2 2 0 0 1-2 2H5a2 2 0 0 1-2-2 2 2 0 0 0 0-4Z" /><path d="M15 6v12" strokeDasharray="2 2" /></svg>;
    case "bolt": return <svg {...p}><path d="M13 2 4 14h7l-1 8 9-12h-7Z" /></svg>;
    case "shield": return <svg {...p}><path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6Z" /><path d="m9 12 2 2 4-4" /></svg>;
    case "cloud": return <svg {...p}><path d="M7 18a4 4 0 0 1-.5-8 5.5 5.5 0 0 1 10.6 1.2A3.5 3.5 0 0 1 17 18Z" /><path d="M12 13v5m-2-2 2 2 2-2" /></svg>;
    case "sliders": return <svg {...p}><path d="M4 6h16M4 12h16M4 18h16" /><circle cx="9" cy="6" r="2" fill="currentColor" /><circle cx="15" cy="12" r="2" fill="currentColor" /><circle cx="8" cy="18" r="2" fill="currentColor" /></svg>;
    case "utensils": return <svg {...p}><path d="M6 3v8a2 2 0 0 0 4 0V3M8 3v18M18 3c-1.5 0-3 1.5-3 5s1.5 4 3 4v9" /></svg>;
    case "glass": return <svg {...p}><path d="M6 3h12l-5 8v7M9 21h8M6 3l7 8" /></svg>;
    case "bed": return <svg {...p}><path d="M3 18V8m0 6h18M21 18v-4a3 3 0 0 0-3-3H9v3" /><circle cx="6.5" cy="9.5" r="1.5" /></svg>;
    case "sparkle": return <svg {...p}><path d="M12 3v6m0 6v6m-9-9h6m6 0h6M6 6l3 3m6 6 3 3m0-12-3 3m-6 6-3 3" /></svg>;
    case "frame": return <svg {...p}><rect x="3" y="3" width="18" height="18" rx="1.5" /><path d="M3 9h18M9 3v18" /></svg>;
    case "film": return <svg {...p}><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M7 4v16M17 4v16M3 9h4m10 0h4M3 15h4m10 0h4" /></svg>;
    case "dumbbell": return <svg {...p}><path d="M3 9v6M6 7v10M18 7v10M21 9v6M6 12h12" /></svg>;
    case "flag": return <svg {...p}><path d="M5 21V4m0 1 6-1 4 2 4-1v9l-4 1-4-2-6 1" /></svg>;
    case "tablet": return <svg {...p}><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M18.5 12h.01" /></svg>;
    case "monitor": return <svg {...p}><rect x="2" y="4" width="20" height="12" rx="1.5" /><path d="M8 20h8M12 16v4" /></svg>;
    case "reader": return <svg {...p}><rect x="6" y="2" width="12" height="20" rx="2" /><rect x="8.5" y="5" width="7" height="5" rx="1" /><path d="M9 14h.01M12 14h.01M15 14h.01M9 17h.01M12 17h.01M15 17h.01" /></svg>;
    case "nfc": return <svg {...p}><path d="M6 8.5a5 5 0 0 1 0 7M9.5 6a9 9 0 0 1 0 12M13 3.5a13 13 0 0 1 0 17" /><circle cx="3" cy="12" r="1" fill="currentColor" /></svg>;
    case "wrench": return <svg {...p}><path d="M14.5 5.5a4 4 0 0 0 5 5L21 12l-9 9-3-3 9-9-1.5-1.5a4 4 0 0 1-1-2Z" /><path d="M10 7 7 4 4 7l3 3" /></svg>;
    default: return <svg {...p}><circle cx="12" cy="12" r="8" /></svg>;
  }
}

// The Synapse mark: a hub-and-spokes network in a rounded tile. Inlined from
// logos/synapse_tile_round_128.svg (monochrome), sized via className.
function Logo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 128 128" fill="none" aria-hidden>
      <rect x="2" y="2" width="124" height="124" rx="24" ry="24" fill="#ffffff" stroke="#111111" strokeWidth="4" />
      <g transform="translate(17.25,8.75) scale(0.85)">
        <g stroke="#111111" strokeLinecap="round" strokeLinejoin="round" fill="none">
          <line x1="55" y1="60" x2="55" y2="38.9" strokeWidth="4.25" />
          <line x1="65" y1="70" x2="88.1" y2="70" strokeWidth="4.25" />
          <line x1="45" y1="70" x2="21.9" y2="70" strokeWidth="4.25" />
          <line x1="62.07" y1="62.93" x2="78.12" y2="46.88" strokeWidth="4.25" strokeDasharray="7.8 8.2" />
          <line x1="47.93" y1="62.93" x2="31.88" y2="46.88" strokeWidth="4.25" strokeDasharray="7.8 8.2" />
          <line x1="62.07" y1="77.07" x2="78.12" y2="93.12" strokeWidth="4.25" strokeDasharray="7.8 8.2" />
          <line x1="47.93" y1="77.07" x2="31.88" y2="93.12" strokeWidth="4.25" strokeDasharray="7.8 8.2" />
        </g>
        <circle cx="55" cy="70" r="8.5" fill="#111111" />
        <circle cx="55" cy="32" r="5.4" fill="#ffffff" stroke="#111111" strokeWidth="4" />
        <circle cx="95" cy="70" r="5.4" fill="#ffffff" stroke="#111111" strokeWidth="4" />
        <circle cx="15" cy="70" r="5.4" fill="#ffffff" stroke="#111111" strokeWidth="4" />
        <circle cx="83" cy="42" r="5.4" fill="#111111" />
        <circle cx="27" cy="42" r="5.4" fill="#111111" />
        <circle cx="83" cy="98" r="5.4" fill="#111111" />
        <circle cx="27" cy="98" r="5.4" fill="#111111" />
      </g>
    </svg>
  );
}

/* ------------------------------- components ------------------------------ */

function ButtonPrimary({ children, href, dark = false }: { children: React.ReactNode; href: string; dark?: boolean }) {
  return (
    <a href={href} className={"btn inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition-colors " + (dark ? "bg-white text-[var(--ink)] hover:bg-white/90" : "bg-[var(--brand)] text-white hover:bg-[var(--brand-strong)]")}>
      {children}
    </a>
  );
}

function ButtonGhost({ children, href, dark = false }: { children: React.ReactNode; href: string; dark?: boolean }) {
  return (
    <a href={href} className={"btn inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition-colors " + (dark ? "border border-white/25 text-white hover:bg-white/10" : "border border-[var(--border)] text-[var(--ink)] hover:bg-[var(--surface-2)]")}>
      {children}
    </a>
  );
}

function IntegrationCard({
  name,
  status,
  detail,
  light = false,
}: {
  name: string;
  status: "live" | "roadmap";
  detail: string;
  light?: boolean;
}) {
  const live = status === "live";
  return (
    <div
      className={
        "rounded-2xl border p-5 text-left " +
        (light ? "border-[var(--border)] bg-white" : "border-white/15 bg-white/5")
      }
    >
      <div className="flex items-center justify-between gap-3">
        <span className={"font-semibold " + (light ? "text-[var(--ink)]" : "text-white")}>{name}</span>
        {/* Say plainly which of these a venue can use today. */}
        <span
          className={
            "shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold " +
            (live
              ? "bg-emerald-500/15 text-emerald-600"
              : light
                ? "bg-[var(--surface-2)] text-[var(--muted)]"
                : "bg-white/10 text-white/60")
          }
        >
          {live ? "Available" : "On the roadmap"}
        </span>
      </div>
      <p className={"mt-2 text-sm " + (light ? "text-[var(--muted)]" : "text-white/60")}>{detail}</p>
    </div>
  );
}

function RoadmapBadge({ status }: { status: RoadmapStatus }) {
  return status === "shipped" ? (
    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">Shipped</span>
  ) : (
    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">In progress</span>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand)]">{children}</p>;
}

/* --------------------------------- page ---------------------------------- */

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* nav */}
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <a href="#top" className="flex items-center gap-2">
            <Logo />
            <span className="text-lg font-bold tracking-tight">synapse</span>
          </a>
          <nav className="hidden items-center gap-4 whitespace-nowrap lg:flex xl:gap-8">
            {NAV.map((n) => (
              <a key={n.href} href={n.href} className="text-sm text-[var(--muted)] transition-colors hover:text-[var(--ink)]">{n.label}</a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-[var(--muted)] sm:block">EN</span>
            <DemoModal className="inline-flex items-center justify-center rounded-full bg-[var(--brand)] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--brand-strong)]">Book a demo</DemoModal>
          </div>
        </div>
      </header>

      {/* hero */}
      <section id="top" className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden>
          <div className="hero-glow absolute inset-0" />
          <div className="bg-grid absolute inset-0" />
          <div className="orb orb-a left-[6%] top-[8%] h-72 w-72" style={{ background: "radial-gradient(circle, rgba(155,77,255,0.55), transparent 70%)" }} />
          <div className="orb orb-b right-[4%] top-[2%] h-80 w-80" style={{ background: "radial-gradient(circle, rgba(108,43,217,0.45), transparent 70%)" }} />
          <HeroNetwork className="absolute left-1/2 top-[4%] h-[340px] w-[340px] -translate-x-1/2 opacity-[0.13]" />
        </div>
        <div className="mx-auto max-w-6xl px-5 pt-24 pb-16 text-center sm:pt-32">
          <h1 className="mx-auto max-w-4xl text-5xl font-bold leading-[0.98] tracking-[-0.03em] sm:text-7xl">
            Run your whole venue on{" "}
            <span className="bg-gradient-to-r from-[var(--brand)] to-[var(--accent)] bg-clip-text text-transparent">one platform</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-[var(--muted)] sm:text-xl">
            CRM, front of house, POS, kitchen display, bookings, membership, payments and more — one
            real-time system for restaurants, bars and members' clubs. Every guest, booking and order
            flows through one traceable data model, so you can visualise it in seconds and make
            strategic decisions on data, not guesswork.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <ButtonPrimary href="#demo">Get started</ButtonPrimary>
            <ButtonGhost href="#platform">Explore the platform</ButtonGhost>
          </div>
          {/* The system map: every surface, module and connection on one sheet. */}
          <div className="relative mx-auto mt-16 max-w-5xl">
            <Reveal>
              <SystemMap />
            </Reveal>
          </div>
        </div>
      </section>

      {/* products */}
      <section id="products" className="mx-auto max-w-6xl px-5 py-28">
        <div className="max-w-2xl">
          <Eyebrow>One platform, many modules</Eyebrow>
          <h2 className="text-4xl font-bold tracking-[-0.02em] sm:text-5xl">CRM, POS and more. Switch on what your business needs.</h2>
          <p className="mt-5 text-lg text-[var(--muted)]">
            synapse is one product made of modules. A members&apos; club usually starts with CRM; a
            restaurant or bar with POS. Combine them with front of house, kitchen display, payments and
            insights to suit the venue. Every module shares one database, one identity model and one
            real-time bus — so a member on the door is the same member on the bill.
          </p>
        </div>
        <div className="mt-14 grid gap-5 lg:grid-cols-2">
          {PRODUCT_LINES.map((line) => (
            <div key={line.key} className="flex flex-col rounded-3xl border border-[var(--border)] bg-white p-7 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand-strong)]">{line.tagline}</p>
                  <h3 className="mt-2 text-3xl font-bold tracking-tight">{line.name}</h3>
                </div>
                <div className="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand-strong)]">
                  <Icon name={line.icon} />
                </div>
              </div>
              <p className="mt-4 text-base leading-relaxed text-[var(--muted)]">{line.desc}</p>
              {/* The three pieces the module is made of — how it is installed. */}
              <ol className="mt-7 grid gap-3 sm:grid-cols-3">
                {line.parts.map((part, i) => (
                  <li key={part.name} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-5">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-[var(--brand-strong)] ring-1 ring-[var(--border)]">
                        <Icon name={part.icon} className="h-5 w-5" />
                      </span>
                      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">{i + 1}</span>
                    </div>
                    <h4 className="mt-4 text-base font-bold tracking-tight">{part.name}</h4>
                    <p className="mt-1.5 text-sm leading-relaxed text-[var(--muted)]">{part.desc}</p>
                  </li>
                ))}
              </ol>
              <ul className="mt-6 flex flex-wrap gap-2">
                {line.includes.map((item) => (
                  <li key={item} className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-medium text-[var(--ink)]">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-2)] p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-[var(--ink)]">…and it&apos;s modular within each.</p>
            <p className="mt-1 text-sm text-[var(--muted)]">Switch floor plans, kitchen display, bookings, loyalty, passes or marketing on per venue — the configurator gates the rest until they&apos;re ready.</p>
          </div>
          <ButtonGhost href="#solutions">See what your venue needs</ButtonGhost>
        </div>
      </section>

      {/* marketing & messaging */}
      <section id="marketing" className="border-t border-[var(--border)] bg-[var(--surface-2)]">
        <div className="mx-auto max-w-6xl px-5 py-28">
          <div className="max-w-2xl">
            <Eyebrow>Marketing &amp; messaging</Eyebrow>
            <h2 className="text-4xl font-bold tracking-[-0.02em] sm:text-5xl">Messages that know your members</h2>
            <p className="mt-5 text-lg text-[var(--muted)]">
              Email, SMS and WhatsApp built on the same member record as the door and the till. A confirmation
              the moment a table is booked, a reminder the day before, and journeys you draw yourself.
              Consent, unsubscribes and quiet hours are handled for you.
            </p>
          </div>
          <figure className="mx-auto mt-14 max-w-4xl">
            <Reveal>
              <Frame>
                <MarketingShowcase />
              </Frame>
            </Reveal>
            <figcaption className="mt-3 text-sm text-[var(--muted)]">Triggers, journeys, campaigns and templates — the booking reminder, the example journey and the copy shown are the ones synapse ships with.</figcaption>
          </figure>
          <div className="mx-auto mt-12 grid max-w-4xl gap-4 sm:grid-cols-3">
            {MARKETING_POINTS.map((m) => (
              <div key={m.title} className="rounded-2xl border border-[var(--border)] bg-white p-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand-strong)]">
                  <Icon name={m.icon} className="h-5 w-5" />
                </div>
                <h3 className="mt-3 font-bold tracking-tight">{m.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">{m.desc}</p>
              </div>
            ))}
          </div>

          {/* the real admin, running the flows above on the demo club */}
          <div className="mx-auto mt-24 max-w-2xl text-center">
            <Eyebrow>In the product</Eyebrow>
            <h3 className="text-3xl font-bold tracking-[-0.02em] sm:text-4xl">Live flows, not slideware</h3>
            <p className="mt-4 text-base text-[var(--muted)]">
              Screenshots from the synapse admin, with every number counted by the engine as it ran.
            </p>
          </div>
          <div className="mx-auto mt-10 grid max-w-5xl gap-6 lg:grid-cols-2">
            <figure>
              <Reveal delayMs={60}>
                <Shot src="/screenshots/marketing-journey-builder.png" alt="synapse admin — journey builder with email, wait-for-open and SMS follow-up steps" w={2880} h={1800} />
              </Reveal>
              <figcaption className="mt-3 text-sm text-[var(--muted)]">Journey builder — drag steps in, branch on whether the email was opened, follow up by text.</figcaption>
            </figure>
            <figure>
              <Reveal delayMs={140}>
                <Shot src="/screenshots/marketing-automations.png" alt="synapse admin — booking automations with their triggers and templates" w={2880} h={1800} />
              </Reveal>
              <figcaption className="mt-3 text-sm text-[var(--muted)]">Triggers — what each automation listens for, what it checks, and which template it sends.</figcaption>
            </figure>
            <figure>
              <Reveal delayMs={60}>
                <Shot src="/screenshots/marketing-audience.png" alt="synapse admin — audience rule with its live member count" w={2880} h={1800} />
              </Reveal>
              <figcaption className="mt-3 text-sm text-[var(--muted)]">Audiences — a rule, and who matches it right now. Campaigns go to exactly these people.</figcaption>
            </figure>
            <figure>
              <Reveal delayMs={140}>
                <Shot src="/screenshots/marketing-template.png" alt="synapse admin — drag-and-drop email template editor with merge fields" w={2880} h={1800} />
              </Reveal>
              <figcaption className="mt-3 text-sm text-[var(--muted)]">Templates — drag-and-drop email with merge fields, versioned so a live journey never changes mid-flight.</figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* membership billing — dues, credits, freezes and the house account */}
      <section id="billing" className="border-t border-[var(--border)]">
        <div className="mx-auto max-w-6xl px-5 py-28">
          <div className="max-w-2xl">
            <Eyebrow>Membership billing</Eyebrow>
            <h2 className="text-4xl font-bold tracking-[-0.02em] sm:text-5xl">Dues that handle the awkward cases</h2>
            <p className="mt-5 text-lg text-[var(--muted)]">
              Members upgrade mid-month, go abroad for a season and get charged twice by mistake.
              synapse prices each of those before you confirm it, writes a VAT-correct invoice or
              credit note, and keeps one balance per member that Direct Debit settles.
            </p>
          </div>
          <div className="mt-14 grid gap-6 lg:grid-cols-2">
            <figure>
              <Reveal>
                <Shot src="/screenshots/billing-subscription.png" alt="synapse admin — a member's subscription, card on file and paid dues invoices with VAT" w={2272} h={876} />
              </Reveal>
              <figcaption className="mt-3 text-sm text-[var(--muted)]">Membership — the plan, the next bill, and every dues invoice with its VAT, period and PDF.</figcaption>
            </figure>
            <figure>
              <Reveal delayMs={100}>
                <Shot src="/screenshots/house-account.png" alt="synapse admin — a member's house account with balance, credit limit and an active Direct Debit" w={2272} h={888} />
              </Reveal>
              <figcaption className="mt-3 text-sm text-[var(--muted)]">House account — what the member owes, what they can still sign for, and the mandate that collects it.</figcaption>
            </figure>
          </div>
          {/* Columns sized by each dialog's aspect ratio, so the three shots stand the same height. */}
          <div className="mt-6 grid items-start gap-6 md:grid-cols-[1.05fr_0.86fr_1.67fr]">
            <figure>
              <Reveal delayMs={40}>
                <Shot src="/screenshots/billing-change-plan.png" alt="synapse admin — change plan dialog, switching at renewal with no proration" w={1008} h={962} />
              </Reveal>
              <figcaption className="mt-3 text-sm text-[var(--muted)]">Change plan — now, pro rata, or at renewal. The dialog says what will be charged before you confirm.</figcaption>
            </figure>
            <figure>
              <Reveal delayMs={120}>
                <Shot src="/screenshots/billing-freeze.png" alt="synapse admin — freeze membership dialog crediting the unused days" w={1008} h={1178} />
              </Reveal>
              <figcaption className="mt-3 text-sm text-[var(--muted)]">Freeze — the unused days come back as credit, and billing resumes on the date you set.</figcaption>
            </figure>
            <figure>
              <Reveal delayMs={200}>
                <Shot src="/screenshots/billing-credit.png" alt="synapse admin — issuing a credit note against a paid invoice" w={1648} h={984} />
              </Reveal>
              <figcaption className="mt-3 text-sm text-[var(--muted)]">Credit note — any part of a paid invoice, VAT split out, to the card or the account.</figcaption>
            </figure>
          </div>
          <div className="mx-auto mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {BILLING_POINTS.map((m) => (
              <div key={m.title} className="rounded-2xl border border-[var(--border)] bg-white p-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand-strong)]">
                  <Icon name={m.icon} className="h-5 w-5" />
                </div>
                <h3 className="mt-3 font-bold tracking-tight">{m.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* wallet passes — designed once, delivered as one link */}
      <section id="passes" className="border-t border-[var(--border)] bg-[var(--surface-2)]">
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 py-28 lg:grid-cols-[1fr_1.15fr]">
          <div>
            <Eyebrow>Wallet passes</Eyebrow>
            <h2 className="text-4xl font-bold tracking-[-0.02em] sm:text-5xl">The membership card is in their phone</h2>
            <p className="mt-5 text-lg text-[var(--muted)]">
              Design Apple and Google Wallet passes in the admin, issue them from the member&apos;s
              profile, and send one link that works on any phone. Sending it automatically by
              WhatsApp, SMS or email is being built now.
            </p>
            <ul className="mt-8 space-y-4">
              {PASS_POINTS.map((p) => (
                <li key={p.title} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full bg-[var(--brand)] text-white">
                    <Icon name="pass" className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-sm">
                    <span className="font-semibold text-[var(--ink)]">{p.title}.</span>{" "}
                    <span className="text-[var(--muted)]">{p.desc}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <figure>
            <Reveal>
              <Shot src="/screenshots/pass-designer.png" alt="synapse admin — wallet pass designer with live Apple and Google Wallet previews" w={1850} h={1490} />
            </Reveal>
            <figcaption className="mt-3 text-sm text-[var(--muted)]">Pass designer — colours, barcode and fields, with the Apple and Google versions drawn side by side.</figcaption>
          </figure>
        </div>
      </section>

      {/* back office — purchasing and the books */}
      <section id="backoffice" className="border-t border-[var(--border)]">
        <div className="mx-auto max-w-6xl px-5 py-28">
          <div className="max-w-2xl">
            <Eyebrow>Back office</Eyebrow>
            <h2 className="text-4xl font-bold tracking-[-0.02em] sm:text-5xl">Purchasing and the books, on the same record as the till</h2>
            <p className="mt-5 text-lg text-[var(--muted)]">
              A purchase order becomes stock when it is signed for and a cost when the invoice matches
              it. Every sale is written once, signed, and rolled into a daily journal your accountant
              can trust. No spreadsheets in between.
            </p>
          </div>
          <div className="mt-14 grid gap-8 lg:grid-cols-2">
            <figure>
              <Reveal>
                <Frame>
                  <ProcurementFlow />
                </Frame>
              </Reveal>
              <figcaption className="mt-3 text-sm text-[var(--muted)]">Order → approve → send → receive → invoice → match — the seeded order to Fernhollow Cellars, with the 60p-a-case difference caught and credited.</figcaption>
            </figure>
            <figure>
              <Reveal delayMs={100}>
                <Frame>
                  <LedgerFlow />
                </Frame>
              </Reveal>
              <figcaption className="mt-3 text-sm text-[var(--muted)]">Sale → sales record → trading day → journal → ledger — the check at Window 4, split by sales group with VAT extracted, balanced and posted.</figcaption>
            </figure>
          </div>
          <figure className="mx-auto mt-10 max-w-4xl">
            <Reveal>
              <Shot src="/screenshots/procurement-attention.png" alt="synapse admin — procurement needs-attention queue with orders and invoices to approve" w={2880} h={1800} />
            </Reveal>
            <figcaption className="mt-3 text-sm text-[var(--muted)]">Needs attention — orders waiting for approval, invoices with differences to decide, and deliveries that arrived without an order.</figcaption>
          </figure>
          <div className="mx-auto mt-12 grid gap-4 sm:grid-cols-3">
            {BACKOFFICE_POINTS.map((m) => (
              <div key={m.title} className="rounded-2xl border border-[var(--border)] bg-white p-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand-strong)]">
                  <Icon name={m.icon} className="h-5 w-5" />
                </div>
                <h3 className="mt-3 font-bold tracking-tight">{m.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* product tour */}
      <section id="showcase" className="border-t border-[var(--border)] bg-[var(--surface-2)]">
        <div className="mx-auto max-w-6xl px-5 py-28">
          <div className="max-w-2xl">
            <Eyebrow>A closer look</Eyebrow>
            <h2 className="text-4xl font-bold tracking-[-0.02em] sm:text-5xl">See it in action</h2>
            <p className="mt-5 text-lg text-[var(--muted)]">The admin, from the same platform that drives the tills and the floor.</p>
          </div>
          <figure className="mx-auto mt-14 max-w-3xl">
            <Reveal>
              <Shot src="/screenshots/floor-plan.png" alt="synapse admin — live service floor plan with seated tables and each server's covers" w={2220} h={1190} />
            </Reveal>
            <figcaption className="mt-3 text-sm text-[var(--muted)]">Floor plan — every seated table with its covers, member and server, and each server's tables and takings, updating in real time.</figcaption>
          </figure>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <figure>
              <Reveal delayMs={60}>
                <Shot src="/screenshots/catalog.png" alt="synapse admin — catalogue and stock levels" w={2880} h={1800} />
              </Reveal>
              <figcaption className="mt-3 text-sm text-[var(--muted)]">Catalogue — live stock, suppliers, reorder points and status.</figcaption>
            </figure>
            <figure>
              <Reveal delayMs={140}>
                <Shot src="/screenshots/dashboard.png" alt="synapse admin — dashboard overview" w={2880} h={1800} />
              </Reveal>
              <figcaption className="mt-3 text-sm text-[var(--muted)]">Dashboard — sales, VAT and venue occupancy at a glance.</figcaption>
            </figure>
          </div>

          {/* the till — same platform, on the iPad */}
          <div className="mt-24 max-w-2xl">
            <Eyebrow>On the floor</Eyebrow>
            <h3 className="text-3xl font-bold tracking-[-0.02em] sm:text-4xl">The iPad till</h3>
            <p className="mt-5 text-lg text-[var(--muted)]">
              The same catalogue, prices and tax rules the admin manages — running natively on the
              floor and, with an on-premises server, still ringing up sales when the internet drops.
            </p>
          </div>
          <div className="mt-12 grid gap-8 lg:grid-cols-2">
            <figure>
              <Reveal>
                <TabletShot src="/screenshots/till-order.png" alt="synapse till on iPad — ringing up a check" w={2420} h={1668} />
              </Reveal>
              <figcaption className="mt-4 text-sm text-[var(--muted)]">
                Order entry — tap to ring up, with running subtotal, VAT and the live check beside it.
              </figcaption>
            </figure>
            <figure>
              <Reveal delayMs={100}>
                <TabletShot src="/screenshots/till-payment.png" alt="synapse till on iPad — taking payment with splits and tenders" w={2420} h={1668} />
              </Reveal>
              <figcaption className="mt-4 text-sm text-[var(--muted)]">
                Payment — split evenly, part-pay, and take cash, card or a card-present reader.
              </figcaption>
            </figure>
          </div>

          {/* the pass and the door — the other two screens a venue runs.
              Each column is a subgrid: copy in row one, figure in row two, so
              both screenshots start on the same line however long the copy. */}
          <div className="mt-24 grid gap-8 lg:grid-cols-2">
            <div className="lg:row-span-2 lg:grid lg:grid-rows-subgrid">
              <div>
                <Eyebrow>At the pass</Eyebrow>
                <h3 className="text-3xl font-bold tracking-[-0.02em] sm:text-4xl">The kitchen display</h3>
                <p className="mt-5 text-lg text-[var(--muted)]">
                  Any screen on the wall becomes a pass: registered once, then it comes back on its own.
                  Tickets, not loose lines — aged by colour, paced by course, bumped when the food leaves.
                </p>
              </div>
              <figure className="mt-8 lg:mt-0">
                <Reveal>
                  <TabletShot src="/screenshots/kds-expo.png" alt="synapse kitchen display — the expo view, each table's courses with pass, hold and fire" w={3200} h={2000} />
                </Reveal>
                <figcaption className="mt-4 text-sm text-[var(--muted)]">
                  Expo — every table's courses side by side: pass what's ready, hold or fire the next, with the notes the till sent.
                </figcaption>
              </figure>
            </div>
            <div className="lg:row-span-2 lg:grid lg:grid-rows-subgrid">
              <div>
                <Eyebrow>On the door</Eyebrow>
                <h3 className="text-3xl font-bold tracking-[-0.02em] sm:text-4xl">Front of house</h3>
                <p className="mt-5 text-lg text-[var(--muted)]">
                  Reception sees who is in, who needs a hand tonight, and checks members in by NFC tap or
                  QR scan — the same member record the bill will land on. Members and their guests check
                  out with one tap, so the board is always right and every visit is on record: who came
                  in, with whom, when, and when they left.
                </p>
              </div>
              <figure className="mt-8 lg:mt-0">
                <Reveal delayMs={100}>
                  <TabletShot src="/screenshots/foh-door.png" alt="synapse front of house — the door board with tonight's arrivals" w={3200} h={2000} />
                </Reveal>
                <figcaption className="mt-4 text-sm text-[var(--muted)]">
                  The door — arrivals as they happen, assistance flagged before the guest reaches the desk.
                </figcaption>
              </figure>
            </div>
          </div>
        </div>
      </section>

      {/* hardware — what synapse runs on, and what we advise */}
      <section id="hardware" className="border-t border-[var(--border)]">
        <div className="mx-auto max-w-6xl px-5 py-28">
          <div className="grid items-end gap-10 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <Eyebrow>Hardware</Eyebrow>
              <h2 className="text-4xl font-bold tracking-[-0.02em] sm:text-5xl">Runs on the devices you choose</h2>
              <p className="mt-5 text-lg text-[var(--muted)]">
                Tills on iPads or Android tablets, the kitchen display and the door on any screen with a
                browser, printers and card readers that venues already know. Keep what works, replace
                only what doesn&apos;t.
              </p>
            </div>
            {/* The point to land: advice, not a hardware bundle. */}
            <div className="rounded-3xl bg-[var(--ink-900)] p-7 text-white sm:p-8">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-white/10">
                  <Icon name="wrench" className="h-5 w-5" />
                </span>
                <p className="text-lg font-bold tracking-tight">We don&apos;t sell hardware.</p>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-white/70">
                No bundles and no lock-in. We advise on what works best with synapse for your rooms
                and your service, and you buy it from your usual supplier. Rather not source it
                yourself? We can broker it for you. And if a venue needs something we don&apos;t
                support yet, we build the integration.
              </p>
            </div>
          </div>
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {HARDWARE.map((h) => (
              <div key={h.title} className="flex flex-col rounded-2xl border border-[var(--border)] bg-white p-6">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand-strong)]">
                    <Icon name={h.icon} className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-[var(--surface-2)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--muted)]">{h.runs}</span>
                </div>
                <h3 className="mt-4 text-lg font-bold tracking-tight">{h.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[var(--muted)]">{h.desc}</p>
                <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">We recommend</p>
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {h.picks.map((x) => (
                    <li key={x} className="rounded-full border border-[var(--border)] px-2.5 py-1 text-xs font-medium text-[var(--ink)]">{x}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-5 flex flex-col gap-4 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-2)] p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-[var(--ink)]">Something else on the floor?</p>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Label printers, customer-facing displays, a reader your acquirer insists on, kit you already
                own — tell us what you run and we&apos;ll tell you what works, broker what&apos;s missing, or
                scope a custom integration.
              </p>
            </div>
            <div className="shrink-0">
              <ButtonGhost href="#demo">Ask about your setup</ButtonGhost>
            </div>
          </div>
        </div>
      </section>

      {/* live illustrations */}
      <section id="live" className="border-t border-[var(--border)]">
        <div className="mx-auto max-w-6xl px-5 py-28">
          <div className="max-w-2xl">
            <Eyebrow>Live, not a slideshow</Eyebrow>
            <h2 className="text-4xl font-bold tracking-[-0.02em] sm:text-5xl">Watch a service run</h2>
            <p className="mt-5 text-lg text-[var(--muted)]">
              The room filling up and a check being settled — the same data your admin, tills and
              front-of-house all share, updating in real time.
            </p>
          </div>
          <div className="mt-14 grid items-start gap-6 lg:grid-cols-2">
            <figure>
              <Reveal>
                <div className="float-soft">
                  <Frame>
                    <FloorPlanLive />
                  </Frame>
                </div>
              </Reveal>
              <figcaption className="mt-3 text-sm text-[var(--muted)]">Floor plan — tables recolour with occupancy; covers and reservations update as guests are seated.</figcaption>
            </figure>
            <figure>
              <Reveal delayMs={120}>
                <div className="float-soft" style={{ animationDelay: "1.4s" }}>
                  <Frame>
                    <TillLive />
                  </Frame>
                </div>
              </Reveal>
              <figcaption className="mt-3 text-sm text-[var(--muted)]">Till — items ring up, the member discount applies and the total recalculates, then payment settles card-present.</figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* data-flow illustrations */}
      <section id="data" className="border-t border-[var(--border)] bg-[var(--surface-2)]">
        <div className="mx-auto max-w-6xl px-5 py-28">
          <div className="max-w-2xl">
            <Eyebrow>One system of record</Eyebrow>
            <h2 className="text-4xl font-bold tracking-[-0.02em] sm:text-5xl">Follow the data</h2>
            <p className="mt-5 text-lg text-[var(--muted)]">
              A real order as it moves through the platform: priced, discounted, settled, banked and
              attributed to the member. Every figure is computed with the same money math the till
              and API run on.
            </p>
          </div>
          <figure className="mx-auto mt-14 max-w-4xl">
            <Reveal>
              <Frame>
                <RevenueFlow />
              </Frame>
            </Reveal>
            <figcaption className="mt-3 text-sm text-[var(--muted)]">Order → discount → check → money intake → member — one transaction, registered everywhere it needs to be, with VAT extracted from inclusive prices.</figcaption>
          </figure>
          <figure className="mx-auto mt-10 max-w-4xl">
            <Reveal delayMs={100}>
              <Frame>
                <MemberJourney />
              </Frame>
            </Reveal>
            <figcaption className="mt-3 text-sm text-[var(--muted)]">Member check-in → order → tracking — visits, spend and loyalty credit update on the member's profile as they're served.</figcaption>
          </figure>
          <figure className="mx-auto mt-10 max-w-4xl">
            <Reveal delayMs={100}>
              <Frame>
                <MemberTrail />
              </Frame>
            </Reveal>
            <figcaption className="mt-3 text-sm text-[var(--muted)]">Track the member — to the booking, to the event, to the floor and to the table. One record, so the floor plan shows who is sitting where.</figcaption>
          </figure>
        </div>
      </section>

      {/* operations details */}
      <section id="platform" className="border-t border-[var(--border)]">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <div className="grid items-start gap-14 lg:grid-cols-2">
            <div className="lg:sticky lg:top-28">
              <Eyebrow>Built for the floor</Eyebrow>
              <h2 className="text-4xl font-bold tracking-[-0.02em] sm:text-5xl">The details that keep operations running</h2>
              <p className="mt-5 text-lg text-[var(--muted)]">
                The operational depth other platforms bolt on as integrations is native here — from
                the pass at the door to the chit in the kitchen.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonPrimary href="#demo">Book a demo</ButtonPrimary>
                <ButtonGhost href="#solutions">See who it's for</ButtonGhost>
              </div>
            </div>
            {/* Two columns from the tablet breakpoint so the cards sit level
                with the sticky copy instead of running well past it. */}
            <div className="grid gap-4 sm:grid-cols-2">
              {OPERATIONS.map((o) => (
                <div key={o.title} className="rounded-2xl border border-[var(--border)] bg-white p-5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand-strong)]">
                    <Icon name={o.icon} className="h-5 w-5" />
                  </div>
                  <h3 className="mt-3 font-bold tracking-tight">{o.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">{o.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* feature grid */}
      <section id="features" className="mx-auto max-w-6xl px-5 py-28">
        <div className="max-w-2xl">
          <Eyebrow>Everything a venue runs on</Eyebrow>
          <h2 className="text-4xl font-bold tracking-[-0.02em] sm:text-5xl">Native, not bolted on</h2>
        </div>
        <div className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--border)] sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-white p-8">
              <div className="text-[var(--brand-strong)]"><Icon name={f.icon} /></div>
              <h3 className="mt-5 font-bold tracking-tight">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* real-time */}
      <section className="border-t border-[var(--border)] bg-[var(--surface-2)]">
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 py-28 lg:grid-cols-2">
          <div>
            <Eyebrow>Real-time by default</Eyebrow>
            <h2 className="text-4xl font-bold tracking-[-0.02em] sm:text-5xl">No refresh. No stale menu. No “push to tills.”</h2>
            <p className="mt-5 text-lg text-[var(--muted)]">
              Every write publishes a change event over a lightweight stream. The admin, the
              front-of-house board and every iPad till subscribe — so a new item, a moved table or a
              settled check appears in about a second, with polling as the fallback if the stream drops.
            </p>
            <ul className="mt-7 space-y-3">
              {[
                "Edit a menu in admin → it's ringing up on the till.",
                "Open a check on the till → the floor plan reflects it.",
                "Change a plan or a config → every surface catches up.",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3 text-sm font-medium text-[var(--ink)]">
                  <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-[var(--brand)] text-white">
                    <Icon name="bolt" className="h-3 w-3" />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <SyncFlow />
        </div>
      </section>

      {/* payments + integrations */}
      <section id="integrations" className="mx-auto max-w-6xl px-5 py-24">
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--ink-900)] p-8 sm:p-14">
          <div className="text-center">
            <Eyebrow>Payments, built in</Eyebrow>
            <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-[-0.02em] text-white sm:text-4xl">
              Take every tender, on any surface
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-white/60">
              Providers are configured per organisation and their credentials are encrypted at rest,
              so a group can run different acquirers in different venues.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              {PAYMENTS.map((m) => (
                <span key={m} className="rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white/90">{m}</span>
              ))}
            </div>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {PAYMENT_PROVIDERS.map((p) => (
              <IntegrationCard key={p.name} {...p} />
            ))}
          </div>
        </div>

        <div className="mt-16">
          <div className="max-w-2xl">
            <Eyebrow>Integrations</Eyebrow>
            <h2 className="text-3xl font-bold tracking-[-0.02em] sm:text-4xl">Works with the rest of your stack</h2>
            <p className="mt-4 text-[var(--muted)]">
              An extensive API gateway exposes every module upwards — to your own desktop and mobile
              apps, or to any system that needs the data. Checks leave synapse in an Oracle
              Simphony-shaped document, so anything that already consumes a POS feed can consume ours.
            </p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PARTNER_INTEGRATIONS.map((p) => (
              <IntegrationCard key={p.name} {...p} light />
            ))}
          </div>
        </div>
      </section>

      {/* API — in and out */}
      <section id="api" className="border-t border-[var(--border)] bg-[var(--surface-2)]">
        <div className="mx-auto max-w-6xl px-5 py-28">
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow>API</Eyebrow>
            <h2 className="text-4xl font-bold tracking-[-0.02em] sm:text-5xl">Open in both directions</h2>
            <p className="mt-5 text-lg text-[var(--muted)]">
              Bring members, reservations and events in from the platforms you already run, and serve
              every module back out to your own apps and partners — REST today, GraphQL next, with
              webhooks so nobody has to poll.
            </p>
          </div>
          <div className="mt-14">
            <ApiSection />
          </div>
        </div>
      </section>

      {/* verticals */}
      <section id="solutions" className="border-t border-[var(--border)] bg-[var(--surface-2)]">
        <div className="mx-auto max-w-6xl px-5 py-28">
          <div className="max-w-2xl">
            <Eyebrow>Solutions</Eyebrow>
            <h2 className="text-4xl font-bold tracking-[-0.02em] sm:text-5xl">Built for every kind of venue</h2>
            <p className="mt-5 text-lg text-[var(--muted)]">Pick your venue to see what you&rsquo;d run — then add or remove modules to suit.</p>
          </div>
          <div className="mt-14">
            <VenueConfigurator />
          </div>
        </div>
      </section>

      {/* timeline */}
      <section className="mx-auto max-w-6xl px-5 py-28">
        <div className="max-w-2xl">
          <Eyebrow>Onboarding</Eyebrow>
          <h2 className="text-4xl font-bold tracking-[-0.02em] sm:text-5xl">Live in days, not months</h2>
        </div>
        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {TIMELINE.map((t, i) => (
            <div key={t.day} className="relative rounded-2xl border border-[var(--border)] bg-white p-7">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--brand)] text-sm font-bold text-white">{i + 1}</span>
                <span className="text-sm font-semibold uppercase tracking-wide text-[var(--brand-strong)]">{t.day}</span>
              </div>
              <h3 className="mt-4 text-lg font-bold tracking-tight">{t.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{t.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* security */}
      <section id="security" className="border-t border-[var(--border)] bg-[var(--surface-2)]">
        <div className="mx-auto max-w-6xl px-5 py-28">
          <div className="max-w-2xl">
            <Eyebrow>Enterprise-ready</Eyebrow>
            <h2 className="text-4xl font-bold tracking-[-0.02em] sm:text-5xl">Secure and compliant from day one</h2>
            <p className="mt-5 text-lg text-[var(--muted)]">Auth, encryption, auditing and data-subject tooling are built in — not a later project.</p>
          </div>
          <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {SECURITY.map((s) => (
              <div key={s} className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-white px-5 py-4">
                <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-[var(--brand)] text-white">
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3"><path d="m5 12 5 5L20 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </span>
                <span className="text-sm font-semibold text-[var(--ink)]">{s}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* roadmap */}
      <section id="roadmap" className="border-t border-[var(--border)]">
        <div className="mx-auto max-w-6xl px-5 py-28">
          <div className="max-w-2xl">
            <Eyebrow>Roadmap</Eyebrow>
            <h2 className="text-4xl font-bold tracking-[-0.02em] sm:text-5xl">Where synapse goes next</h2>
            <p className="mt-5 text-lg text-[var(--muted)]">
              From a complete venue platform to a member-facing, developer-facing, certified product.
              Sequenced by dependency, so every phase ships something a venue or a partner can use.
              Each item says where it stands; anything without a badge is planned, not promised.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-[var(--muted)]">
            <span className="flex items-center gap-1.5"><RoadmapBadge status="shipped" /> on main</span>
            <span className="flex items-center gap-1.5"><RoadmapBadge status="building" /> being built now</span>
            <span>no badge · planned</span>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Recently shipped</span>
            {SHIPPED.map((x) => (
              <span key={x} className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">✓ {x}</span>
            ))}
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {ROADMAP.map((p, i) => (
              <div key={p.phase} className="flex flex-col rounded-2xl border border-[var(--border)] bg-white p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand-strong)]">Phase {i + 1}</p>
                <h3 className="mt-1 text-lg font-bold tracking-tight">{p.phase}</h3>
                <p className="mt-1 text-sm text-[var(--muted)]">{p.why}</p>
                <ul className="mt-4 space-y-2.5">
                  {p.items.map((it) => (
                    <li key={it.title} className="text-sm">
                      <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="font-semibold text-[var(--ink)]">{it.title}</span>
                        {it.status && <RoadmapBadge status={it.status} />}
                      </span>
                      <span className="block text-[var(--muted)]">{it.desc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-[var(--muted)]">
            Inbound order ingestion and a native member app come after the public API and the member
            portal they depend on.
          </p>
        </div>
      </section>

      {/* CTA + contact form */}
      <section id="demo" className="bg-[var(--ink-900)]">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-28 lg:grid-cols-[1fr_1.05fr] lg:items-start lg:gap-16">
          <div className="lg:sticky lg:top-24">
            <h2 className="max-w-xl text-4xl font-bold tracking-[-0.02em] text-white sm:text-5xl">
              Ready to run your venue on synapse?
            </h2>
            <p className="mt-5 max-w-lg text-lg text-white/60">
              A 30-minute walkthrough of the admin, the floor and the till — with your menu, your rooms
              and your membership.
            </p>
            <ul className="mt-8 space-y-3">
              {[
                "A live tour of the admin, floor plan and iPad till",
                "Your own menu and rooms loaded in, not a canned demo",
                "Straight answers on migration, pricing and timelines",
              ].map((t) => (
                <li key={t} className="flex gap-3 text-sm text-white/70">
                  <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
                    <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {t}
                </li>
              ))}
            </ul>

          </div>
          <div className="flex flex-col items-start gap-4 rounded-2xl border border-white/15 bg-white/5 p-8">
            <h3 className="text-xl font-semibold text-white">Request your walkthrough</h3>
            <p className="text-sm text-white/60">
              Tell us about your venue and we&apos;ll set up a session that fits it.
            </p>
            <DemoModal className="mt-2 inline-flex items-center justify-center rounded-full bg-[var(--brand)] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--brand-strong)]">
              Book a demo
            </DemoModal>
          </div>
        </div>
      </section>

      {/* footer */}
      <footer className="bg-[var(--ink-900)] text-white/70">
        <div className="mx-auto max-w-6xl px-5">
          <div className="grid gap-10 border-t border-white/10 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div>
              <div className="flex items-center gap-2 text-white">
                <Logo />
                <span className="text-lg font-bold tracking-tight">synapse</span>
              </div>
              <p className="mt-4 max-w-xs text-sm text-white/50">
                The operating system for modern hospitality — POS, CRM, payments and insights in one
                real-time platform.
              </p>
            </div>
            {FOOTER_COLUMNS.map(({ title, links }) => (
              <div key={title}>
                <h4 className="text-sm font-bold text-white">{title}</h4>
                <ul className="mt-4 space-y-2.5">
                  {links.map(({ label, href }) => (
                    <li key={label}>
                      <a href={href} className="text-sm text-white/50 transition-colors hover:text-white">
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="flex flex-col items-center justify-between gap-3 border-t border-white/10 py-6 text-xs text-white/40 sm:flex-row">
            <p>© {new Date().getFullYear()} synapse. A hospitality management platform.</p>
            <p>Built for restaurants, bars and members' clubs.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* --------------------------------- mocks --------------------------------- */

// Real product screenshot in a plain rounded card (no browser chrome).
// Every screenshot carries its pixel size so the browser reserves the box
// before the file arrives — otherwise the page collapses and re-expands as
// each image loads, which reads as a jump while scrolling.
function Shot({ src, alt, w, h }: { src: string; alt: string; w: number; h: number }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white text-left shadow-[0_40px_100px_-40px_rgba(11,18,32,0.4)]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} width={w} height={h} className="block h-auto w-full" />
    </div>
  );
}

// Tablet bezel for the iPad till shots — the app is landscape-locked, so the
// frame is landscape too, with a camera dot on the long edge like a real iPad.
function TabletShot({ src, alt, w, h }: { src: string; alt: string; w: number; h: number }) {
  return (
    <div className="rounded-[26px] bg-[#1c1c1e] p-3 shadow-[0_40px_100px_-40px_rgba(11,18,32,0.55)] ring-1 ring-black/10 sm:rounded-[34px] sm:p-4">
      <div className="flex items-center gap-3">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-white/25" aria-hidden />
        <div className="overflow-hidden rounded-[14px] sm:rounded-[18px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={alt} width={w} height={h} className="block h-auto w-full" />
        </div>
      </div>
    </div>
  );
}

