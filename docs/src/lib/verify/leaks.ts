/** Anything below in the built site is a leak, whatever put it there. */
export interface OutFile {
  /** Relative to dist/, forward slashes. */
  path: string;
  text: string;
}

export interface Finding {
  file: string;
  rule: string;
  match: string;
}

/** syn_live_/syn_test_ followed by real key characters. "syn_live_…" (ellipsis) and the bare prefix are allowed. */
const API_KEY = /syn_(?:live|test)_[A-Za-z0-9_-]{6,}/g;
/** Kitchen-screen and till tokens planted by the Synapse demo seed. Screenshots and examples must never show one. */
const DEVICE_TOKEN = /\bdev_demo_[a-z0-9]+(?:_[a-z0-9]+)*/g;
const LOCAL_URL = /\b(?:localhost|127\.0\.0\.1|0\.0\.0\.0|[a-z0-9-]+\.localhost)\b/gi;
/** Absolute paths from a build machine (CI runner, a Mac, a temp dir) say nothing a reader needs. */
const BUILD_PATH = /(?:\/home\/runner\/|\/Users\/[^/"'\s]+\/|\/private\/tmp\/|\/private\/var\/folders\/)[^"'\s<]*/g;
/** JS bundles legitimately mention localhost; pages, markdown and search indexes never should. */
const CONTENT_FILE = /\.(?:html|txt|md|json|xml)$/;

export function findLeaks(files: OutFile[]): Finding[] {
  const out: Finding[] = [];
  for (const f of files) {
    for (const m of f.text.matchAll(API_KEY)) out.push({ file: f.path, rule: "api-key", match: m[0] });
    for (const m of f.text.matchAll(DEVICE_TOKEN)) out.push({ file: f.path, rule: "device-token", match: m[0] });
    if (CONTENT_FILE.test(f.path)) {
      for (const m of f.text.matchAll(LOCAL_URL)) out.push({ file: f.path, rule: "local-url", match: m[0] });
      for (const m of f.text.matchAll(BUILD_PATH)) out.push({ file: f.path, rule: "build-path", match: m[0] });
    }
  }
  return out;
}
