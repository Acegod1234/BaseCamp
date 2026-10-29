import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Image from "@/components/image";
import tripadvisor from "@/content/tripadvisor.json";

/** Awards displayed on the original Base Camp Adventure package pages. */
export function TripAwards({ full = false }: { full?: boolean }) {
  return <section aria-label="Tripadvisor awards" className="space-y-3">
    <h2 className="text-sm font-bold tracking-wide text-ink">Travellers’ Choice Awards</h2>
    <div className="mt-2 h-0.5 w-10 bg-pine" aria-hidden />
    <div className="mt-3 grid grid-cols-3 items-stretch gap-2">
      {[{ year: 2024, width: 200, height: 220 }, { year: 2023, width: 100, height: 151 }].map(({ year, width, height }) => <a key={year} href={tripadvisor.url} target="_blank" rel="noopener noreferrer" aria-label={`Base Camp Adventure — Tripadvisor Travellers’ Choice ${year}`} className="flex h-28 items-center justify-center rounded-xl border border-line bg-white p-2 shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine"><Image src={`/brand/awards/travellers-choice-${year}.png`} alt={`Tripadvisor Travellers’ Choice ${year}`} width={width} height={height} unoptimized className="h-auto max-h-24 w-auto max-w-full object-contain" /></a>)}
      <a href={tripadvisor.url} target="_blank" rel="noopener noreferrer" aria-label="Base Camp Adventure — Tripadvisor Certificate of Excellence 2019" className="flex h-28 flex-col items-center justify-center rounded-xl border border-line bg-white p-2 text-center shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine">
        <span className="text-[9px] font-semibold leading-tight text-[#243238]">Certificate of Excellence</span>
        <span className="mt-0.5 text-xs font-bold text-[#00788a]">2019</span>
        <Image src="/brand/awards/certificate-of-excellence.png" alt="Tripadvisor" width={152} height={124} unoptimized className="mt-1 h-14 w-auto max-w-full object-contain" />
      </a>
    </div>
    {full ? <>
    <h3 className="mt-6 text-sm font-bold tracking-wide text-ink">Certificates of Excellence</h3>
    <div className="mt-2 h-0.5 w-10 bg-pine" aria-hidden />
    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
      {[2019, 2017, 2016, 2014, 2013].map((year) => <a key={year} href={tripadvisor.url} target="_blank" rel="noopener noreferrer" aria-label={`Base Camp Adventure — Tripadvisor Certificate of Excellence ${year}`} className="flex flex-col items-center rounded-xl border border-line bg-white px-2 py-3 text-center transition-colors hover:border-pine focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine"><span className="text-[10px] font-semibold leading-tight text-[#243238]">Certificate of Excellence</span><span className="mt-1 text-sm font-bold text-[#00788a]">{year}</span><Image src="/brand/awards/certificate-of-excellence.png" alt="Tripadvisor" width={152} height={124} unoptimized className="mt-1 h-auto w-24 object-contain" /><span className="mt-1 text-[10px] font-semibold text-[#00788a] underline underline-offset-2">Read reviews</span></a>)}
    </div>
    </> : <Link href="/awards/" className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-pine/20 bg-card px-4 py-2 text-sm font-semibold text-pine transition-colors hover:bg-pine/5">View more <ArrowRight className="size-4" aria-hidden /></Link>}
  </section>;
}
