/**
 * Content shapes.
 *
 * These mirror what scripts/import-wordpress.py writes today and what the
 * admin's database will return later, so pages never need to change when the
 * source moves from JSON to PostgreSQL.
 */

export type Img = { src: string; w: number; h: number; alt: string };

export type Seo = {
  title: string | null;
  description: string | null;
  ogImage: string | null;
  noindex: boolean;
};

export type TocItem = { id: string; text: string; level: number };

export type Price = {
  amount: number;
  regular: number | null;
  currency: "USD";
  per: string;
  minPax: number;
  groupTiers: { from: number; to: number | null; price: number }[];
};

export type ItineraryDay = {
  day: number;
  title: string;
  html: string;
  altitude: number | null;
  meals: string[];
  overnight: string | null;
  hours?: number | null;
  distanceKm?: number | null;
};

export type Review = {
  author: string;
  rating: number;
  title: string | null;
  body: string;
  date: string | null;
};

export type Trip = {
  id: number;
  slug: string;
  code: string | null;
  title: string;
  summary: string;
  seo: Seo;
  published: string | null;
  modified: string | null;
  days: number;
  nights: number;
  destinations: string[];
  activities: string[];
  difficulty: string | null;
  tags: string[];
  price: Price | null;
  groupSize: { min: number; max: number | null };
  maxAltitude: number | null;
  facts: { label: string; value: string }[];
  cover: Img | null;
  gallery: Img[];
  map: Img | null;
  overview: string;
  toc: TocItem[];
  highlights: string[];
  itinerary: ItineraryDay[];
  includes: string[];
  excludes: string[];
  sections: { id: string; title: string; html: string }[];
  faqs: { q: string; a: string }[];
  rating: { value: number; count: number } | null;
  reviews: Review[];
};

/** The light version used in grids, so list pages do not ship itineraries. */
export type TripCard = Pick<
  Trip,
  "slug" | "title" | "summary" | "days" | "destinations" | "activities" | "difficulty" | "price" | "maxAltitude" | "cover" | "rating" | "groupSize"
>;

export type Post = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  html: string;
  toc: TocItem[];
  published: string | null;
  modified: string | null;
  cover: Img | null;
  categories: string[];
  tags: string[];
  author: string;
  readingMinutes: number;
  seo: Seo;
};

export type PostCard = Pick<Post, "slug" | "title" | "excerpt" | "published" | "cover" | "categories" | "readingMinutes">;

export type Page = {
  id: number;
  slug: string;
  parent: number | null;
  title: string;
  html: string;
  toc: TocItem[];
  excerpt: string;
  modified: string | null;
  cover: Img | null;
  seo: Seo;
};

export type TeamMember = {
  slug: string;
  name: string;
  role: string;
  photo: Img | null;
  bio: string;
  excerpt: string;
};

export type Term = {
  id: number;
  slug: string;
  name: string;
  count: number;
  parent: number | null;
  description: string;
  seo: Seo;
  kind: string;
};

export type Taxonomies = {
  destinations: Term[];
  activities: Term[];
  difficulty: Term[];
  tripTags: Term[];
  categories: Term[];
  tags: Term[];
};

export type PhotoCredit = {
  key: string;
  title: string;
  author: string;
  license: string;
  licenseUrl: string | null;
  source: string;
  src: string;
  w: number;
  h: number;
};

/** One entry of the live site's main menu, as imported. */
export type MenuItem = { label: string; href: string; children?: MenuItem[] };

/** A hero photograph chosen from the company's own uploads. */
export type Photo = {
  src: string;
  w: number;
  h: number;
  trip: string | null;
  credit?: { title: string; author: string; license: string; licenseUrl: string | null; source: string } | null;
};

/** Social work and community news, posted from the admin. */
export type CommunityPost = {
  slug: string;
  title: string;
  kind: "Relief" | "Sponsorship" | "Community" | "Environment";
  place: string;
  date: string | null;
  summary: string;
  html: string;
  photos: Img[];
  partners: string[];
};

/** A seasonal offer (Dashain, Tihar, New Year...), switched on from the admin. */
export type Offer = {
  slug: string;
  title: string;
  festival: string;
  summary: string;
  code: string | null;
  percent: number | null;
  starts: string | null;
  ends: string | null;
  trips: string[];
  active: boolean;
};
