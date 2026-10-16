// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import starlightOpenAPI, { openAPISidebarGroups } from "starlight-openapi";

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
