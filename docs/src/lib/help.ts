/**
 * The Help Centre's vocabulary. Article frontmatter (src/content.config.ts),
 * the badges (src/components/PageTitle.astro), the tile grid and category
 * pages (src/pages/help/) and the sidebar (astro.config.mjs) all read it.
 *
 * The value lists mirror the Synapse app: ROLES in packages/shared/src/enums.ts,
 * MODULES, PRODUCTS and their labels in packages/shared/src/schemas/org-config.ts.
 * Add a value here before an article uses it.
 */

export const ROLE_VALUES = ["WAITER", "MANAGER", "ADMIN", "FINANCIAL", "PURCHASER"] as const;
export type Role = (typeof ROLE_VALUES)[number];

export const MODULE_VALUES = [
  "reception",
  "applicants",
  "bookings",
  "guests",
  "events",
  "passes",
  "loyalty",
  "billing",
  "accounts",
  "cloakroom",
  "marketing",
  "integrations",
  "floorplan",
  "layouts",
  "routing",
  "kds",
  "inventory",
  "reports",
  "accounting",
] as const;
export type ModuleKey = (typeof MODULE_VALUES)[number];

export const PRODUCT_VALUES = ["pos", "catalogue", "crm", "payments", "insights"] as const;
export type ProductKey = (typeof PRODUCT_VALUES)[number];

/** As the admin's Staff page shows them. */
export const ROLE_LABELS: Record<Role, string> = {
  WAITER: "Waiter",
  MANAGER: "Manager",
  ADMIN: "Admin",
  FINANCIAL: "Financial",
  PURCHASER: "Purchaser",
};

export const MODULE_LABELS: Record<ModuleKey, string> = {
  reception: "Reception & check-in",
  applicants: "Applicants",
  bookings: "Bookings",
  guests: "Guests & invitations",
  events: "Events",
  passes: "Wallet passes",
  loyalty: "Loyalty",
  billing: "Membership plans & billing",
  accounts: "Member accounts & Direct Debit",
  cloakroom: "Cloakroom",
  marketing: "Marketing & messaging",
  integrations: "Integrations (SevenRooms, Salesforce)",
  floorplan: "Floor plans",
  layouts: "Till layouts",
  routing: "Order routing & printing",
  kds: "Kitchen display",
  inventory: "Inventory & reordering",
  reports: "Reports",
  accounting: "Accounting export (Xero, QuickBooks)",
};

export const PRODUCT_LABELS: Record<ProductKey, string> = {
  pos: "POS",
  catalogue: "Catalogue",
  crm: "CRM",
  payments: "Payments",
  insights: "Insights",
};

export interface HelpCategory {
  /** Folder under src/content/docs/help/ and the URL segment. */
  slug: string;
  title: string;
  /** One line, shown on the tile and the category page. */
  description: string;
}

export interface HelpGroup {
  /** Heading on /help/ and the sidebar; null for the categories shown before any heading. */
  title: string | null;
  categories: readonly HelpCategory[];
}

/**
 * Every Help Centre category, in display order, grouped like the admin's sidebar.
 * A category appears (tile, sidebar entry, category page) once it has an article.
 */
export const HELP_GROUPS: readonly HelpGroup[] = [
  {
    title: null,
    categories: [
      { slug: "getting-started", title: "Getting started", description: "Sign in, check your venue, set up revenue centres and add your team." },
    ],
  },
  {
    title: "POS",
    categories: [
      { slug: "checks", title: "Checks", description: "Find, move, void and reopen the checks your tills open." },
      { slug: "floor-plans", title: "Floor plans", description: "Lay out floors, seating areas and tables, then watch service live." },
    ],
  },
  {
    title: "Catalogue & procurement",
    categories: [
      { slug: "catalogue", title: "Catalogue", description: "Menu items, menus and prices, options and extras, sales groups and VAT." },
    ],
  },
  {
    title: "CRM",
    categories: [
      { slug: "reception", title: "Reception", description: "Sign in to the front-of-house screen, check members in and issue guest and day passes." },
      { slug: "bookings", title: "Bookings", description: "Take table bookings and run the day's list." },
      { slug: "members", title: "Members", description: "Find, add and edit members, and put them on a membership plan." },
      { slug: "wallet-passes", title: "Wallet passes", description: "Design Apple and Google Wallet passes, issue them to members and revoke them." },
    ],
  },
  {
    title: "Admin",
    categories: [
      { slug: "staff", title: "Staff", description: "Roles, passwords and till PINs, and removing someone who has left." },
      { slug: "settings", title: "Settings", description: "Your plan and connectors, paired tills and kitchen screens, and API keys." },
      { slug: "payments-and-tipping", title: "Payments & tipping", description: "Tipping on card payments, card readers and payment processors." },
    ],
  },
];

