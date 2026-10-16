import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { docsLoader } from "@astrojs/starlight/loaders";
import { docsSchema } from "@astrojs/starlight/schema";
import { MODULE_VALUES, PRODUCT_VALUES, ROLE_VALUES } from "./lib/help.ts";

/**
 * Help articles add who can do them (roles) and the licence the page needs
 * (module, or product when it is core to a product). An unknown value fails the build.
 */
export const collections = {
  docs: defineCollection({
    loader: docsLoader(),
    schema: docsSchema({
      extend: z
        .object({
          roles: z.array(z.enum(ROLE_VALUES)).min(1).optional(),
          module: z.enum(MODULE_VALUES).optional(),
          product: z.enum(PRODUCT_VALUES).optional(),
        })
        .refine((d) => !(d.module && d.product), {
          message: "Set module or product, not both: a module already implies its product",
          path: ["product"],
        }),
    }),
  }),
};
