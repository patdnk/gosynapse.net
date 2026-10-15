/**
 * Copies synapse's public API contract into this repo. Synapse is private and
 * is the source of truth; run this after an API change there, then commit.
 *
 *   pnpm --dir docs sync-api            (expects ../synapse beside this repo)
 *   SYNAPSE_DIR=/path/to/synapse pnpm --dir docs sync-api
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { checkOpenApi } from "../src/lib/sync.ts";
import { OPENAPI_PATH } from "../src/lib/paths.ts";

const synapse = process.env.SYNAPSE_DIR ?? join(process.cwd(), "../../synapse");
const source = join(synapse, "docs/public-openapi.json");
const json = readFileSync(source, "utf8");
checkOpenApi(json);
const before = (() => {
  try {
    return readFileSync(OPENAPI_PATH, "utf8");
  } catch {
    return "";
  }
})();
writeFileSync(OPENAPI_PATH, json);
console.log(before === json ? "sync-api: already up to date" : `sync-api: updated from ${source} — review and commit src/data/public-openapi.json`);
