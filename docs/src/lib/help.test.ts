import { describe, expect, it } from "vitest";
import { HELP_GROUPS, MODULE_LABELS, MODULE_VALUES, PRODUCT_LABELS, PRODUCT_VALUES, ROLE_LABELS, ROLE_VALUES, articleCount, articlesOf, helpSidebar, helpTiles, isHelpArticle, requirements } from "./help.ts";

describe("value lists", () => {
  it("mirror synapse's roles, modules and products, each with a label", () => {
    expect([...ROLE_VALUES]).toEqual(["WAITER", "MANAGER", "ADMIN", "FINANCIAL", "PURCHASER"]);
    expect(MODULE_VALUES).toHaveLength(19);
    expect([...PRODUCT_VALUES].sort()).toEqual(["catalogue", "crm", "insights", "payments", "pos"]);
    for (const r of ROLE_VALUES) expect(ROLE_LABELS[r]).toBeTruthy();
    for (const m of MODULE_VALUES) expect(MODULE_LABELS[m]).toBeTruthy();
    for (const p of PRODUCT_VALUES) expect(PRODUCT_LABELS[p]).toBeTruthy();
  });
});

describe("HELP_GROUPS", () => {
  const slugs = HELP_GROUPS.flatMap((g) => g.categories.map((c) => c.slug));

  it("has unique, path-safe slugs, each with a title and a description", () => {
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const c of HELP_GROUPS.flatMap((g) => g.categories)) {
      expect(c.slug).toMatch(/^[a-z]+(?:-[a-z]+)*$/);
      expect(c.title.length, c.slug).toBeGreaterThan(0);
      expect(c.description.length, c.slug).toBeGreaterThan(0);
    }
  });

  it("puts Getting started first, with no group heading", () => {
    expect(HELP_GROUPS[0]).toMatchObject({ title: null });
    expect(slugs[0]).toBe("getting-started");
  });
});

describe("requirements", () => {
  it("lists roles in the admin's order with its labels, and the module's label", () => {
    expect(requirements({ roles: ["ADMIN", "WAITER", "MANAGER"], module: "bookings" })).toEqual({
      who: "Waiter, Manager, Admin",
      requires: "Bookings",
    });
  });

  it("names the product when there is no module", () => {
    expect(requirements({ roles: ["FINANCIAL"], product: "crm" })).toEqual({ who: "Financial", requires: "CRM" });
  });

  it("returns nothing for a page without them", () => {
    expect(requirements({})).toEqual({ who: null, requires: null });
  });
});

describe("isHelpArticle", () => {
  it("is a page inside a help category, not the help home, a category page or a Developers page", () => {
    expect(isHelpArticle("help/bookings/take-a-booking")).toBe(true);
    expect(isHelpArticle("help/bookings")).toBe(false);
    expect(isHelpArticle("help")).toBe(false);
    expect(isHelpArticle("developers/errors/not_found")).toBe(false);
  });
});

const entry = (id: string, title: string, order?: number) => ({ id, data: { title, description: `${title}.`, sidebar: { order } } });
const entries = [
  entry("help/getting-started/b", "B", 2),
  entry("help/getting-started/a", "A", 1),
  entry("help/checks/x", "X"),
  entry("help/bookings/y", "Y", 1),
  entry("developers/index", "Introduction"),
];

describe("articlesOf", () => {
  it("returns a category's articles in sidebar order", () => {
    expect(articlesOf(entries, "getting-started").map((e) => e.id)).toEqual(["help/getting-started/a", "help/getting-started/b"]);
    expect(articlesOf(entries, "staff")).toEqual([]);
  });
});

describe("helpTiles", () => {
  it("has one tile per category with articles, under its group, and drops empty groups", () => {
    expect(helpTiles(entries)).toEqual([
      { title: null, tiles: [{ slug: "getting-started", title: "Getting started", description: expect.any(String), articles: 2 }] },
      { title: "POS", tiles: [{ slug: "checks", title: "Checks", description: expect.any(String), articles: 1 }] },
      { title: "CRM", tiles: [{ slug: "bookings", title: "Bookings", description: expect.any(String), articles: 1 }] },
    ]);
  });
});

describe("helpSidebar", () => {
  it("links the help home, then nests categories with articles under their group", () => {
    const has = (slug: string) => ["getting-started", "bookings"].includes(slug);
    expect(helpSidebar(has)).toEqual([
      {
        label: "Help Centre",
        items: [
          { label: "All topics", link: "/help/" },
          { label: "Getting started", collapsed: false, items: [{ autogenerate: { directory: "help/getting-started" } }] },
          { label: "CRM", items: [{ label: "Bookings", collapsed: true, items: [{ autogenerate: { directory: "help/bookings" } }] }] },
        ],
      },
    ]);
  });
});

describe("articleCount", () => {
  it("says article or articles", () => {
    expect(articleCount(1)).toBe("1 article");
    expect(articleCount(3)).toBe("3 articles");
  });
});
