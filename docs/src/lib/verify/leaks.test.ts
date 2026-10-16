import { describe, expect, it } from "vitest";
import { findLeaks } from "./leaks";

describe("findLeaks", () => {
  const realShape = `syn_live_${"A1b2-C3d4_".repeat(4)}abc`; // 43 key characters, like synapse's generateApiKey()

  it("flags a full live or test key anywhere, including JS", () => {
    const leaks = findLeaks([
      { path: "developers/index.html", text: `Use ${realShape} here` },
      { path: "_astro/a.js", text: '"syn_test_devseed_ashgrove"' },
    ]);
    expect(leaks.map((l) => [l.file, l.rule])).toEqual([
      ["developers/index.html", "api-key"],
      ["_astro/a.js", "api-key"],
    ]);
  });

  it("allows the documented placeholder syn_live_… and the bare prefix", () => {
    expect(findLeaks([{ path: "a.html", text: "Bearer syn_live_… or syn_test_… (prefix syn_live_)" }])).toEqual([]);
  });

  it("flags local URLs in pages and indexes, but not in JS bundles", () => {
    const files = [
      { path: "developers/index.html", text: 'href="http://localhost:4000/public/v1"' },
      { path: "pagefind/pagefind-entry.json", text: '{"x":"127.0.0.1:3000"}' },
      { path: "_astro/main.js", text: 'if(host==="localhost")' },
    ];
    expect(findLeaks(files).map((l) => l.file)).toEqual(["developers/index.html", "pagefind/pagefind-entry.json"]);
  });

  it("flags absolute build-machine paths in published content", () => {
    const files = [
      { path: "developers/reference/operations/getme/index.html", text: '"/home/runner/work/gosynapse.net/docs/x.json"' },
      { path: "a/index.html", text: "/Users/someone/Repositories/x" },
      { path: "_astro/x.js", text: '"/home/runner/work/x"' },
    ];
    expect(findLeaks(files).map((l) => [l.file, l.rule])).toEqual([
      ["developers/reference/operations/getme/index.html", "build-path"],
      ["a/index.html", "build-path"],
    ]);
  });
  it("flags the demo device tokens anywhere, including JS", () => {
    const leaks = findLeaks([
      { path: "help/settings/pair-a-device/index.html", text: "token dev_demo_ashgrove_expo" },
      { path: "_astro/k.js", text: '"dev_demo_ashgrove_hot_pass"' },
    ]);
    expect(leaks).toEqual([
      { file: "help/settings/pair-a-device/index.html", rule: "device-token", match: "dev_demo_ashgrove_expo" },
      { file: "_astro/k.js", rule: "device-token", match: "dev_demo_ashgrove_hot_pass" },
    ]);
  });

  it("does not mistake the bare words for a token", () => {
    expect(findLeaks([{ path: "a.html", text: "a dev demo, dev_demo_ alone" }])).toEqual([]);
  });
});
