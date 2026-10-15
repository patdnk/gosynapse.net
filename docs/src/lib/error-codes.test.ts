import { describe, expect, it } from "vitest";
import { escapeMdx, loadErrorCodes, renderErrorPage } from "./error-codes";

const doc = (codes: unknown) => JSON.stringify({ openapi: "3.0.3", paths: {}, "x-error-codes": codes });
const sample = { status: 404, title: "Not found", explanation: "No such {thing} <here>.", fix: "Check the ID." };

describe("loadErrorCodes", () => {
  it("reads x-error-codes from the OpenAPI document", () => {
    expect(loadErrorCodes(doc({ not_found: sample }))).toEqual({ not_found: sample });
  });

  it("fails loudly when the registry is missing, rather than publishing no error pages", () => {
    expect(() => loadErrorCodes(doc(undefined))).toThrow(/x-error-codes/);
  });

  it("rejects codes that are not safe as a path segment", () => {
    expect(() => loadErrorCodes(doc({ "../etc": sample }))).toThrow(/\.\.\/etc/);
  });

  it("reads the committed copy, which has at least the M0 codes", () => {
    const codes = loadErrorCodes();
    for (const c of ["not_found", "invalid_api_key", "insufficient_scope", "rate_limited", "validation_failed"]) {
      expect(codes).toHaveProperty(c);
    }
  });
});

describe("escapeMdx", () => {
  it("escapes the characters MDX treats as JSX or expressions, and backslash first", () => {
    expect(escapeMdx("a {b} <c> d")).toBe("a \\{b\\} \\<c\\> d");
    expect(escapeMdx("x \\{ y")).toBe("x \\\\\\{ y");
  });
});

describe("renderErrorPage", () => {
  it("writes frontmatter, the status line and both sections, escaped", () => {
    expect(renderErrorPage("not_found", sample)).toBe(
      [
        "---",
        'title: "not_found"',
        'description: "HTTP 404 · Not found"',
        "---",
        "",
        "**HTTP 404** · Not found",
        "",
        "## What it means",
        "",
        "No such \\{thing\\} \\<here\\>.",
        "",
        "## How to fix it",
        "",
        "Check the ID.",
        "",
      ].join("\n"),
    );
  });

  it("quotes titles safely in frontmatter", () => {
    expect(renderErrorPage("x_y", { ...sample, title: 'Say "hi": now' })).toContain('description: "HTTP 404 · Say \\"hi\\": now"');
  });
});
