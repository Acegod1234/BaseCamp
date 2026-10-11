import "server-only";
import { closeSync, openSync, readSync } from "node:fs";
import path from "node:path";

const cache = new Map<string, { w: number; h: number } | null>();

/**
 * Width and height of an image in /public, read from the file header
 * (WebP, PNG or JPEG) without decoding it.
 */
export function imageSize(src: string): { w: number; h: number } | null {
  if (cache.has(src)) return cache.get(src)!;
  let size: { w: number; h: number } | null = null;
  try {
    const fd = openSync(path.join(process.cwd(), "public", decodeURIComponent(src.split("?")[0])), "r");
    const b = Buffer.alloc(64 * 1024);
    const n = readSync(fd, b, 0, b.length, 0);
    closeSync(fd);
    size = parse(b.subarray(0, n));
  } catch {
    size = null;
  }
  cache.set(src, size);
  return size;
}

function parse(b: Buffer): { w: number; h: number } | null {
  // WebP
  if (b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP") {
    const chunk = b.toString("ascii", 12, 16);
    if (chunk === "VP8X") return { w: 1 + b.readUIntLE(24, 3), h: 1 + b.readUIntLE(27, 3) };
    if (chunk === "VP8 ") return { w: b.readUInt16LE(26) & 0x3fff, h: b.readUInt16LE(28) & 0x3fff };
    if (chunk === "VP8L") {
      const bits = b.readUInt32LE(21);
      return { w: (bits & 0x3fff) + 1, h: ((bits >> 14) & 0x3fff) + 1 };
    }
    return null;
  }
  // PNG
  if (b.readUInt32BE(0) === 0x89504e47) return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
  // JPEG: walk to the first SOFn marker
  if (b[0] === 0xff && b[1] === 0xd8) {
    let i = 2;
    while (i + 9 < b.length) {
      if (b[i] !== 0xff) return null;
      const marker = b[i + 1];
      const len = b.readUInt16BE(i + 2);
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) return { w: b.readUInt16BE(i + 7), h: b.readUInt16BE(i + 5) };
      i += 2 + len;
    }
  }
  return null;
}
