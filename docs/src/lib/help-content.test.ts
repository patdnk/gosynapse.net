import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { describe, expect, it } from "vitest";
import { HELP_GROUPS } from "./help.ts";
import { HELP_DIR, SCREENSHOTS_DIR } from "./paths.ts";

const walk = (dir: string): string[] =>
  existsSync(dir) ? readdirSync(dir).flatMap((n) => (statSync(join(dir, n)).isDirectory() ? walk(join(dir, n)) : [join(dir, n)])) : [];
const known = new Set(HELP_GROUPS.flatMap((g) => g.categories.map((c) => c.slug)));
const articles = walk(HELP_DIR).filter((f) => f.endsWith(".mdx"));
const frontmatter = (f: string) => /^---\n([\s\S]*?)\n---/.exec(readFileSync(f, "utf8"))?.[1] ?? "";

describe("src/content/docs/help", () => {
  it("has only folders that HELP_GROUPS knows, one level deep", () => {
    const folders = existsSync(HELP_DIR) ? readdirSync(HELP_DIR) : [];
    expect(folders.filter((f) => !known.has(f))).toEqual([]);
    expect(articles.filter((f) => relative(HELP_DIR, f).split(sep).length !== 2)).toEqual([]);
  });

  it("gives every article roles and a sidebar order, so pages and lists are stable", () => {
    for (const f of articles) {
      const fm = frontmatter(f);
      expect(fm, relative(HELP_DIR, f)).toMatch(/^roles: \[/m);
      expect(fm, relative(HELP_DIR, f)).toMatch(/^sidebar:\n {2}order: \d+$/m);
    }
  });
});

describe("screenshots", () => {
  const mdx = articles.map((f) => readFileSync(f, "utf8")).join("\n");
  const referenced = new Set([...mdx.matchAll(/\]\(\/docs(\/screenshots\/[^)\s]+)\)/g)].map((m) => m[1]!));
  const files = walk(SCREENSHOTS_DIR).map((f) => `/screenshots/${relative(SCREENSHOTS_DIR, f).split(sep).join("/")}`);

  it("are all PNGs an article uses, and every one an article uses exists", () => {
    expect(files.filter((f) => !f.endsWith(".png"))).toEqual([]);
    expect(files.filter((f) => !referenced.has(f))).toEqual([]);
    expect([...referenced].filter((r) => !files.includes(r))).toEqual([]);
  });

  it("are referenced with /docs, since Astro does not prefix markdown images", () => {
    expect([...mdx.matchAll(/\]\((\/screenshots\/[^)\s]+)\)/g)].map((m) => m[1])).toEqual([]);
  });

  it("stay small enough to commit: 1 MB each, 30 MB in all", () => {
    const sizes = walk(SCREENSHOTS_DIR).map((f) => ({ f: relative(SCREENSHOTS_DIR, f), bytes: statSync(f).size }));
    expect(sizes.filter((s) => s.bytes > 1_000_000)).toEqual([]);
    expect(sizes.reduce((n, s) => n + s.bytes, 0)).toBeLessThanOrEqual(30_000_000);
  });
});
