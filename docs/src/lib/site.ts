/**
 * The docs are served at https://gosynapse.net/docs. Astro prefixes its own
 * asset and Starlight navigation URLs, but not markdown links or URLs we build
 * ourselves: those go through withBase. Keep in step with `base` in astro.config.mjs.
 */
export const BASE_PATH = "/docs";
export const SITE_URL = "https://gosynapse.net";

export function withBase(path: string): string {
  if (!path.startsWith("/")) throw new Error(`Site path must start with /: ${JSON.stringify(path)}`);
  if (path === BASE_PATH || path.startsWith(`${BASE_PATH}/`)) return path;
  return `${BASE_PATH}${path}`;
}

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${withBase(path)}`;
}
