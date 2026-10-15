/**
 * Copies synapse's released public API contract into this repo. Synapse is
 * private and is the source of truth. This reads the file as committed at
 * SYNAPSE_REF (default origin/main), never the checkout's working tree, so an
 * unreleased feature branch cannot leak into this public repo.
 *
 *   git -C ../synapse fetch && pnpm --dir docs sync-api
 *   SYNAPSE_DIR=/path/to/synapse SYNAPSE_REF=origin/main pnpm --dir docs sync-api
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { checkOpenApi, readSynapseExport } from "../src/lib/sync.ts";
import { OPENAPI_PATH } from "../src/lib/paths.ts";

const dir = resolve(process.env.SYNAPSE_DIR ?? "../../synapse");
const ref = process.env.SYNAPSE_REF ?? "origin/main";
const { json, commit } = readSynapseExport(dir, ref);
checkOpenApi(json);
const before = (() => {
  try {
    return readFileSync(OPENAPI_PATH, "utf8");
  } catch {
    return "";
  }
})();
writeFileSync(OPENAPI_PATH, json);
console.log(
  before === json
    ? `sync-api: already up to date with synapse ${ref} @ ${commit}`
    : `sync-api: updated from synapse ${ref} @ ${commit} — review and commit src/data/public-openapi.json`,
);
