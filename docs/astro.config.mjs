// @ts-check
import { defineConfig } from "astro/config";
import { existsSync, readdirSync } from "node:fs";
import starlight from "@astrojs/starlight";
import { helpSidebar } from "./src/lib/help.ts";
import starlightOpenAPI, { openAPISidebarGroups } from "starlight-openapi";

// A help category is listed once its folder has an article.
const helpDir = new URL("./src/content/docs/help/", import.meta.url);
/** @param {string} slug */
const hasArticles = (slug) => {
  const dir = new URL(`${slug}/`, helpDir);
  return existsSync(dir) && readdirSync(dir).some((f) => f.endsWith(".mdx"));
};

// Served at https://gosynapse.net/docs: pages.yml copies dist/ into the marketing
// site's out/docs/. Keep `base` in step with BASE_PATH in src/lib/site.ts.
export default defineConfig({
  site: "https://gosynapse.net",
  base: "/docs",
  trailingSlash: "always",
  integrations: [
    starlight({
      title: "Synapse Docs",
      favicon: "/favicon.svg",
      social: [{ icon: "external", label: "gosynapse.net", href: "https://gosynapse.net" }],
      components: { Footer: "./src/components/Footer.astro", PageTitle: "./src/components/PageTitle.astro" },
      plugins: [
        starlightOpenAPI([
          { base: "developers/reference", schema: "./src/data/public-openapi.json", sidebar: { label: "API reference" } },
        ]),
      ],
      sidebar: [
        ...helpSidebar(hasArticles),
        {
          label: "Developers",
          items: [
            "developers",
            "developers/authentication",
            { label: "Errors", items: [{ autogenerate: { directory: "developers/errors" } }] },
            "developers/pagination",
            "developers/idempotency",
            "developers/rate-limits",
            "developers/conventions",
            "developers/webhooks",
          ],
        },
        ...openAPISidebarGroups,
      ],
    }),
  ],
});
