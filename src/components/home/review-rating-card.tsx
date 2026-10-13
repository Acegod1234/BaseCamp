import Image from "@/components/image";
import { ArrowUpRight, Star } from "lucide-react";

export function ReviewRatingCard({ platform, href, rating, count, note }: { platform: "Google" | "Trustindex"; href: string; rating?: number; count?: number; note?: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="group mt-6 flex items-center gap-3 rounded-2xl border border-line bg-card p-4 pr-5 shadow-[0_20px_40px_-32px_oklch(0.2_0.04_200/0.6)] transition-colors hover:border-pine/40">
      <span className="flex w-20 shrink-0 flex-col items-center gap-1.5"><Image src={`/brand/reviews/${platform.toLowerCase()}.svg`} alt="" width={48} height={48} unoptimized className="h-10 w-12 object-contain" /><span className="text-xs font-semibold text-ink">{platform}</span></span>
      <span className="min-w-0 flex-1">
        {rating !== undefined ? <span className="flex flex-wrap items-baseline gap-2"><span className="font-display text-2xl leading-none text-ink">{rating.toFixed(1)}</span><span className="inline-flex gap-0.5" aria-label={`${rating} out of 5`}>{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="size-3.5 fill-[#fbbc04] text-[#fbbc04]" aria-hidden />)}</span></span> : <span className="block font-semibold text-ink">See live rating</span>}
        <span className="mt-1 block text-xs text-ink-soft">{count !== undefined ? <><strong className="text-ink">{count} reviews</strong> on {platform}</> : <>On our Google Maps listing</>}</span>
        {note ? <span className="mt-1 block text-[0.65rem] text-muted">{note}</span> : null}
        {rating !== undefined ? <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-line" aria-hidden><span className="block h-full rounded-full bg-[#34e0a1]" style={{ width: `${rating / 5 * 100}%` }} /></span> : null}
      </span>
      <ArrowUpRight className="size-5 shrink-0 text-pine transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
    </a>
  );
}
