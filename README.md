# Base Camp Adventure

The new basecampadventure.com: a Next.js 16 site that replaces the WordPress
install while keeping every public URL exactly as it was.

## Run it

```bash
npm install
cp .env.example .env.local     # optional: WeTravel, tawk.to, GA4 keys
npm run dev                    # http://localhost:3000
npm run build && npm start     # production build: every page pre-rendered
```

## Content

All content comes from the live WordPress site through its public REST API:

```bash
npm run import:wp      # trips, posts, pages, team, taxonomies, images -> src/content, public/media
npm run fetch:photos   # licensed landscape photos and partner logos -> public/photos, public/brand
```

`src/lib/content.ts` is the only place that reads it. When the admin
(admin.basecampadventure.com) and its PostgreSQL database land, that file is
what changes; pages stay as they are.

| What | Count |
| --- | --- |
| Trips (`/trip/{slug}/`) | 120 |
| Blog posts (`/{slug}/`) | 161 |
| Pages (`/{slug}/`) | 48 |
| Destinations / activities | 8 / 7 |
| Team members (`/team/{slug}/`) | 13 |
| Images, converted to WebP | ~1,290 |

## SEO carried over

- Same URLs with trailing slashes; old plugin pages redirect (`next.config.ts`).
- Yoast titles and descriptions are imported and used as-is.
- `/wp-content/uploads/...` image URLs 301 to the new WebP files.
- JSON-LD: TravelAgency, WebSite, BreadcrumbList, TouristTrip, Product with
  AggregateRating and Review, FAQPage, BlogPosting, Person, ItemList.
- `sitemap.xml` with images and real lastmod, `robots.txt` without crawl-delay,
  `llms.txt` and `llms-full.txt` for AI search.

## Payments and chat

- Booking: `/booking/` -> `POST /api/booking` prices the trip on the server and
  creates a WeTravel payment link (`src/lib/server/wetravel.ts`).
- Enquiries: contact and tailor-made forms -> `POST /api/enquiry`.
- Until the admin exists, submissions are appended to `.data/*.jsonl`.
- tawk.to and GA4 load after the page is idle, only when their IDs are set.
