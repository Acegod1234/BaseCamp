/**
 * Cropping watermarked photographs so exactly one logo ever shows.
 *
 * Every photo carries the logo in its bottom-right corner (src/lib/watermark.ts).
 * A frame narrower than the photo keeps the full height, so anchoring the crop
 * to the right keeps the logo whole. A frame wider than the photo cuts the top
 * and bottom: then the crop either keeps the logo whole, or hides it
 * completely and an overlay of the same logo is drawn in the same place.
 * Never half a logo, never two.
 */

/** Must match MARK and markBox() in src/lib/watermark.ts. */
const MARK = { width: 0.225, margin: 0.05 };
const LOGO_RATIO = 76 / 132;
/** The overlay SVG (public/brand/watermark.svg) pads the 132-unit logo by 4 units a side. */
const PAD = 4 / 140;

function markBox(w: number, h: number) {
  const logoW = Math.max(Math.min(h * MARK.width, w * 0.3), 100);
  const margin = Math.max(Math.min(h * MARK.margin, w * 0.066), 10);
  return { logoW, margin };
}

export type Crop = {
  /** CSS object-position. */
  position: string;
  /** When set, the baked logo is cropped out and this overlay takes its place. */
  overlay: { width: string; right: string; bottom: string } | null;
};

export function cropFor(w: number, h: number, frame: number): Crop {
  const a = w / h;
  // Frame narrower than (or as wide as) the photo: the full height shows.
  if (frame <= a + 0.001) return { position: "100% 50%", overlay: null };

  const { logoW, margin } = markBox(w, h);
  const visible = a / frame; // share of the photo's height inside the frame
  const bottom = 1 - margin / h; // logo's lower edge, as a share of the height
  const top = bottom - (logoW * LOGO_RATIO) / h;

  // Prefer a crop a little above centre that leaves the logo out entirely.
  const hideUpTo = (top - 0.012 - visible) / (1 - visible);
  if (hideUpTo >= 0) {
    const p = Math.min(0.42, hideUpTo);
    const frameH = w / frame; // frame height, in photo pixels
    const boxW = logoW / (1 - 2 * PAD);
    return {
      position: `50% ${(p * 100).toFixed(1)}%`,
      overlay: {
        width: `${((boxW / w) * 100).toFixed(2)}%`,
        right: `${(((margin - boxW * PAD) / w) * 100).toFixed(2)}%`,
        bottom: `${(((margin - boxW * PAD) / frameH) * 100).toFixed(2)}%`,
      },
    };
  }
  // Otherwise keep the whole logo in view.
  const showFrom = (bottom + 0.008 - visible) / (1 - visible);
  return { position: `50% ${(Math.min(1, Math.max(showFrom, 0.5)) * 100).toFixed(1)}%`, overlay: null };
}
