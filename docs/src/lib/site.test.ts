import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { BASE_PATH, SITE_URL, absoluteUrl, withBase } from "./site";

describe("site paths", () => {
  it("serves the docs under gosynapse.net/docs", () => {
    expect(BASE_PATH).toBe("/docs");
    expect(SITE_URL).toBe("https://gosynapse.net");
  });

  it("prefixes site paths with the base path, once", () => {
    expect(withBase("/developers/")).toBe("/docs/developers/");
    expect(withBase("/")).toBe("/docs/");
    expect(withBase("/docs/developers/")).toBe("/docs/developers/");
  });

  it("refuses paths that are not site-absolute", () => {
    expect(() => withBase("developers/")).toThrow(/must start with \//);
  });

  it("builds absolute URLs on the public site", () => {
    expect(absoluteUrl("/developers/errors/not_found/")).toBe("https://gosynapse.net/docs/developers/errors/not_found/");
  });

  it("matches the base astro.config.mjs builds with", () => {
    const config = readFileSync(join(process.cwd(), "astro.config.mjs"), "utf8");
    expect(config).toContain(`base: "${BASE_PATH}"`);
  });
});
