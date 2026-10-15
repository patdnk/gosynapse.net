import { readFileSync } from "node:fs";
import { OPENAPI_PATH } from "./paths.ts";

/** Mirrors ErrorCodeDoc in synapse apps/api/src/public/problem.ts. */
export interface ErrorCodeDoc {
  status: number;
  title: string;
  explanation: string;
  fix: string;
}

const CODE = /^[a-z][a-z_]*[a-z]$/;

export function loadErrorCodes(json: string = readFileSync(OPENAPI_PATH, "utf8")): Record<string, ErrorCodeDoc> {
  const codes = (JSON.parse(json) as { "x-error-codes"?: Record<string, ErrorCodeDoc> })["x-error-codes"];
  if (!codes || typeof codes !== "object") {
    throw new Error("src/data/public-openapi.json has no x-error-codes. Run: pnpm --dir docs sync-api");
  }
  for (const code of Object.keys(codes)) {
    if (!CODE.test(code)) throw new Error(`Error code ${JSON.stringify(code)} is not a safe page name`);
  }
  return codes;
}

/** MDX reads { } as expressions and < > as JSX; backslash first, so an existing escape stays literal. */
export function escapeMdx(s: string): string {
  return s.replace(/[\\{}<>]/g, (c) => `\\${c}`);
}

export function renderErrorPage(code: string, e: ErrorCodeDoc): string {
  return [
    "---",
    `title: ${JSON.stringify(code)}`,
    `description: ${JSON.stringify(`HTTP ${e.status} · ${e.title}`)}`,
    "---",
    "",
    `**HTTP ${e.status}** · ${escapeMdx(e.title)}`,
    "",
    "## What it means",
    "",
    escapeMdx(e.explanation),
    "",
    "## How to fix it",
    "",
    escapeMdx(e.fix),
    "",
  ].join("\n");
}
