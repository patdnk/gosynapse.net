import type { Finding, OutFile } from "./leaks.ts";

const ATTR = /\s(?:href|src)="(\/[^"]*)"/g;

/**
 * Files in dist/ that would serve a URL on GitHub Pages, most likely first.
 * "/a/b/" → ["a/b/index.html"]; "/a/b" → ["a/b", "a/b/index.html"] (Pages
 * redirects a directory to its slash form). Query and hash dropped.
 */
export function toOutPaths(url: string): string[] {
  const p = decodeURI(url.split(/[?#]/)[0] ?? "").replace(/^\//, "");
  return p === "" || p.endsWith("/") ? [`${p}index.html`] : [p, `${p}/index.html`];
}

/**
 * Internal links that would 404 once dist/ is served under basePath. A link
 * outside basePath points into the marketing site, which this build cannot
 * see — usually a markdown link written without /docs.
 */
export function findBrokenLinks(files: OutFile[], exists: (path: string) => boolean, basePath = ""): Finding[] {
  const out: Finding[] = [];
  for (const f of files) {
    if (!f.path.endsWith(".html")) continue;
    const seen = new Set<string>();
    for (const m of f.text.matchAll(ATTR)) {
      const url = m[1]!;
      if (url.startsWith("//") || seen.has(url)) continue;
      seen.add(url);
      let local = url;
      if (basePath) {
        const inside = url === basePath || [`${basePath}/`, `${basePath}?`, `${basePath}#`].some((p) => url.startsWith(p));
        if (!inside) {
          out.push({ file: f.path, rule: "outside-docs", match: url });
          continue;
        }
        local = url.slice(basePath.length) || "/";
      }
      if (!toOutPaths(local).some(exists)) out.push({ file: f.path, rule: "broken-link", match: url });
    }
  }
  return out;
}

export function missingPages(requiredPaths: string[], exists: (path: string) => boolean): Finding[] {
  return requiredPaths
    .filter((url) => !toOutPaths(url).some(exists))
    .map((url) => ({ file: toOutPaths(url).at(-1)!, rule: "missing-page", match: url }));
}
