import { TripCard } from "@/components/trip-card";
import type { TripCard as Card } from "@/lib/types";

/**
 * Plain grid of trip cards. Used as the server-rendered fallback for the
 * interactive explorer, so every trip link is in the HTML search engines read.
 */
export function TripGrid({ trips, regionNames }: { trips: Card[]; regionNames: Record<string, string> }) {
  return (
    <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {trips.map((t, i) => (
        <TripCard key={t.slug} trip={t} regionName={regionNames[t.destinations[0]]} priority={i < 3} />
      ))}
    </div>
  );
}
