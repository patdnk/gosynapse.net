/**
 * Marketing-facing view of what each kind of venue switches on.
 *
 * Deliberately a copy of the product's venue profiles rather than an import:
 * the marketing site deploys on its own and shouldn't be coupled to the
 * workspace packages, and the sales framing is allowed to differ from the
 * internal module enum.
 */

export type ModuleKey =
  | "pos"
  | "catalogue"
  | "floorplan"
  | "routing"
  | "kds"
  | "bookings"
  | "members"
  | "loyalty"
  | "inventory"
  | "payments"
  | "reports"
  | "integrations";

export const MODULES: { key: ModuleKey; label: string; blurb: string }[] = [
  { key: "pos", label: "POS & tills", blurb: "iPad tills, checks, splits and tips" },
  { key: "catalogue", label: "Catalogue", blurb: "Menus, recipes, modifiers and pricing" },
  { key: "floorplan", label: "Floor plans", blurb: "Design rooms and follow service live" },
  { key: "routing", label: "Order routing", blurb: "Send orders to the right station or printer" },
  { key: "kds", label: "Kitchen display", blurb: "Screens in the pass instead of paper" },
  { key: "bookings", label: "Bookings", blurb: "Reservations, availability and covers" },
  { key: "members", label: "Membership & CRM", blurb: "Applications, dues and member records" },
  { key: "loyalty", label: "Loyalty", blurb: "Points, credit and rewards" },
  { key: "inventory", label: "Stock & reordering", blurb: "Live stock with predictive reorder points" },
  { key: "payments", label: "Payments", blurb: "Card-present, online and payouts" },
  { key: "reports", label: "Insights", blurb: "Sales, covers and retention analytics" },
  { key: "integrations", label: "Integrations", blurb: "SevenRooms, wallets, accounting" },
];

export interface Venue {
  key: string;
  label: string;
  icon: string;
  summary: string;
  /** Switched on by default for this kind of venue. */
  recommended: ModuleKey[];
  /** Why the rest are usually left off — the interesting half. */
  skipped: { key: ModuleKey; why: string }[];
}

const ALWAYS: ModuleKey[] = ["pos", "catalogue", "payments", "reports"];

export const VENUES: Venue[] = [
  {
    key: "restaurants",
    label: "Restaurants",
    icon: "utensils",
    summary: "Table service, covers and a kitchen to keep in step.",
    recommended: [...ALWAYS, "floorplan", "routing", "kds", "inventory", "bookings"],
    skipped: [
      { key: "members", why: "Guests pay per visit — no membership to administer" },
      { key: "loyalty", why: "Optional; most restaurants start without it" },
      { key: "integrations", why: "Add when you connect a booking or accounts system" },
    ],
  },
  {
    key: "bars",
    label: "Bars",
    icon: "glass",
    summary: "Fast counter trade, walk-ins and tabs — rarely a table plan.",
    recommended: [...ALWAYS, "routing", "inventory"],
    skipped: [
      { key: "floorplan", why: "Served at the bar, so there's no table to assign" },
      { key: "bookings", why: "Walk-in trade — nothing to reserve" },
      { key: "kds", why: "Drinks are made in front of the guest" },
      { key: "members", why: "No membership to administer" },
      { key: "loyalty", why: "Optional — useful for regulars" },
      { key: "integrations", why: "Rarely needed for a single bar" },
    ],
  },
  {
    key: "members-clubs",
    label: "Members' clubs",
    icon: "crm",
    summary: "Membership, dues and house rules on top of full service.",
    recommended: [...ALWAYS, "floorplan", "routing", "kds", "bookings", "members", "loyalty", "inventory", "integrations"],
    skipped: [],
  },
  {
    key: "hotels",
    label: "Hotels",
    icon: "bed",
    summary: "Several F&B outlets, plus charges that land on the room.",
    recommended: [...ALWAYS, "floorplan", "routing", "kds", "bookings", "members", "inventory", "integrations"],
    skipped: [{ key: "loyalty", why: "Usually run by the hotel group's own scheme" }],
  },
  {
    key: "events",
    label: "Events",
    icon: "ticket",
    summary: "Temporary bars, big crowds, short trading windows.",
    recommended: [...ALWAYS, "routing", "inventory", "bookings"],
    skipped: [
      { key: "floorplan", why: "Pop-up service points, not a fixed room" },
      { key: "kds", why: "Limited menu, made at the point of sale" },
      { key: "members", why: "Ticket holders, not members" },
      { key: "loyalty", why: "Little repeat trade within one event" },
      { key: "integrations", why: "Add for ticketing platforms" },
    ],
  },
  {
    key: "spas",
    label: "Spas",
    icon: "sparkle",
    summary: "Appointments and treatments, with retail alongside.",
    recommended: [...ALWAYS, "bookings", "members", "loyalty", "inventory"],
    skipped: [
      { key: "kds", why: "No kitchen" },
      { key: "routing", why: "Nothing to send to a prep station" },
      { key: "floorplan", why: "Treatment rooms are booked, not seated" },
      { key: "integrations", why: "Add for spa-management systems" },
    ],
  },
  {
    key: "galleries",
    label: "Galleries",
    icon: "frame",
    summary: "Timed entry, a shop, and usually a café.",
    recommended: [...ALWAYS, "bookings", "inventory"],
    skipped: [
      { key: "floorplan", why: "Counter service in the café" },
      { key: "kds", why: "Light food offer" },
      { key: "routing", why: "Made behind the counter" },
      { key: "members", why: "Ticketing rather than membership" },
      { key: "loyalty", why: "Optional — works well for supporters" },
      { key: "integrations", why: "Add for ticketing" },
    ],
  },
  {
    key: "cinemas",
    label: "Cinemas",
    icon: "film",
    summary: "Concessions against showtimes — throughput is everything.",
    recommended: [...ALWAYS, "routing", "inventory", "loyalty", "bookings"],
    skipped: [
      { key: "floorplan", why: "Seats belong to the screening, not the till" },
      { key: "kds", why: "Concessions are prepared at the counter" },
      { key: "members", why: "Usually a subscription scheme rather than membership" },
      { key: "integrations", why: "Add for ticketing systems" },
    ],
  },
  {
    key: "gyms",
    label: "Gyms",
    icon: "dumbbell",
    summary: "Memberships and classes, with a café or shop attached.",
    recommended: [...ALWAYS, "bookings", "members", "loyalty", "inventory"],
    skipped: [
      { key: "kds", why: "No kitchen" },
      { key: "floorplan", why: "Nothing to seat" },
      { key: "routing", why: "Served straight from the counter" },
      { key: "integrations", why: "Add for class or access systems" },
    ],
  },
  {
    key: "stadia",
    label: "Stadia",
    icon: "flag",
    summary: "Dozens of kiosks, enormous peaks, unforgiving windows.",
    recommended: [...ALWAYS, "routing", "inventory"],
    skipped: [
      { key: "bookings", why: "The ticket is the reservation" },
      { key: "floorplan", why: "Kiosk service" },
      { key: "kds", why: "Prepared at the kiosk" },
      { key: "members", why: "Handled by the club's own membership system" },
      { key: "loyalty", why: "Usually the club's existing scheme" },
      { key: "integrations", why: "Add for ticketing and access control" },
    ],
  },
];
