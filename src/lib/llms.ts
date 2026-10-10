import { getLiveTerms, getPostCards, getTrips } from "@/lib/content";
import { abs } from "@/lib/seo";
import { difficultyLabel, site } from "@/lib/site";
import type { Trip } from "@/lib/types";

const strip = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

function tripLine(t: Trip, regionNames: Record<string, string>) {
  const bits = [
    `${t.days} days`,
    t.maxAltitude ? `max ${t.maxAltitude.toLocaleString("en-US")} m` : null,
    t.price ? `from US$${t.price.amount.toLocaleString("en-US")} per person` : "price on request",
    t.difficulty ? difficultyLabel[t.difficulty] : null,
    regionNames[t.destinations[0]],
  ].filter(Boolean);
  return `- [${t.title}](${abs(`/trip/${t.slug}/`)}): ${bits.join(", ")}. ${t.summary}`;
}

/** /llms.txt: a short, link-rich map of the site for language models. */
export function llmsIndex() {
  const { destinations } = getLiveTerms();
  const names = Object.fromEntries(destinations.map((d) => [d.slug, d.name]));
  const trips = getTrips();
  const lines = [
    `# ${site.name}`,
    "",
    `> ${site.description} Licensed by the Government of Nepal (Reg. 68517/066/067), TAAN member 2010-868, NMA member 776. Office: ${site.address.street}, Kathmandu. Phone/WhatsApp 24/7: ${site.mobile}. Email: ${site.email}.`,
    "",
    "## Trips by region",
    ...destinations.flatMap((d) => [
      "",
      `### [${d.name}](${abs(`/destinations/${d.slug}/`)})`,
      ...trips.filter((t) => t.destinations[0] === d.slug).map((t) => tripLine(t, names)),
    ]),
    "",
    "## Planning guides",
    ...getPostCards().slice(0, 60).map((p) => `- [${p.title}](${abs(`/${p.slug}/`)}): ${p.excerpt}`),
    "",
    "## Company",
    `- [About us](${abs("/about-us/")})`,
    `- [Our team](${abs("/our-team/")})`,
    `- [Booking terms](${abs("/terms-and-conditions/")})`,
    `- [Customize a trip](${abs("/customize-trip/")})`,
    `- [Contact](${abs("/contact-us/")})`,
    "",
    `Full trip details for every itinerary: ${abs("/llms-full.txt")}`,
  ];
  return lines.join("\n");
}

/** /llms-full.txt: every trip with its facts, day-by-day plan and inclusions. */
export function llmsFull() {
  const { destinations } = getLiveTerms();
  const names = Object.fromEntries(destinations.map((d) => [d.slug, d.name]));
  return [
    `# ${site.name}: full trip catalogue`,
    "",
    ...getTrips().flatMap((t) => [
      `## ${t.title}`,
      `URL: ${abs(`/trip/${t.slug}/`)}`,
      `Region: ${names[t.destinations[0]] ?? "Nepal"} | Duration: ${t.days} days | Max altitude: ${t.maxAltitude ? `${t.maxAltitude} m` : "n/a"} | Price: ${t.price ? `US$${t.price.amount} per person` : "on request"}${t.rating ? ` | Rating: ${t.rating.value}/5 from ${t.rating.count} reviews` : ""}`,
      "",
      t.summary,
      "",
      ...(t.itinerary.length ? ["Itinerary:", ...t.itinerary.map((d) => `- Day ${d.day}: ${d.title}`), ""] : []),
      ...(t.includes.length ? ["Included:", ...t.includes.map((x) => `- ${x}`), ""] : []),
      ...(t.excludes.length ? ["Not included:", ...t.excludes.map((x) => `- ${x}`), ""] : []),
      ...(t.faqs.length ? ["FAQ:", ...t.faqs.slice(0, 8).map((f) => `- Q: ${f.q}\n  A: ${strip(f.a)}`), ""] : []),
      "---",
      "",
    ]),
  ].join("\n");
}
