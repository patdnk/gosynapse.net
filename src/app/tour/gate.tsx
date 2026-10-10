"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";

import { Logo } from "./logo";

// The site is served statically, so the code is checked in the browser against
// a SHA-256 of it baked in at build time — the code itself never ships. This
// keeps casual visitors and crawlers out; it is not access control (the tour is
// the same screenshots the public page shows).
const EXPECTED_SHA256 = process.env.NEXT_PUBLIC_TOUR_CODE_SHA256?.trim().toLowerCase();

async function sha256Hex(text: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

type State = "checking" | "locked" | "unlocked";

export function TourGate({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(EXPECTED_SHA256 ? "checking" : "unlocked");
  const [attempted, setAttempted] = useState(false);

  useEffect(() => {
    // With no code configured the tour stays open — that's the local/dev case.
    if (!EXPECTED_SHA256) return;
    const k = new URLSearchParams(window.location.search).get("k")?.trim() ?? "";
    setAttempted(k.length > 0);
    if (!k) {
      setState("locked");
      return;
    }
    sha256Hex(k).then(
      (hex) => setState(hex === EXPECTED_SHA256 ? "unlocked" : "locked"),
      () => setState("locked"),
    );
  }, []);

  if (state === "checking") return <main className="min-h-screen bg-[var(--surface-2)]" />;
  if (state === "unlocked") return <>{children}</>;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--surface-2)] px-5">
      <div className="w-full max-w-sm rounded-2xl border border-[var(--border)] bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-2.5">
          <Logo className="h-9 w-9" />
          <span className="text-lg font-semibold tracking-[-0.01em]">synapse</span>
        </div>
        <h1 className="text-xl font-bold tracking-[-0.02em]">Product tour</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          This walkthrough is shared on request. Enter the code from your invitation.
        </p>
        <form method="GET" className="mt-6">
          <label htmlFor="k" className="mb-1.5 block text-xs font-medium text-[var(--muted)]">
            Access code
          </label>
          <input
            id="k"
            name="k"
            autoFocus
            autoComplete="off"
            className="w-full rounded-lg border border-[var(--border)] px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-[var(--brand)]"
            placeholder="Enter your code"
          />
          {attempted && (
            <p className="mt-2 text-sm text-red-600">That code isn&apos;t right — check your invitation.</p>
          )}
          <button
            type="submit"
            className="mt-4 w-full rounded-full bg-[var(--brand)] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--brand-strong)]"
          >
            View the tour
          </button>
        </form>
        <p className="mt-6 text-xs text-[var(--muted)]">
          Don&apos;t have a code?{" "}
          <Link href="/#demo" className="underline underline-offset-4 hover:text-[var(--ink)]">
            Book a demo
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
