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
