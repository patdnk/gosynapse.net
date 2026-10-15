/**
 * Runs after astro build (see the build script) and in pages.yml. Fails if
 * dist/ contains a key, a local URL or a build-machine path, links to a page
 * that was not built or outside /docs, or lacks a page partners are promised.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { loadErrorCodes } from "../src/lib/error-codes.ts";
import { DIST_DIR } from "../src/lib/paths.ts";
import { BASE_PATH } from "../src/lib/site.ts";
import { findLeaks, type Finding, type OutFile } from "../src/lib/verify/leaks.ts";
import { findBrokenLinks, missingPages } from "../src/lib/verify/links.ts";

const TEXT = /\.(?:html|txt|md|json|js|mjs|css|xml|svg)$/;

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

const rel = (p: string) => relative(DIST_DIR, p).split(sep).join("/");
const files: OutFile[] = walk(DIST_DIR)
  .map(rel)
  .filter((p) => TEXT.test(p))
  .map((p) => ({ path: p, text: readFileSync(join(DIST_DIR, p), "utf8") }));
const exists = (p: string) => existsSync(join(DIST_DIR, p)) && statSync(join(DIST_DIR, p)).isFile();

const required = [
  "/developers/",
  "/developers/authentication/",
  "/developers/errors/",
  "/developers/reference/operations/getme/",
  ...Object.keys(loadErrorCodes()).flatMap((c) => [`/developers/errors/${c}/`, `/errors/${c}/`]),
];

const findings: Finding[] = [...findLeaks(files), ...findBrokenLinks(files, exists, BASE_PATH), ...missingPages(required, exists)];

if (findings.length > 0) {
  for (const f of findings) console.error(`✗ ${f.rule}  ${f.file}  ${f.match}`);
  console.error(`\nverify: ${findings.length} problem(s) in dist/ — not deployable.`);
  process.exit(1);
}
console.log(`verify: ${files.length} files clean; ${required.length} required pages present.`);
