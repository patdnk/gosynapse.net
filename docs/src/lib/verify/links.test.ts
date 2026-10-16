import { describe, expect, it } from "vitest";
import { findBrokenLinks, missingPages } from "./links";

const have = new Set(["index.html", "developers/index.html", "developers/errors/not_found/index.html", "_astro/a.css", "favicon.svg"]);
const exists = (p: string) => have.has(p);

describe("findBrokenLinks under /docs", () => {
  it("resolves /docs/… links against dist/ with the prefix stripped", () => {
    const html = '<a href="/docs/developers/">x</a><link href="/docs/_astro/a.css"><link href="/docs/favicon.svg"><a href="/docs/developers/nope/">x</a><a href="/docs/developers/errors/not_found/#fix">x</a>';
    expect(findBrokenLinks([{ path: "a.html", text: html }], exists, "/docs")).toEqual([
      { file: "a.html", rule: "broken-link", match: "/docs/developers/nope/" },
    ]);
  });

  it("flags internal links that leave the docs, such as a markdown link written without /docs", () => {
    const html = '<a href="/developers/errors/">x</a><a href="/docsearch/">y</a><a href="/docs">z</a><a href="https://gosynapse.net/">ok</a><a href="mailto:a@b.c">ok</a><a href="#top">ok</a>';
    expect(findBrokenLinks([{ path: "a.html", text: html }], exists, "/docs")).toEqual([
      { file: "a.html", rule: "outside-docs", match: "/developers/errors/" },
      { file: "a.html", rule: "outside-docs", match: "/docsearch/" },
    ]);
  });

  it("flags relative links and images, which resolve against the page's own URL", () => {
    const html =
      '<a href="pagination/">x</a><img src="screenshots/a.png"><a href="../errors/">y</a><a href="">z</a>' +
      '<a href="/docs/developers/">ok</a><a href="#top">ok</a><a href="https://gosynapse.net/">ok</a><a href="mailto:a@b.c">ok</a><img src="data:image/png;base64,AA">';
    expect(findBrokenLinks([{ path: "a.html", text: html }], exists, "/docs")).toEqual([
      { file: "a.html", rule: "relative-link", match: "pagination/" },
      { file: "a.html", rule: "relative-link", match: "screenshots/a.png" },
      { file: "a.html", rule: "relative-link", match: "../errors/" },
      { file: "a.html", rule: "relative-link", match: "" },
    ]);
  });

  it("only reads HTML files", () => {
    expect(findBrokenLinks([{ path: "a.js", text: 'href="/nope/"' }], exists, "/docs")).toEqual([]);
  });
});

describe("missingPages", () => {
  it("reports each required page that was not built", () => {
    expect(missingPages(["/developers/", "/errors/not_found/"], exists)).toEqual([
      { file: "errors/not_found/index.html", rule: "missing-page", match: "/errors/not_found/" },
    ]);
  });
});
