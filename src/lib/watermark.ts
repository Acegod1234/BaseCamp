import { readFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

/**
 * The Base Camp Adventure watermark.
 *
 * The logo is drawn from the vector redraw in scripts/brand/logo.svg at the
 * exact size each photograph needs, so it is sharp on a 4K banner and on a
 * 1,000 px gallery photo alike. For photographs the lettering and frame are
 * white, the sun keeps its teal, and a crisp edge shadow under a soft one
 * lets it read on snow and sky alike. Used by scripts/watermark.ts today and by the admin's upload handler.
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
      `$1<defs><filter id="wm-shadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="0.35" stdDeviation="0.45" flood-color="#000000" flood-opacity="0.6"/><feDropShadow dx="0" dy="0.6" stdDeviation="1.4" flood-color="#000000" flood-opacity="0.45"/></filter></defs><g filter="url(#wm-shadow)" opacity="${opacity}">`,
    )
    .replace("</svg>", "</g></svg>");
}

/** Logo width 22.5% and padding 5% of the photo's height (narrower on tall photos). */
export const MARK = { width: 0.225, margin: 0.05 } as const;

export function markBox(w: number, h: number) {
  const logoW = Math.round(Math.max(Math.min(h * MARK.width, w * 0.3), 100));
  const margin = Math.round(Math.max(Math.min(h * MARK.margin, w * 0.066), 10));
  return { logoW, margin };
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

  // One standard mark: sized and spaced from the photo's height, so on every
  // 3:2 card (which always shows the full height of a landscape photo) the
  // logo is the same size with the same padding, whatever the photo's shape.
  const { logoW, margin } = markBox(w, h);
  const svg = markSvg(Math.round(logoW * ((132 + PAD * 2) / 132)), opacity);
  const mark = await sharp(Buffer.from(svg)).png().toBuffer();
  const meta = await sharp(mark).metadata();
  const right = margin;
  const bottom = margin;
  const padPx = Math.round((meta.width ?? 0) * (PAD / (132 + PAD * 2)));

  return base
    .composite([{ input: mark, left: Math.max(0, w - (meta.width ?? 0) - right + padPx), top: Math.max(0, h - (meta.height ?? 0) - bottom + padPx) }])
    .webp({ quality, effort: 5 })
    .toBuffer();
}
