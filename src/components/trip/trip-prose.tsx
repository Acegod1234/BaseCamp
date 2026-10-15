import charts from "@/content/trek-chart-images.json";

type Props = { html: string; className?: string };

/** Keep the original chart artwork and serve original pixels without recompression. */
export function TripProse({ html, className = "" }: Props) {
  const originals = charts as Record<string, { src: string; width: number; height: number }>;
  const content = html.replace(/<img\b[^>]*>/gi, (image) => {
    const source = image.match(/\bsrc="([^"]+)"/)?.[1];
    const chart = source ? originals[source] : undefined;
    if (!chart) return image;
    return image.replace(/\bsrc="[^"]+"/, `src="${chart.src}"`).replace(/\sclass="[^"]*"/, "").replace(/\s*\/?\s*>$/, ' class="trip-original-chart"/>');
  });
  return <div className={`prose-trail ${className}`} dangerouslySetInnerHTML={{ __html: content }} />;
}
