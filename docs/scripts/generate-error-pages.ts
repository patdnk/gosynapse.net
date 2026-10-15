/**
 * Writes src/content/docs/developers/errors/<code>.mdx, one per entry in
 * src/data/public-openapi.json's x-error-codes. Gitignored; rewritten before
 * every dev, check and build, so a new code gets its page with no manual step.
 */
import { mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { loadErrorCodes, renderErrorPage } from "../src/lib/error-codes.ts";
import { ERROR_PAGES_DIR } from "../src/lib/paths.ts";

const codes = loadErrorCodes();
mkdirSync(ERROR_PAGES_DIR, { recursive: true });
for (const f of readdirSync(ERROR_PAGES_DIR)) {
  if (f.endsWith(".mdx") && f !== "index.mdx") rmSync(join(ERROR_PAGES_DIR, f));
}
for (const [code, e] of Object.entries(codes)) {
  writeFileSync(join(ERROR_PAGES_DIR, `${code}.mdx`), renderErrorPage(code, e));
}
console.log(`error pages: ${Object.keys(codes).length} → src/content/docs/developers/errors/`);
