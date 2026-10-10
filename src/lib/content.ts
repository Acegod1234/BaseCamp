import "server-only";
import { readFileSync } from "node:fs";
import path from "node:path";
import { cache } from "react";
import type {
  Page,
  PhotoCredit,
  Post,
  PostCard,
  Taxonomies,
  TeamMember,
  Trip,
  TripCard,
} from "@/lib/types";

/**
 * Content access.
 *
 * Reads the JSON written by the WordPress importer. Every page goes through
 * these functions, so swapping the source for the admin database later is a
 * change to this file only.
 */

const dir = path.join(process.cwd(), "src", "content");

function load<T>(name: string, fallback: T): T {
  try {
    return JSON.parse(readFileSync(path.join(dir, `${name}.json`), "utf8")) as T;
  } catch {
    return fallback;
  }
}

const data = cache(() => ({
  trips: load<Trip[]>("trips", []),
  posts: load<Post[]>("posts", []),
  pages: load<Page[]>("pages", []),
  team: load<TeamMember[]>("team", []),
  taxonomies: load<Taxonomies>("taxonomies", {
    destinations: [],
    activities: [],
    difficulty: [],
    tripTags: [],
    categories: [],
    tags: [],
  }),
  credits: load<PhotoCredit[]>("photo-credits", []),
}));

export function toCard(t: Trip): TripCard {
  return {
    slug: t.slug,
    title: t.title,
    summary: t.summary,
    days: t.days,
    destinations: t.destinations,
    activities: t.activities,
    difficulty: t.difficulty,
    price: t.price,
    maxAltitude: t.maxAltitude,
    cover: t.cover,
    rating: t.rating,
    groupSize: t.groupSize,
  };
}

export function toPostCard(p: Post): PostCard {
  return {
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    published: p.published,
    cover: p.cover,
    categories: p.categories,
    readingMinutes: p.readingMinutes,
  };
}

/* ------------------------------------------------------------------ trips */

export const getTrips = () => data().trips;
export const getTripCards = () => data().trips.map(toCard);
export const getTrip = (slug: string) => data().trips.find((t) => t.slug === slug) ?? null;

export function getTripsIn(field: "destinations" | "activities", slug: string): TripCard[] {
  return data().trips.filter((t) => t[field].includes(slug)).map(toCard);
}

/** Trips handpicked for the homepage, in the order the office ranks them. */
const FEATURED = [
  "everest-base-camp-trek",
  "everest-base-camp-and-gokyo-trek",
  "annapurna-base-camp-trek",
  "gokyo-valley-trek",
  "ghorepani-poon-hill-trek",
  "mustang-trek",
  "everest-three-passes-trek",
  "langtang-valley-trek",
  "manaslu-circuit-trek",
  "annapurna-circuit-trek",
  "island-peak-climbing",
  "everest-base-camp-trek-with-helicopter-return",
];

export function getFeaturedTrips(): TripCard[] {
  const all = data().trips;
  const picked = FEATURED.map((s) => all.find((t) => t.slug === s)).filter(Boolean) as Trip[];
  return picked.map(toCard);
}

export function getRelatedTrips(trip: Trip, limit = 3): TripCard[] {
  const score = (t: Trip) =>
    t.destinations.filter((d) => trip.destinations.includes(d)).length * 3 +
    t.activities.filter((a) => trip.activities.includes(a)).length +
    (Math.abs(t.days - trip.days) <= 4 ? 1 : 0);
  return data()
    .trips.filter((t) => t.slug !== trip.slug)
    .map((t) => ({ t, s: score(t) }))
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map(({ t }) => toCard(t));
}

export function getAllReviews() {
  return data()
    .trips.flatMap((t) => t.reviews.map((r) => ({ ...r, trip: { slug: t.slug, title: t.title } })))
    .filter((r) => r.body.length > 60);
}

/* ------------------------------------------------------------------ posts */

export const getPosts = () => data().posts;
export const getPostCards = () => data().posts.map(toPostCard);
export const getPost = (slug: string) => data().posts.find((p) => p.slug === slug) ?? null;

export function getPostsInCategory(slug: string): PostCard[] {
  const { categories } = data().taxonomies;
  const term = categories.find((c) => c.slug === slug);
  // A parent category also lists its children's posts, as WordPress did.
  const family = new Set([slug, ...categories.filter((c) => term && c.parent === term.id).map((c) => c.slug)]);
  return data()
    .posts.filter((p) => p.categories.some((c) => family.has(c)))
    .map(toPostCard);
}

export function getRelatedPosts(post: Post, limit = 3): PostCard[] {
  return data()
    .posts.filter((p) => p.slug !== post.slug && p.categories.some((c) => post.categories.includes(c)))
    .slice(0, limit)
    .map(toPostCard);
}

/** Guides that mention a region, for the trip and destination pages. */
const REGION_CATEGORY: Record<string, string> = {
  "everest-region": "everest-trekking-guide",
  "annapurna-region": "annapurna-trekking-guide",
  "langtang-region": "langtang-trekking-guide",
  "manaslu-region": "manaslu-trekking-guide",
  "remote-area-trekking": "remote-trekking-guide",
};

export function getGuidesForRegion(region: string, limit = 3): PostCard[] {
  const cat = REGION_CATEGORY[region];
  return cat ? getPostsInCategory(cat).slice(0, limit) : [];
}

/* ------------------------------------------------------------------ pages, team, terms */

export const getPages = () => data().pages;
export const getPage = (slug: string) => data().pages.find((p) => p.slug === slug) ?? null;
export const getTeam = () => data().team;
export const getMember = (slug: string) => data().team.find((m) => m.slug === slug) ?? null;
export const getTaxonomies = () => data().taxonomies;
export const getCredits = () => data().credits;

export function getDestination(slug: string) {
  return data().taxonomies.destinations.find((d) => d.slug === slug) ?? null;
}
export function getActivity(slug: string) {
  return data().taxonomies.activities.find((d) => d.slug === slug) ?? null;
}
export function getCategory(slug: string) {
  return data().taxonomies.categories.find((d) => d.slug === slug) ?? null;
}

/** Destinations and activities that actually have trips, for menus and filters. */
export function getLiveTerms() {
  const trips = data().trips;
  const { destinations, activities } = data().taxonomies;
  const withCount = <T extends { slug: string }>(terms: T[], field: "destinations" | "activities") =>
    terms
      .map((t) => ({ ...t, trips: trips.filter((x) => x[field].includes(t.slug)).length }))
      .filter((t) => t.trips > 0);
  return {
    destinations: withCount(destinations, "destinations"),
    activities: withCount(activities, "activities"),
  };
}
