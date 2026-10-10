import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

/**
 * No crawl-delay: the old site's `Crawl-delay: 10` slowed Bing to one page
 * every ten seconds. AI crawlers are welcome, so the trips can be cited in
 * ChatGPT, Claude, Perplexity and Google's AI answers. Toggles move to the
 * admin's SEO screen later.
 */
export default function robots(): MetadataRoute.Robots {
  const privatePaths = ["/api/", "/booking/", "/thank-you/"];
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: privatePaths },
      { userAgent: ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-User", "Claude-SearchBot", "PerplexityBot", "Google-Extended", "Applebot-Extended", "CCBot"], allow: "/", disallow: privatePaths },
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
