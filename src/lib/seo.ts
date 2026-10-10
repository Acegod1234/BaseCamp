import type { Metadata } from "next";
import { site } from "@/lib/site";
import type { Img, Post, Seo, Trip } from "@/lib/types";

export const abs = (path: string) => (path.startsWith("http") ? path : `${site.url}${path.startsWith("/") ? "" : "/"}${path}`);

/** Yoast titles carry " - Base Camp Adventure"; the root template adds it back. */
function bareTitle(title: string | null | undefined) {
  return (title ?? "").replace(/\s*[-|–]\s*Base Camp Adventure\s*$/i, "").trim();
}

/**
 * Page metadata. Imported Yoast values win, so titles and descriptions that
 * rank today are carried over word for word.
 */
export function meta({
  path,
  title,
  description,
  seo,
  image,
  type = "website",
  published,
  modified,
}: {
  path: string;
  title: string;
  description?: string | null;
  seo?: Seo | null;
  image?: Img | string | null;
  type?: "website" | "article";
  published?: string | null;
  modified?: string | null;
}): Metadata {
  const finalTitle = bareTitle(seo?.title) || title;
  const finalDescription = seo?.description || description || site.description;
  const imgSrc = typeof image === "string" ? image : image?.src;
  const og = imgSrc ?? "/photos/home-banner.webp";
  return {
    title: { absolute: finalTitle.length > 48 ? finalTitle : `${finalTitle} | ${site.name}` },
    description: finalDescription,
    alternates: { canonical: abs(path) },
    robots: seo?.noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      type,
      url: abs(path),
      siteName: site.name,
      title: finalTitle,
      description: finalDescription,
      images: [{ url: abs(og) }],
      ...(type === "article" ? { publishedTime: published ?? undefined, modifiedTime: modified ?? undefined } : {}),
    },
    twitter: { card: "summary_large_image", title: finalTitle, description: finalDescription, images: [abs(og)] },
  };
}

/* ------------------------------------------------------------------ JSON-LD */

export function organizationLd() {
  return {
    "@context": "https://schema.org",
    "@type": ["TravelAgency", "LocalBusiness"],
    "@id": `${site.url}/#organization`,
    name: site.name,
    legalName: site.legalName,
    url: `${site.url}/`,
    logo: abs("/brand/logo-512.png"),
    image: abs("/photos/home-banner.webp"),
    description: site.description,
    foundingDate: String(site.founded),
    telephone: site.phone,
    email: site.email,
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.street,
      addressLocality: site.address.city,
      addressRegion: site.address.region,
      postalCode: site.address.postalCode,
      addressCountry: site.address.country,
    },
    geo: { "@type": "GeoCoordinates", latitude: site.geo.lat, longitude: site.geo.lng },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "00:00",
      closes: "23:59",
    },
    sameAs: Object.values(site.social),
    areaServed: ["Nepal", "Bhutan", "Tibet"],
  };
}

export function websiteLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${site.url}/#website`,
    url: `${site.url}/`,
    name: site.name,
    publisher: { "@id": `${site.url}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${site.url}/trip/?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: abs(it.path) })),
  };
}

export function tripLd(trip: Trip) {
  const url = abs(`/trip/${trip.slug}/`);
  const images = [trip.cover, ...trip.gallery].filter(Boolean).slice(0, 6).map((i) => abs((i as Img).src));
  const offer = trip.price
    ? {
        "@type": "Offer",
        price: trip.price.amount,
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        url,
        seller: { "@id": `${site.url}/#organization` },
        validFrom: trip.modified ?? undefined,
      }
    : undefined;
  const reviews = trip.reviews.slice(0, 6).map((r) => ({
    "@type": "Review",
    author: { "@type": "Person", name: r.author },
    reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5 },
    reviewBody: r.body,
  }));
  const rating = trip.rating
    ? { "@type": "AggregateRating", ratingValue: trip.rating.value, reviewCount: trip.rating.count, bestRating: 5 }
    : undefined;

  return [
    {
      "@context": "https://schema.org",
      "@type": "TouristTrip",
      "@id": `${url}#trip`,
      name: trip.title,
      description: trip.summary,
      url,
      image: images,
      touristType: trip.activities.includes("nepal-peak-climbing") ? "Mountaineers" : "Trekkers",
      provider: { "@id": `${site.url}/#organization` },
      itinerary: trip.itinerary.length
        ? {
            "@type": "ItemList",
            numberOfItems: trip.itinerary.length,
            itemListElement: trip.itinerary.map((d) => ({
              "@type": "ListItem",
              position: d.day,
              item: { "@type": "TouristAttraction", name: d.title },
            })),
          }
        : undefined,
      offers: offer,
    },
    {
      "@context": "https://schema.org",
      "@type": "Product",
      "@id": `${url}#product`,
      name: trip.title,
      description: trip.summary,
      image: images,
      sku: trip.code ?? String(trip.id),
      brand: { "@type": "Brand", name: site.name },
      offers: offer,
      aggregateRating: rating,
      review: reviews.length ? reviews : undefined,
    },
    ...(trip.faqs.length ? [faqLd(trip.faqs)] : []),
  ];
}

export function faqLd(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() },
    })),
  };
}

export function articleLd(post: Post) {
  const url = abs(`/${post.slug}/`);
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: post.title,
    description: post.seo.description ?? post.excerpt,
    image: post.cover ? [abs(post.cover.src)] : undefined,
    datePublished: post.published,
    dateModified: post.modified ?? post.published,
    author: { "@type": "Person", name: post.author, url: abs("/our-team/") },
    publisher: { "@id": `${site.url}/#organization` },
    mainEntityOfPage: url,
    wordCount: post.html.replace(/<[^>]+>/g, " ").split(/\s+/).length,
  };
}

export function itemListLd(name: string, paths: string[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    itemListElement: paths.map((p, i) => ({ "@type": "ListItem", position: i + 1, url: abs(p) })),
  };
}
