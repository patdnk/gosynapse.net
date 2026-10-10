"use client";

import { useState, type FormEvent } from "react";

const VENUE_TYPES = ["Restaurant", "Bar", "Members' club", "Hotel", "Events", "Other"];

type Status = "idle" | "sending" | "sent" | "error";

/**
 * Book-a-demo / contact form. Dark-section styling to match the CTA band.
 *
 * The site is static, so the form posts straight to Web3Forms, which emails the
 * enquiry on. The access key is public by design — it maps to the recipient on
 * their side, so the address itself never appears in source or on the page.
 */
const WEB3FORMS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY;

async function send({ website, ...fields }: Record<string, string>) {
  // Honeypot: bots fill hidden fields. Pretend it worked so they don't retry.
  if (website) return;
  if (!WEB3FORMS_KEY) throw new Error("Sorry — the form isn't configured. Please try again later.");
  const name = fields.name ?? "";
  const company = fields.company ?? "";
  const res = await fetch("https://api.web3forms.com/submit", {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({
      access_key: WEB3FORMS_KEY,
      subject: `[synapse] Demo request — ${name}${company ? ` (${company})` : ""}`,
      from_name: "gosynapse.net",
      replyto: fields.email, // reply goes straight to the enquirer
      ...fields,
    }),
  });
  const data = (await res.json().catch(() => ({}))) as { success?: boolean };
  if (!res.ok || !data.success) {
    throw new Error("Sorry — we couldn't send that. Please try again later.");
  }
}

/**
 * Phone numbers must be international, with the country code (E.164): "+",
 * then 7–15 digits, the first of which is not 0. People type spaces, dashes,
 * dots and brackets, and often "00" for "+", so those are tidied away first;
 * what reaches the inbox is always the clean form, e.g. "+442079460958".
 */
const PHONE_RE = /^\+[1-9]\d{6,14}$/;

function normalizePhone(raw: string) {
  return raw.replace(/[\s().\-/]/g, "").replace(/^00/, "+");
}

/** null when the (optional) phone is empty or valid, otherwise what's wrong. */
function phoneProblem(raw: string): string | null {
  const v = normalizePhone(raw);
  if (!v) return null;
  if (!v.startsWith("+")) return "Include the country code, starting with + (e.g. +44 for the UK).";
  if (!PHONE_RE.test(v)) return "That doesn't look like a full international number.";
  return null;
}

export function ContactForm({ bare = false, onDone }: { bare?: boolean; onDone?: () => void } = {}) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload = Object.fromEntries(fd.entries()) as Record<string, string>;

    const problem = phoneProblem(payload.phone ?? "");
    if (problem) {
      setPhoneError(problem);
      form.querySelector<HTMLInputElement>('input[name="phone"]')?.focus();
      return;
    }
    if (payload.phone) payload.phone = normalizePhone(payload.phone);

    setStatus("sending");
    setError(null);

    try {
      await send(payload);
      setStatus("sent");
      form.reset(); // `e.currentTarget` is null after an await
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  // In the modal the surrounding dialog already provides the card, so `bare`
  // drops this component's own border/background/padding.
  const shell = bare ? "" : "rounded-2xl border border-white/15 bg-white/5 p-6 sm:p-8";

  if (status === "sent") {
    return (
      <div className={bare ? "py-4 text-center" : "rounded-2xl border border-white/15 bg-white/5 p-8 text-center"}>
        <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-[var(--brand)]">
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="#fff" strokeWidth="2.5" aria-hidden>
            <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-white">Thanks — that&apos;s with us.</h3>
        <p className="mt-2 text-sm text-white/60">
          We&apos;ll be in touch shortly to book your 30-minute walkthrough.
        </p>
        <button
          type="button"
          onClick={() => (onDone ? onDone() : setStatus("idle"))}
          className="mt-6 text-sm text-white/60 underline underline-offset-4 hover:text-white"
        >
          {onDone ? "Close" : "Send another"}
        </button>
      </div>
    );
  }

  const field =
    "w-full rounded-lg border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder-white/35 outline-none transition-colors focus:border-[var(--brand)]";

  return (
    <form onSubmit={onSubmit} className={shell}>
      {/* honeypot — hidden from humans, catches bots */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-white/70">Name *</span>
          <input name="name" required maxLength={120} className={field} placeholder="Alex Fisher" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-white/70">Work email *</span>
          <input
            name="email"
            type="email"
            required
            maxLength={200}
            className={field}
            placeholder="alex@yourvenue.com"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-white/70">Company</span>
          <input name="company" maxLength={160} className={field} placeholder="Your venue" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-white/70">Phone</span>
          <input
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            maxLength={40}
            className={`${field} ${phoneError ? "border-red-300/70" : ""}`}
            placeholder="+44 20 7946 0958"
            aria-invalid={phoneError ? true : undefined}
            aria-describedby="phone-hint"
            onBlur={(e) => setPhoneError(phoneProblem(e.currentTarget.value))}
            onInput={() => phoneError && setPhoneError(null)}
          />
          <span
            id="phone-hint"
            className={`mt-1.5 block text-xs ${phoneError ? "text-red-300" : "text-white/40"}`}
          >
            {phoneError ?? "With country code, e.g. +44 for the UK."}
          </span>
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-xs font-medium text-white/70">Venue type</span>
          <select name="venueType" className={`${field} [&>option]:bg-[var(--ink-900)]`} defaultValue="">
            <option value="">Select…</option>
            {VENUE_TYPES.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-xs font-medium text-white/70">What would you like to see? *</span>
          <textarea
            name="message"
            required
            rows={4}
            maxLength={4000}
            className={`${field} resize-y`}
            placeholder="We run two sites and want to replace our POS and booking system…"
          />
        </label>
      </div>

      {error && <p className="mt-4 text-sm text-red-300">{error}</p>}

      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-6 w-full rounded-full bg-[var(--brand)] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--brand-strong)] disabled:opacity-60 sm:w-auto"
      >
        {status === "sending" ? "Sending…" : "Request a demo"}
      </button>
      <p className="mt-3 text-xs text-white/40">
        We&apos;ll only use your details to respond to this enquiry.
      </p>
    </form>
  );
}
