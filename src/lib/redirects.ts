/**
 * Old addresses still linked from inside imported articles and trip pages.
 * WordPress resolved them with its own redirects; here they are permanent
 * redirects (next.config.ts) and, when the content is loaded, the links
 * themselves are rewritten to the final page (src/lib/content.ts), so
 * visitors and search engines never take the extra hop.
 *
 * `:slug` matches one path segment. Specific entries come before patterns.
 */
export const CONTENT_REDIRECTS: { source: string; destination: string }[] = [
  { source: "/online-payment-form/", destination: "/online-payment/" },
  { source: "/destinations/nepal/everest-region-peak-climbing/", destination: "/activities/nepal-peak-climbing/" },
  { source: "/destinations/nepal/annapurna-region-peak-climbing/", destination: "/activities/nepal-peak-climbing/" },
  { source: "/destinations/nepal/langtang-region-peak-climbing/", destination: "/activities/nepal-peak-climbing/" },
  { source: "/destinations/everest-region-peak-climbing/", destination: "/activities/nepal-peak-climbing/" },
  { source: "/destinations/annapurna-region-peak-climbing/", destination: "/activities/nepal-peak-climbing/" },
  { source: "/destinations/langtang-region-peak-climbing/", destination: "/activities/nepal-peak-climbing/" },
  { source: "/destinations/nepal/:slug/", destination: "/destinations/:slug/" },
  { source: "/nepal/trekking/", destination: "/activities/trekking-in-nepal/" },
  { source: "/nepal/trekking/:slug/", destination: "/trip/:slug/" },
  { source: "/blog/:slug/", destination: "/:slug/" },
  { source: "/contact/", destination: "/contact-us/" },
  { source: "/activities/peak-climbing/", destination: "/activities/nepal-peak-climbing/" },
  { source: "/trip/everest-three-pass-trek/", destination: "/trip/everest-three-passes-trek/" },
  { source: "/trip/everest-base-camp-three-passes-trek/", destination: "/trip/everest-three-passes-trek/" },
  { source: "/trip/gokyo-and-cho-la-pass-trek/", destination: "/trip/everest-base-camp-and-gokyo-trek/" },
  { source: "/trip/everest-base-camp-trek-group-joining/", destination: "/trip/everest-base-camp-group-trek/" },
  { source: "/trip/tsum-valley-trek/", destination: "/trip/tsum-valley-and-manaslu-trek/" },
  { source: "/trip/everest-base-camp-helicopter-tour-with-landing-at-everest-view-hotel/", destination: "/trip/everest-base-camp-helicopter-tour-with-landing/" },
  { source: "/trip/luxury-lodge-trek-to-everest-base-camp/", destination: "/trip/everest-base-camp-luxury-lodge-trek/" },
  { source: "/trip/upper-dolpo-trekking-27-days/", destination: "/trip/upper-dolpo-trek/" },
  { source: "/trip/manaslu-trek/", destination: "/trip/manaslu-circuit-trek/" },
  { source: "/trip/family-tour/", destination: "/trip/nepal-family-tour-package/" },
  { source: "/trip/honeymoon-tours/", destination: "/trip/nepal-luxury-tour-package/" },
  { source: "/trip/panchase-trekking/", destination: "/trip/panchase-trek/" },
  { source: "/short-manaslu-circuit-trek/", destination: "/trip/short-manaslu-circuit-trek/" },
  { source: "/manaslu-circuit-trek-cost/", destination: "/manaslu-trek-cost/" },
  { source: "/tibet/everest-base-camp-lhasa-tour/", destination: "/trip/everest-base-camp-tour-from-lhasa/" },
  { source: "/everest-base-camp-helicopter-tour-cost/", destination: "/trip/everest-base-camp-helicopter-tour/" },
  { source: "/annapurna-base-camp-trek-in-november/:attachment/", destination: "/annapurna-base-camp-trek-in-november/" },
  { source: "/manaslu-vs-annapurna-circuit-and-annapurna-base-camp-trek/", destination: "/manaslu-circuit-vs-annapurna-circuit-trek/" },
  { source: "/langtang-trek-cost/", destination: "/langtang-valley-trek-cost/" },
  { source: "/media/2020/02/everest-base-camp-trek.webp", destination: "/trip/everest-base-camp-trek/" },
];

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const compiled = CONTENT_REDIRECTS.map((r) => {
  const names = [...r.source.matchAll(/:(\w+)/g)].map((m) => m[1]);
  const pattern = r.source
    .split(/(:\w+)/)
    .map((part) => (part.startsWith(":") ? "([^/]+)" : escape(part)))
    .join("");
  return { re: new RegExp(`^${pattern}$`), names, destination: r.destination };
});

/** The final address for an old internal path, or null if it is not an old address. */
export function resolveOldPath(path: string): string | null {
  const p = path.endsWith("/") || /\.\w+$/.test(path) ? path : `${path}/`;
  for (const r of compiled) {
    const m = p.match(r.re);
    if (m) return r.names.reduce((d, name, i) => d.replace(`:${name}`, m[i + 1]), r.destination);
  }
  return null;
}