export interface Requirements {
  /** "Waiter, Manager, Admin", in the admin's role order. */
  who: string | null;
  /** The module's label, or the product's when there is no module. */
  requires: string | null;
}

export function requirements(data: { roles?: readonly Role[]; module?: ModuleKey; product?: ProductKey }): Requirements {
  const roles = data.roles ?? [];
  const who = roles.length > 0 ? ROLE_VALUES.filter((r) => roles.includes(r)).map((r) => ROLE_LABELS[r]).join(", ") : null;
  const requires = data.module ? MODULE_LABELS[data.module] : data.product ? PRODUCT_LABELS[data.product] : null;
  return { who, requires };
}

/** help/<category>/<article>. The help home and category pages are Astro pages whose virtual ids have fewer segments. */
export function isHelpArticle(id: string): boolean {
  return id.startsWith("help/") && id.split("/").length === 3;
}

/** The parts of a docs collection entry the help pages read. */
export interface HelpEntry {
  id: string;
  data: { title: string; description?: string; sidebar: { order?: number } };
}

/** A category's articles, in sidebar order, then by title. */
export function articlesOf<E extends HelpEntry>(entries: readonly E[], slug: string): E[] {
  return entries
    .filter((e) => isHelpArticle(e.id) && e.id.startsWith(`help/${slug}/`))
    .sort((a, b) => (a.data.sidebar.order ?? Infinity) - (b.data.sidebar.order ?? Infinity) || a.data.title.localeCompare(b.data.title));
}

export interface HelpTileGroup {
  title: string | null;
  tiles: { slug: string; title: string; description: string; articles: number }[];
}

/** The /help/ grid: categories with articles, under their group; empty groups dropped. */
export function helpTiles(entries: readonly HelpEntry[]): HelpTileGroup[] {
  return HELP_GROUPS.map((g) => ({
    title: g.title,
    tiles: g.categories
      .map((c) => ({ ...c, articles: articlesOf(entries, c.slug).length }))
      .filter((t) => t.articles > 0),
  })).filter((g) => g.tiles.length > 0);
}

/** The slice of Starlight's sidebar config that helpSidebar produces. */
type SidebarEntry =
  | { label: string; link: string }
  | { autogenerate: { directory: string } }
  | SidebarGroup;
interface SidebarGroup {
  label: string;
  collapsed?: boolean;
  items: SidebarEntry[];
}

/**
 * The Help Centre sidebar, for astro.config.mjs. Starlight adds the base to
 * `link`. Only categories with articles appear, since an autogenerate group
 * over an empty folder would be an empty heading.
 */
export function helpSidebar(hasArticles: (slug: string) => boolean): SidebarGroup[] {
  const group = (c: HelpCategory, collapsed: boolean): SidebarGroup => ({
    label: c.title,
    collapsed,
    items: [{ autogenerate: { directory: `help/${c.slug}` } }],
  });
  return [
    {
      label: "Help Centre",
      items: [
        { label: "All topics", link: "/help/" },
        ...HELP_GROUPS.flatMap((g): SidebarGroup[] => {
          const cats = g.categories.filter((c) => hasArticles(c.slug));
          if (cats.length === 0) return [];
          return g.title === null ? cats.map((c) => group(c, false)) : [{ label: g.title, items: cats.map((c) => group(c, true)) }];
        }),
      ],
    },
  ];
}

export const articleCount = (n: number) => `${n} ${n === 1 ? "article" : "articles"}`;
