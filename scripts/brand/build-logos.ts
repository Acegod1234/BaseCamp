/**
 * Builds the site's logo files from the vector redraw in scripts/brand/logo.svg:
 *
 *   public/brand/logo.svg        original colours, for light backgrounds
 *   public/brand/logo-dark.svg   light lettering, for dark mode
 *   public/brand/logo-512.png    square, on white, for Google's Organization logo
 *   public/brand/watermark.svg   the photo watermark, for banner overlays
 *
 * As in the original files, the clouds and the snow are cut out of the sun,
 * so the page shows through them on any background.
 *
 * Usage:  node --experimental-strip-types scripts/brand/build-logos.ts
 */

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { markSvg } from "../../src/lib/watermark.ts";

const ROOT = process.cwd();
const out = (f: string) => path.join(ROOT, "public", "brand", f);
const src = readFileSync(path.join(ROOT, "scripts", "brand", "logo.svg"), "utf8").replace(/<!--[\s\S]*?-->\s*/g, "");
const pathOf = (cls: string) => src.match(new RegExp(`<path class="${cls}"[^>]* d="([^"]*)"`))?.[1] ?? "";
const block = (cls: string) => src.match(new RegExp(`<g class="${cls}"[^]*?</g>`))?.[0] ?? "";

function logo(ink: string, tag: string, size = { w: 132, h: 76 }) {
  const clouds = block("cloud").replace(/fill="#ffffff"/, 'fill="#000"').replace(' clip-path="url(#disc)"', "");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 132 76" width="${size.w}" height="${size.h}" role="img" aria-label="Base Camp Adventure">
  <defs>
    <clipPath id="sky"><rect x="0" y="-1" width="132" height="42"/></clipPath>
    <mask id="cut" maskUnits="userSpaceOnUse" x="0" y="-1" width="132" height="44">
      <rect x="0" y="-1" width="132" height="44" fill="#fff"/>
      ${clouds}
      <path fill="#000" d="${pathOf("snow")}"/>
    </mask>
  </defs>
  <circle cx="66" cy="40.6" r="40.6" fill="#00b1cd" clip-path="url(#sky)" mask="url(#cut)"/>
  ${block("rock").replace('fill="#58595b"', `fill="${ink}"`)}
  ${block("frame").replace('stroke="#58595b"', `stroke="${ink}"`)}
  <path fill="${ink}" d="${pathOf("name")}"/>
  <path fill="${tag}" d="${pathOf("tag")}"/>
</svg>
`;
}

writeFileSync(out("logo.svg"), logo("#58595b", "#00b1cd"));
writeFileSync(out("logo-dark.svg"), logo("#eef0ea", "#00b1cd"));
writeFileSync(out("watermark.svg"), markSvg(280, 0.9));

// Square PNG for structured data: the logo 440 px wide, centred on white.
const mark = await sharp(Buffer.from(logo("#58595b", "#00b1cd", { w: 440, h: 253 }))).png().toBuffer();
await sharp({ create: { width: 512, height: 512, channels: 4, background: "#ffffff" } })
  .composite([{ input: mark, gravity: "center" }])
  .png({ compressionLevel: 9 })
  .toFile(out("logo-512.png"));

console.log("logo.svg, logo-dark.svg, watermark.svg, logo-512.png written");
