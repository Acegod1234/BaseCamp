"use client";

import Link from "next/link";
import { useState } from "react";
import { Accent } from "@/components/section-heading";
import { VideoReviewCarousel } from "@/components/home/video-review-carousel";
import { ReviewCarousel } from "@/components/home/review-carousel";
import Image from "@/components/image";
import { ArrowRight, MessageCircle, Star, Video } from "lucide-react";
import videoReviews from "@/content/video-reviews.json";
import google from "@/content/google-reviews.json";
import trustindex from "@/content/trustindex-reviews.json";
import { cn } from "@/lib/utils";

export function ReviewSources({ children, tripadvisorRating }: { children: React.ReactNode; tripadvisorRating?: number }) {
  const [source, setSource] = useState("tripadvisor");
  const [writtenSource, setWrittenSource] = useState("tripadvisor");
  const tabs = [{ id: "tripadvisor", label: "Tripadvisor reviews", logo: "/brand/partners/tripadvisor.png", rating: tripadvisorRating }, { id: "trustindex", label: "Trustindex reviews", logo: "/brand/reviews/trustindex.svg", rating: trustindex.rating }, { id: "google", label: "Google reviews", logo: "/brand/reviews/google.svg", rating: 4.6 }];
  const isGoogle = source === "google";
  const sourceLabel = isGoogle ? "Google" : "Trustindex";
  const sourceUrl = isGoogle ? google.url : google.sourceUrl;
  const selectedReviews = isGoogle
    ? google.reviews.map((review) => ({ ...review, body: review.excerpt, title: "" }))
    : trustindex.reviews.map((review) => ({ ...review, publishedLabel: "", isExcerpt: false }));
  return (
    <>
      <div className="relative mb-6 flex items-center justify-center pr-14 sm:px-16">{source !== "video" ? <div role="tablist" aria-label="Review source" className="inline-flex max-w-full flex-wrap justify-center gap-1 rounded-2xl border border-line bg-card p-1 shadow-sm">{tabs.map((tab, index) => <button key={tab.id} id={`reviews-tab-${tab.id}`} role="tab" type="button" aria-label={tab.label} title={tab.label} aria-selected={source === tab.id} aria-controls="reviews-source-panel" tabIndex={source === tab.id ? 0 : -1} onClick={() => { setSource(tab.id); setWrittenSource(tab.id); }} onKeyDown={(event) => {
        const next = event.key === "ArrowRight" ? (index + 1) % tabs.length : event.key === "ArrowLeft" ? (index + tabs.length - 1) % tabs.length : event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : -1;
        if (next >= 0) { event.preventDefault(); setSource(tabs[next].id); setWrittenSource(tabs[next].id); document.getElementById(`reviews-tab-${tabs[next].id}`)?.focus(); }
      }} className={cn("flex flex-col items-center gap-1 rounded-xl border px-3 py-2 transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine sm:px-4", source === tab.id ? "border-pine/20 bg-pine/10 text-pine shadow-sm" : "border-transparent text-muted hover:bg-pine/5 hover:text-pine")}><Image src={tab.logo} alt="" width={96} height={36} unoptimized className="h-7 w-16 object-contain sm:w-18" /><span><span className="flex items-center gap-1 text-[0.65rem]" aria-label={tab.rating ? `${tab.rating} out of 5` : "Rating unavailable"}><span className="relative inline-flex text-[#fbbc04]" aria-hidden><span className="flex">{Array.from({ length: 5 }, (_, i) => <Star key={i} className="size-2.5" />)}</span><span className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${(tab.rating ?? 0) / 5 * 100}%` }}><span className="flex w-max">{Array.from({ length: 5 }, (_, i) => <Star key={i} className="size-2.5 fill-current" />)}</span></span></span></span></span></button>)}</div> : <div className="flex min-h-12 flex-col items-center justify-center gap-1.5 text-center"><h3 className="font-display text-[clamp(1.6rem,2.4vw,2.5rem)] leading-tight tracking-[-0.035em] text-ink">Travellers <Accent>on film.</Accent></h3><span className="text-xs leading-relaxed text-muted sm:text-sm">Hear their journey. Tap the video to pause or resume.</span></div>}<button type="button" id="reviews-tab-video" aria-label={source === "video" ? "Written reviews" : "Video review"} aria-controls="reviews-source-panel" onClick={() => setSource(source === "video" ? writtenSource : "video")} className="group absolute right-0 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-pine text-white shadow-[0_14px_30px_-10px_rgba(0,130,145,0.7)] sm:size-12"><span className="absolute inset-0 rounded-full bg-pine opacity-25 motion-safe:animate-ping" aria-hidden />{source === "video" ? <MessageCircle className="relative size-5" aria-hidden /> : <Video className="relative size-5" aria-hidden />}<span className="pointer-events-none absolute right-0 top-full mt-3 whitespace-nowrap rounded-lg bg-ink px-3 py-2 text-xs font-semibold text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">{source === "video" ? "Written reviews" : "Video review"}</span></button></div>
      <div id="reviews-source-panel" role="tabpanel" aria-labelledby={`reviews-tab-${source}`}>
        {source === "video" ? <div className="video-reviews-layout"><div className="video-reviews-heading"><p className="eyebrow text-pine">Video reviews</p><h2 className="font-display mt-3 text-[clamp(2.25rem,3.2vw,3.5rem)] leading-[1.05] tracking-tight">Stories from<br /><Accent>our travellers.</Accent></h2></div><div className="min-w-0 w-full overflow-hidden py-2"><VideoReviewCarousel items={videoReviews} /></div><div className="mt-3 flex justify-end border-t border-line pt-4 lg:col-span-2"><Link href="/testimonials/" className="inline-flex items-center gap-1.5 text-sm font-bold text-pine hover:underline">All reviews <ArrowRight className="size-4" aria-hidden /></Link></div></div> : source === "tripadvisor" ? children : (
          <>
            <div className="grid gap-5">
              <div><p className="eyebrow text-pine">{sourceLabel} reviews</p><h2 className="font-display mt-3 text-[clamp(2.25rem,3.2vw,3.5rem)] leading-[1.05] tracking-tight">From our<br /><Accent>travellers.</Accent></h2>
                <p className="mt-3 text-xs leading-relaxed text-muted">{isGoogle ? `${selectedReviews.length} reviews from our Google listing. Full comments are included where available; entries marked as excerpts continue on Google.` : `${selectedReviews.length} featured reviews from our Trustindex profile. Read complete comments below or visit Trustindex for the full collection.`}</p>
              </div>
              <div className="min-w-0 w-full overflow-hidden py-2"><ReviewCarousel key={source} items={selectedReviews.map((review) => ({ name: review.name, title: review.title, body: review.body, rating: review.rating, published: review.published, publishedLabel: review.publishedLabel ? `${review.publishedLabel} (as shown)` : undefined, isExcerpt: review.isExcerpt, place: null, country: null, flag: null, sourceUrl, sourceLabel }))} /></div>
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4 text-xs text-muted"><p>{isGoogle ? <>Reviews for {google.business}, transcribed from Google screenshots and Google-source entries on <a href={google.sourceUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-pine underline underline-offset-4">Trustindex</a>. Snapshot: 13 October 2026.</> : <>Reviews published on <a href={google.sourceUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-pine underline underline-offset-4">Trustindex</a> for {google.business}.</>}</p><a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-pine hover:underline">All {sourceLabel} reviews ↗</a></div>
          </>
        )}
      </div>
    </>
  );
}
