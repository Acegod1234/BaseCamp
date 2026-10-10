import Image from "next/image";
import { getCredits } from "@/lib/content";
import { meta } from "@/lib/seo";

export const metadata = meta({
  path: "/photo-credits/",
  title: "Photo credits",
  description: "Credits and licences for the landscape photographs used on this site.",
});

export default function CreditsPage() {
  const credits = getCredits();
  return (
    <section className="mx-auto max-w-[80rem] px-4 pt-36 pb-24 sm:px-6">
      <h1 className="font-display text-6xl font-black uppercase">Photo credits</h1>
      <p className="mt-4 max-w-2xl text-ink-soft">
        Trip and team photographs are Base Camp Adventure&apos;s own. The landscape photographs below come from Wikimedia Commons and are used under their Creative Commons licences.
      </p>
      <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {credits.map((c) => (
          <li key={c.key} className="overflow-hidden rounded-2xl border border-line bg-white">
            <div className="relative aspect-[16/10]">
              <Image src={c.src} alt={c.title} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover" />
            </div>
            <div className="p-4 text-sm">
              <p className="font-semibold">{c.title}</p>
              <p className="mt-1 text-muted">
                {c.author.split("\n")[0]} ·{" "}
                {c.licenseUrl ? (
                  <a href={c.licenseUrl} target="_blank" rel="noopener noreferrer" className="text-pine underline">
                    {c.license}
                  </a>
                ) : (
                  c.license
                )}{" "}
                ·{" "}
                <a href={c.source} target="_blank" rel="noopener noreferrer" className="text-pine underline">
                  Source
                </a>
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
