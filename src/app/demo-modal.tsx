"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { createPortal } from "react-dom";

// The form carries libphonenumber's metadata (~145 kB), so it is its own chunk,
// fetched when the dialog first opens rather than with the page.
const ContactForm = dynamic(() => import("./contact-form").then((m) => m.ContactForm), {
  ssr: false,
  loading: () => <p className="py-10 text-center text-sm text-white/50">Loading…</p>,
});

/**
 * "Book a demo" dialog. The form is mounted only once the dialog opens, so the
 * served HTML contains no form fields at all — scrapers and drive-by form-fill
 * bots have nothing to bite on. (The honeypot field and Web3Forms' own spam
 * filtering do the rest; this just removes the easy target.)
 */
export function DemoModal({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    // Prevent the page scrolling behind the dialog.
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, close]);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {children}
      </button>

      {/* Portalled to <body>: the sticky header uses backdrop-blur, and a
          backdrop-filter ancestor becomes the containing block for fixed
          descendants — inside it the overlay would size to the header, not the
          viewport. */}
      {open &&
        mounted &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm sm:p-8"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) close();
            }}
          >
            <div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-label="Book a demo"
              tabIndex={-1}
              className="relative my-auto w-full max-w-xl rounded-2xl bg-[var(--ink-900)] p-6 shadow-2xl outline-none ring-1 ring-white/15 sm:p-8"
            >
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="absolute right-4 top-4 rounded-full p-1.5 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
                </svg>
              </button>

              <h3 className="text-2xl font-bold tracking-[-0.02em] text-white">Book a demo</h3>
              <p className="mt-2 text-sm text-white/60">
                A 30-minute walkthrough of the admin, the floor and the till. Tell us a little about your
                venue and we&apos;ll be in touch.
              </p>

                <div className="mt-6">
                  <ContactForm bare onDone={close} />
                </div>
              </div>
          </div>,
          document.body,
        )}
    </>
  );
}
