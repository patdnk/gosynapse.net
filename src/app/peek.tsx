// Product images as fragments, the way zkipster and tiquo show theirs: a part
// of a screen on a tinted panel, bleeding off its edges, never a whole page.
// The files themselves are fragments too (cut from private full captures by
// make-peeks.cjs in synapse/Claude outputs/site-sources), so nothing on the
// site serves a full screen. Sizes come from shots.json, which that script
// writes, so a panel always takes the fragment's own shape. Styles: .peek-*
// in globals.css.

import SHOTS from "./shots.json";
import { PhoneFrame, type PhoneDevice } from "./phone-frame";

const SIZES = SHOTS as unknown as Record<string, [number, number]>;
export function shotSize(src: string): [number, number] {
  return SIZES[src] ?? [1600, 1000];
}

export type Tone = "lilac" | "sand" | "sage" | "sky";
const TONES: Tone[] = ["lilac", "sand", "sage", "sky"];
function toneOf(src: string): Tone {
  let h = 0;
  for (const c of src) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return TONES[h % TONES.length];
}

export type PhonePeekSpec = { device: PhoneDevice; src: string; alt: string };

// Bezel (each side) and how much of the phone's foot to hide, as fractions of
// the phone's width: below the cut line the frame's rounded corners never show.
const BEZEL: Record<PhoneDevice, number> = { iphone: 0.031, pixel: 0.033 };
const FOOT = 0.2;
function phoneVisible(device: PhoneDevice, src: string) {
  const [w, h] = shotSize(src);
  const p = BEZEL[device];
  return (1 - 2 * p) * (h / w) + 2 * p - FOOT;
}

/** A phone whose foot is cut off by the edge it stands on (clip below only). */
export function PhoneCut({ device, src, alt, eager = false, className = "" }: PhonePeekSpec & { eager?: boolean; className?: string }) {
  const [w, h] = shotSize(src);
  return (
    <div className={`phone-cut ${className}`} style={{ aspectRatio: `1 / ${phoneVisible(device, src)}` }}>
      <PhoneFrame device={device} src={src} alt={alt} w={w} h={h} eager={eager} />
    </div>
  );
}

/** A desktop fragment on a tinted panel; phones may stand in front of it. */
export function Peek({
  src,
  alt,
  tone,
  phones,
  tag,
  eager = false,
}: {
  src: string;
  alt: string;
  tone?: Tone;
  phones?: PhonePeekSpec[];
  tag?: string;
  eager?: boolean;
}) {
  const [w, h] = shotSize(src);
  const wide = w / h >= 1;
  const fit = wide ? 1.06 : 0.66; // the fragment's width as a share of the panel's
  const aspect = (0.94 * (w / h)) / fit; // tall enough that the fragment runs off the foot
  const left = wide ? 7 : ((1 - fit) / 2) * 100;
  return (
    <div className={`peek peek-${tone ?? toneOf(src)}`} style={{ aspectRatio: aspect }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} width={w} height={h} loading={eager ? "eager" : "lazy"} decoding="async" className="peek-shot" style={{ width: `${fit * 100}%`, left: `${left}%` }} />
      {phones?.map((p, i) => (
        <div key={p.src} className="peek-phone" style={{ right: `${5 + i * 25}%` }}>
          <PhoneCut {...p} />
        </div>
      ))}
      {tag && <span className="peek-tag">{tag}</span>}
    </div>
  );
}

/** A phone rising from the foot of a tinted panel. */
export function PhonePeek({ tone, ...spec }: PhonePeekSpec & { tone?: Tone }) {
  const width = 0.7;
  const aspect = 0.93 / (width * phoneVisible(spec.device, spec.src));
  return (
    <div className={`peek peek-${tone ?? toneOf(spec.src)}`} style={{ aspectRatio: aspect }}>
      <div className="peek-phone-solo" style={{ width: `${width * 100}%` }}>
        <PhoneCut {...spec} />
      </div>
    </div>
  );
}

/** The till or kitchen screen in a tablet bezel, running off the panel's corner. */
export function TabletPeek({ src, alt, tone }: { src: string; alt: string; tone?: Tone }) {
  const [w, h] = shotSize(src);
  const fit = 1.06;
  const aspect = (0.94 * (w / h)) / fit;
  return (
    <div className={`peek peek-${tone ?? toneOf(src)}`} style={{ aspectRatio: aspect }}>
      <div className="peek-tablet" style={{ width: `${fit * 100}%` }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} width={w} height={h} loading="lazy" decoding="async" />
      </div>
    </div>
  );
}
