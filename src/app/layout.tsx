import type { Metadata } from "next";
import { Mona_Sans, Space_Grotesk } from "next/font/google";
import Script from "next/script";
import "./globals.css";

// Google Analytics 4 property for gosynapse.net.
const GA_ID = "G-KKTBB4B4KM";

// Bundled at build time and served from this origin — the same letterforms on
// every visitor's machine. Mona Sans is the platform face; Space Grotesk is for
// small details (eyebrows, captions, labels).
const monaSans = Mona_Sans({ subsets: ["latin"], variable: "--font-mona", display: "swap" });
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: "synapse — The operating system for modern hospitality",
  description:
    "CRM, front of house, POS, kitchen display, bookings, membership, payments and more — one real-time platform for restaurants, bars and members' clubs, with one traceable data model behind every decision.",
};

// NEVER render a literal <head> here. The App Router injects the stylesheet and
// metadata into the head it owns; supplying our own makes hydration reconcile
// the head against this tree and strip those tags out — the page then loads
// completely unstyled with no title. Use next/script (or metadata) instead.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${monaSans.variable} ${spaceGrotesk.variable}`}>
      <body className="bg-[var(--surface-1)] text-[var(--ink)] antialiased">
        {children}
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
        <Script id="gtag-init" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');`}
        </Script>
      </body>
    </html>
  );
}
