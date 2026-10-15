import { describe, expect, it } from "vitest";
import { checkOpenApi } from "./sync";

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
