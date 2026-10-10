import type { NextConfig } from "next";

// Plain HTML/JS/CSS in `out/`, served by GitHub Pages. Nothing needs a server:
// the contact form posts straight to Web3Forms and the /tour code is checked in
// the browser.
const nextConfig: NextConfig = {
  output: "export",
};

export default nextConfig;
