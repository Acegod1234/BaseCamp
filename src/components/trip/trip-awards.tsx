import Image from "@/components/image";
import tripadvisor from "@/content/tripadvisor.json";

/** Awards displayed on the original Base Camp Adventure package pages. */
export function TripAwards() {
  return <section aria-label="Tripadvisor awards" className="overflow-hidden rounded-2xl border border-line bg-card p-5 shadow-sm">
    <h2 className="text-sm font-bold tracking-wide text-ink">Travellers’ Choice Awards</h2>
    <div className="mt-2 h-0.5 w-10 bg-pine" aria-hidden />
    <div className="mt-5 grid grid-cols-2 items-center gap-3 rounded-xl bg-white p-3">
      {[{ year: 2024, width: 200, height: 220 }, { year: 2023, width: 100, height: 151 }].map(({ year, width, height }) => <a key={year} href={tripadvisor.url} target="_blank" rel="noopener noreferrer" aria-label={`Base Camp Adventure — Tripadvisor Travellers’ Choice ${year}`} className="flex min-h-40 items-center justify-center rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine"><Image src={`/brand/awards/travellers-choice-${year}.png`} alt={`Tripadvisor Travellers’ Choice ${year}`} width={width} height={height} unoptimized className="h-auto max-h-40 w-auto max-w-full object-contain" /></a>)}
    </div>
    <h3 className="mt-6 text-sm font-bold tracking-wide text-ink">Certificates of Excellence</h3>
    <div className="mt-2 h-0.5 w-10 bg-pine" aria-hidden />
    <div className="mt-4 grid grid-cols-2 gap-2">
      {[2019, 2017, 2016, 2014, 2013].map((year) => <a key={year} href={tripadvisor.url} target="_blank" rel="noopener noreferrer" aria-label={`Base Camp Adventure — Tripadvisor Certificate of Excellence ${year}`} className="flex flex-col items-center rounded-xl border border-line bg-white px-2 py-3 text-center transition-colors hover:border-pine focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine"><span className="text-[10px] font-semibold leading-tight text-[#243238]">Certificate of Excellence</span><span className="mt-1 text-sm font-bold text-[#00788a]">{year}</span><Image src="/brand/awards/certificate-of-excellence.png" alt="Tripadvisor" width={152} height={124} unoptimized className="mt-1 h-auto w-24 object-contain" /><span className="mt-1 text-[10px] font-semibold text-[#00788a] underline underline-offset-2">Read reviews</span></a>)}
    </div>
  </section>;
}
