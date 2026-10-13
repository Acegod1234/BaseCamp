"use client";

import NextImage, { type ImageProps } from "next/image";

/** Version cleaned photos so browsers request them instead of older logo copies. */
export default function Image({ src, ...props }: ImageProps) {
  const photo = typeof src === "string" && (src.startsWith("/media/") || src.startsWith("/photos/"));
  const source = photo ? `${src}${src.includes("?") ? "&" : "?"}v=without-logo-1` : src;
  return <NextImage {...props} src={source} />;
}
