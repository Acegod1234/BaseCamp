import type { MetadataRoute } from "next";
import { categoryPath } from "@/components/journal-list";
import { getLiveTerms, getPages, getPosts, getTaxonomies, getTeam, getTrips } from "@/lib/content";
import { abs } from "@/lib/seo";

const SKIP_PAGES = new Set([
  "home", "booking", "checkout", "thank-you", "online-payment", "online-payment-form", "search-result",
  "review-listing-page", "wishlist", "user-dashboard", "travelers-information", "thanking-you",
  "enquiry-received", "enquiry-thankyou-page", "success", "cancel",
]);

/**
 * One sitemap for every indexable URL, with lastmod taken from the real
 * modified date (never "now", which teaches Google to ignore lastmod) and
 * the photographs on each page.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const trips = getTrips();
  const posts = getPosts();
  const latest = (dates: (string | null)[]) => dates.filter(Boolean).sort().at(-1) ?? undefined;
  const date = (d: string | null | undefined) => (d ? new Date(d.endsWith("Z") ? d : `${d}Z`) : undefined);
  const { destinations, activities } = getLiveTerms();

  return [
    { url: abs("/"), lastModified: date(latest(trips.map((t) => t.modified))), changeFrequency: "weekly", priority: 1, images: [abs("/photos/home-banner.webp")] },
    { url: abs("/trip/"), lastModified: date(latest(trips.map((t) => t.modified))), changeFrequency: "weekly", priority: 0.9 },
    { url: abs("/destination/"), changeFrequency: "monthly", priority: 0.7 },
    { url: abs("/activities/"), changeFrequency: "monthly", priority: 0.7 },
    { url: abs("/blogs/"), lastModified: date(latest(posts.map((p) => p.modified))), changeFrequency: "weekly", priority: 0.7 },
    ...["/about-us/", "/our-team/", "/contact-us/", "/customize-trip/", "/testimonials/", "/trip-types/"].map((p) => ({ url: abs(p), changeFrequency: "monthly" as const, priority: 0.6 })),
    ...trips.map((t) => ({
      url: abs(`/trip/${t.slug}/`),
      lastModified: date(t.modified),
      changeFrequency: "monthly" as const,
      priority: 0.9,
      images: [t.cover, ...t.gallery].filter(Boolean).slice(0, 8).map((i) => abs(i!.src)),
    })),
    ...destinations.map((d) => ({ url: abs(`/destinations/${d.slug}/`), changeFrequency: "weekly" as const, priority: 0.8 })),
    ...activities.map((a) => ({ url: abs(`/activities/${a.slug}/`), changeFrequency: "weekly" as const, priority: 0.8 })),
    ...posts.map((p) => ({
      url: abs(`/${p.slug}/`),
      lastModified: date(p.modified ?? p.published),
      changeFrequency: "monthly" as const,
      priority: 0.6,
      images: p.cover ? [abs(p.cover.src)] : undefined,
    })),
    ...getPages()
      .filter((p) => !SKIP_PAGES.has(p.slug) && !p.seo.noindex && !["about-us", "our-team", "contact-us", "customize-trip", "testimonials", "blogs", "destination", "activities", "trip-types"].includes(p.slug))
      .map((p) => ({ url: abs(`/${p.slug}/`), lastModified: date(p.modified), changeFrequency: "yearly" as const, priority: 0.4 })),
    ...getTaxonomies()
      .categories.filter((c) => c.count > 0)
      .map((c) => ({ url: abs(categoryPath(c.slug)), changeFrequency: "weekly" as const, priority: 0.5 })),
    ...getTeam().map((m) => ({ url: abs(`/team/${m.slug}/`), changeFrequency: "yearly" as const, priority: 0.3 })),
  ];
}
