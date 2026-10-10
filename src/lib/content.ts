import "server-only";
import { readFileSync } from "node:fs";
import path from "node:path";
import { cache } from "react";
import type {
  MenuItem,
  Page,
  Photo,
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
  menu: load<MenuItem[]>("menu", []),
  photos: load<Record<string, Photo>>("photos", {}),
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
  const tagged = data().trips.filter((t) => t[field].includes(slug));
  if (tagged.length) return tagged.map(toCard);
  // Some menu categories (Expedition in Nepal, Bhutan Trek) list their trips
  // in the WordPress menu without tagging them; use the menu's list.
  const base = field === "destinations" ? "/destinations/" : "/activities/";
  return tripSlugsUnder(`${base}${slug}/`)
    .map((s) => data().trips.find((t) => t.slug === s))
    .filter((t): t is Trip => Boolean(t))
    .map(toCard);
}

/* ------------------------------------------------------------------ menu */

export const getMenu = () => data().menu;

function findMenu(items: MenuItem[], href: string): MenuItem | null {
  for (const it of items) {
    if (it.href === href) return it;
    const hit = it.children ? findMenu(it.children, href) : null;
    if (hit) return hit;
  }
  return null;
}

/** Every trip linked anywhere under a menu entry, in menu order. */
export function tripSlugsUnder(href: string): string[] {
  const node = findMenu(data().menu, href);
  const out: string[] = [];
  const walk = (items: MenuItem[] = []) =>
    items.forEach((i) => {
      const m = i.href.match(/^\/trip\/([^/]+)\/$/);
      if (m && !out.includes(m[1])) out.push(m[1]);
      walk(i.children);
    });
  if (node) walk(node.children);
  return out;
}

/* ------------------------------------------------------------------ homepage lists */

type HomeLists = { featured: string[]; popular: string[]; luxury: string[] };
const homeLists = cache(() => load<HomeLists>("home", { featured: [], popular: [], luxury: [] }));

/** The live homepage's own trip lists, in the order the office set them. */
export function getHomeList(name: keyof HomeLists): TripCard[] {
  const trips = data().trips;
  return homeLists()[name]
    .map((s) => trips.find((t) => t.slug === s))
    .filter((t): t is Trip => Boolean(t))
    .map(toCard);
}

/**
 * One honest line about a destination or activity: the first sentence of its
 * WordPress description, or failing that the names of its first trips.
 */
export function termSummary(kind: "destinations" | "activities", slug: string) {
  const term = (kind === "destinations" ? data().taxonomies.destinations : data().taxonomies.activities).find((t) => t.slug === slug);
  const trips = getTripsIn(kind, slug);
  const text = (term?.description ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const first = text.match(/^(.{40,180}?[.!?])\s/)?.[1] ?? "";
  const names = trips.slice(0, 3).map((t) => t.title.replace(/\s*[-–]\s*\d+\s*Days?$/i, "")).join(" · ");
  const highest = Math.max(0, ...trips.map((t) => t.maxAltitude ?? 0));
  return { line: first || names, trips: trips.length, highest: highest || null };
}

/* ------------------------------------------------------------------ photos */

/** Hero photographs by slot (see scripts/prepare-photos.py). */
export function photo(slot: string): Photo {
  return data().photos[slot] ?? { src: "/photos/home-banner.webp", w: 1600, h: 1200, trip: null };
}

/** Trips handpicked for the homepage, in the order the office ranks them. */
/** The live homepage's "Featured Trips", in its order. */
export function getFeaturedTrips(): TripCard[] {
  return getHomeList("featured");
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
  // Activities that only exist as menu categories still get a page.
  const menuCount = (slug: string) => tripSlugsUnder(`/activities/${slug}/`).length;
  return {
    destinations: withCount(destinations, "destinations"),
    activities: activities
      .map((t) => {
        const tagged = trips.filter((x) => x.activities.includes(t.slug)).length;
        return { ...t, trips: tagged || menuCount(t.slug) };
      })
      .filter((t) => t.trips > 0),
  };
}
