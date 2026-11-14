// A phone around a full-screen capture: an iPhone 17 Pro (Dynamic Island) or a
// Pixel (punch-hole camera). Every capture is the phone's whole screen, status
// bar and home indicator included, at the phone's own aspect ratio, so the
// image is never cropped or stretched: the screen box takes the image's ratio.
// All sizes are in container units (cqw), so one frame works from the hero's
// small overlay to a full-width figure. Styles live in globals.css (.phone-*).

export type PhoneDevice = "iphone" | "pixel";

export type PhoneShotSpec = { device: PhoneDevice; src: string; alt: string; w: number; h: number };

export function PhoneFrame({
  device,
  src,
  alt,
  w,
  h,
  eager = false,
  className = "",
}: PhoneShotSpec & { eager?: boolean; className?: string }) {
  return (
    <div className={`phone ${className}`}>
      <div className={`phone-body phone-${device}`}>
        <div className="phone-screen" style={{ aspectRatio: `${w} / ${h}` }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={alt} width={w} height={h} loading={eager ? "eager" : "lazy"} decoding="async" />
        </div>
        <span className="phone-camera" aria-hidden />
        <span className="phone-key phone-key-a" aria-hidden />
        <span className="phone-key phone-key-b" aria-hidden />
        <span className="phone-key phone-key-c" aria-hidden />
      </div>
    </div>
  );
}
