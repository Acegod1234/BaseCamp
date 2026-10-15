import photos from "@/content/place-photos.json";

export type PlacePhotoImage = { src: string; width?: number; height?: number; alt: string; author: string; license: string; licenseUrl: string; source: string };
export type PlacePhoto = PlacePhotoImage & { name: string; previewSrc?: string; images?: PlacePhotoImage[] };
const aliases: Record<string, string> = { ktm: "kathmandu", namche: "namche-bazaar", gorakshep: "gorakshep", "gorak-shep": "gorakshep", "annapurna-base-camp": "annapurna-sanctuary", abc: "annapurna-sanctuary", chame: "chame-rural-municipality", syabrubesi: "syaphru" };
const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function photoOfPlace(place: string): PlacePhoto | null {
  const key = normalize(place);
  const entries = photos as Record<string, PlacePhoto>;
  if (entries[aliases[key] ?? key]) return entries[aliases[key] ?? key];
  return null;
}
