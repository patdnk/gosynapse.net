import { execFileSync } from "node:child_process";

/** A synapse public-openapi.json is usable only with its docs extensions. */
export function checkOpenApi(json: string): void {
  let doc: Record<string, unknown>;
  try {
    doc = JSON.parse(json) as Record<string, unknown>;
  } catch {
    throw new Error("public-openapi.json is not JSON");
  }
  const missing = ["paths", "x-error-codes", "x-scopes"].filter((k) => doc[k] === undefined);
  if (missing.length > 0) {
    throw new Error(`public-openapi.json lacks ${missing.join(", ")}: regenerate it in synapse (pnpm --filter @pos/api docs:public-openapi)`);
  }
}

/**
 * The contract as committed at `ref` in a synapse checkout — never its working
 * tree, which may be a feature branch with unreleased endpoints. This repo is
 * public: only what synapse has released belongs here.
 */
export function readSynapseExport(dir: string, ref: string): { json: string; commit: string } {
  const git = (...args: string[]) => execFileSync("git", ["-C", dir, ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  let commit: string;
  try {
    commit = git("rev-parse", "--short", "--verify", `${ref}^{commit}`).trim();
  } catch {
    throw new Error(`${ref} is not a commit in ${dir}; run git -C ${dir} fetch first, or set SYNAPSE_REF`);
  }
  return { json: git("show", `${commit}:docs/public-openapi.json`), commit };
}
