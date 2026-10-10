import type { MetadataRoute } from "next";

// Generated once at build time (required for the static export).
export const dynamic = "force-static";

// The tour is shared on request, so keep it out of search indexes. (Belt and
// braces alongside the noindex metadata on the page itself — a crawler that
// never fetches the page can't read the meta tag.)
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/tour"] },
  };
}
