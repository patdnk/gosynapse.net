import { describe, expect, it } from "vitest";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { checkOpenApi, readSynapseExport } from "./sync";

const doc = (extra: Record<string, unknown>) =>
  JSON.stringify({ openapi: "3.0.3", paths: { "/public/v1/me": {} }, ...extra });
const codes = { not_found: { status: 404, title: "Not found", explanation: "x", fix: "y" } };
const scopes = [{ scope: "members:read", group: "Members", label: "Read members" }];

describe("checkOpenApi", () => {
  it("accepts a synapse export with paths, error codes and scopes", () => {
    expect(() => checkOpenApi(doc({ "x-error-codes": codes, "x-scopes": scopes }))).not.toThrow();
  });

  it("refuses an export without x-scopes, which an older synapse would produce", () => {
    expect(() => checkOpenApi(doc({ "x-error-codes": codes }))).toThrow(/x-scopes/);
  });

  it("refuses an export without x-error-codes", () => {
    expect(() => checkOpenApi(doc({ "x-scopes": scopes }))).toThrow(/x-error-codes/);
  });

  it("refuses a file that is not JSON", () => {
    expect(() => checkOpenApi("<html>")).toThrow(/not JSON/);
  });
});

describe("readSynapseExport", () => {
  const git = (dir: string, ...args: string[]) => execFileSync("git", ["-C", dir, ...args], { encoding: "utf8" }).trim();

  it("reads the committed file at the ref, never the working tree, and names the commit", () => {
    const dir = mkdtempSync(join(tmpdir(), "synapse-"));
    try {
      git(dir, "init", "-q", "-b", "main");
      mkdirSync(join(dir, "docs"));
      writeFileSync(join(dir, "docs/public-openapi.json"), '{"released":true}');
      git(dir, "add", "-A");
      git(dir, "-c", "user.name=t", "-c", "user.email=t@t", "commit", "-q", "-m", "release");
      // An unreleased change on a feature branch checkout must not leak into the public copy.
      writeFileSync(join(dir, "docs/public-openapi.json"), '{"released":false}');
      const out = readSynapseExport(dir, "main");
      expect(out.json).toBe('{"released":true}');
      expect(out.commit).toBe(git(dir, "rev-parse", "--short", "main"));
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("explains a ref that does not exist", () => {
    const dir = mkdtempSync(join(tmpdir(), "synapse-"));
    try {
      git(dir, "init", "-q", "-b", "main");
      expect(() => readSynapseExport(dir, "origin/main")).toThrow(/origin\/main.*fetch/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
