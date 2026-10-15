import { join } from "node:path";

/** Scripts, tests and astro all run with docs/ as the working directory. */
export const OPENAPI_PATH = join(process.cwd(), "src/data/public-openapi.json");
export const ERROR_PAGES_DIR = join(process.cwd(), "src/content/docs/developers/errors");
export const DIST_DIR = join(process.cwd(), "dist");
