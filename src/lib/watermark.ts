import { readFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

/**
 * The Base Camp Adventure watermark.
 *
 * The logo is drawn from the vector redraw in scripts/brand/logo.svg at the
 * exact size each photograph needs, so it is sharp on a 4K banner and on a
 * 1,000 px gallery photo alike. For photographs the lettering and frame are
 * white, the sun keeps its teal, and a soft shadow lets it read on snow and
 * sky. Used by scripts/watermark.ts today and by the admin's upload handler.
 */

const LOGO = path.join(process.cwd(), "scripts", "brand", "logo.svg");
const PAD = 4; // viewBox units around the logo, so the shadow is not clipped

let svgCache: string | null = null;

/** The photo watermark as SVG, `width` px wide (also written to public/brand/watermark.svg for overlays). */
export function markSvg(width: number, opacity: number) {
  if (!svgCache) {
    svgCache = readFileSync(LOGO, "utf8")
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/(class="frame"[^>]*stroke=")#58595b/, "$1#ffffff")
      .replace(/(class="name"[^>]*fill=")#58595b/, "$1#ffffff")
      .replace(/(class="tag"[^>]*fill=")#00b1cd/, "$1#ffffff");
  }
  const height = Math.round(width * ((76 + PAD * 2) / (132 + PAD * 2)));
  return svgCache
    .replace(/viewBox="[^"]*" width="\d+" height="\d+"/, `viewBox="${-PAD} ${-PAD} ${132 + PAD * 2} ${76 + PAD * 2}" width="${width}" height="${height}"`)
    .replace(
      /(<svg[^>]*>)/,
      `$1<defs><filter id="wm-shadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="0.6" stdDeviation="1.1" flood-color="#000000" flood-opacity="0.55"/></filter></defs><g filter="url(#wm-shadow)" opacity="${opacity}">`,
    )
    .replace("</svg>", "</g></svg>");
}

export type WatermarkOptions = {
  /** WebP quality of the result. */
  quality?: number;
  /** Opacity of the logo, 0–1. */
  opacity?: number;
  /** Photographs narrower than this are returned untouched (icons, thumbnails). */
  minWidth?: number;
};

/**
 * Puts the logo in the bottom-right corner of a photograph and returns it as
 * WebP, or `null` when the image is too small to be worth marking.
 */
export async function watermark(input: Buffer, { quality = 84, opacity = 0.9, minWidth = 480 }: WatermarkOptions = {}): Promise<Buffer | null> {
  const base = sharp(input, { failOn: "none" }).rotate();
  const { width = 0, height = 0, orientation } = await base.metadata();
  // EXIF orientations 5–8 swap the sides.
  const [w, h] = orientation && orientation >= 5 ? [height, width] : [width, height];
  if (w < minWidth) return null;

  // About a sixth of the width on landscape photos, capped on tall ones.
  const logoW = Math.round(Math.min(Math.max(Math.min(w * 0.16, h * 0.26), 110), 640));
  const svg = markSvg(Math.round(logoW * ((132 + PAD * 2) / 132)), opacity);
  const mark = await sharp(Buffer.from(svg)).png().toBuffer();
  const meta = await sharp(mark).metadata();
  // Inside what a centred 3:2 frame (the site's cards and tiles) keeps of this
  // photo, plus a little air: a panorama loses its sides in a card, a 4:3
  // photo its top and bottom, so the logo moves in by that much.
  const aspect = w / h;
  const sideCrop = aspect > 1.5 ? (1 - 1.5 / aspect) / 2 : 0;
  const endCrop = aspect >= 1 && aspect < 1.5 ? (1 - aspect / 1.5) / 2 : 0;
  const right = Math.round(Math.max(w * (sideCrop + 0.06), w * 0.09, 12));
  const bottom = Math.round(Math.max(h * (endCrop + 0.04), h * 0.06, 12));
  const padPx = Math.round((meta.width ?? 0) * (PAD / (132 + PAD * 2)));

  return base
    .composite([{ input: mark, left: Math.max(0, w - (meta.width ?? 0) - right + padPx), top: Math.max(0, h - (meta.height ?? 0) - bottom + padPx) }])
    .webp({ quality, effort: 5 })
    .toBuffer();
}
