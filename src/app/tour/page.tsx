import type { Metadata } from "next";
import Link from "next/link";

import { DemoPlayer } from "../demo-player";
import { TourGate } from "./gate";
import { Logo } from "./logo";

// Unlisted: not linked from the public site and explicitly kept out of search
// indexes. Shared on demand as gosynapse.net/tour?k=<code>.
export const metadata: Metadata = {
  title: "synapse — product tour",
  robots: { index: false, follow: false },
};

export default function TourPage() {
  return (
    <TourGate>
      <main className="min-h-screen bg-[var(--surface-2)]">
        <header className="border-b border-[var(--border)] bg-white/80 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
            <Link href="/" className="flex items-center gap-2.5">
              <Logo />
              <span className="text-lg font-semibold tracking-[-0.01em]">synapse</span>
            </Link>
            <Link
              href="/#demo"
              className="btn rounded-full bg-[var(--brand)] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--brand-strong)]"
            >
              Book a demo
            </Link>
          </div>
        </header>

        <div className="mx-auto max-w-6xl px-5 py-16">
          <div className="max-w-2xl">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand)]">
              Private walkthrough
            </p>
            <h1 className="text-4xl font-bold tracking-[-0.02em] sm:text-5xl">Take the tour</h1>
            <p className="mt-5 text-lg text-[var(--muted)]">
              The same ground we cover in the 30-minute demo, in chapters — jump to the part that matters
              to your venue, or play it straight through.
            </p>
          </div>
          <div className="mt-14">
            <DemoPlayer />
          </div>
        </div>
      </main>
    </TourGate>
  );
}
