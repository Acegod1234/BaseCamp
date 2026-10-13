"use client";

import { useState } from "react";
import { Accent } from "@/components/section-heading";
import { ReviewCarousel } from "@/components/home/review-carousel";
import { ReviewRatingCard } from "@/components/home/review-rating-card";
import google from "@/content/google-reviews.json";
import trustindex from "@/content/trustindex-reviews.json";
import { cn } from "@/lib/utils";

export function ReviewSources({ children }: { children: React.ReactNode }) {
  const [source, setSource] = useState("tripadvisor");
  const tabs = [{ id: "tripadvisor", label: "Tripadvisor reviews" }, { id: "trustindex", label: "Trustindex reviews" }, { id: "google", label: "Google reviews" }];
  const isGoogle = source === "google";
  const sourceLabel = isGoogle ? "Google" : "Trustindex";
  const sourceUrl = isGoogle ? google.url : google.sourceUrl;
  const selectedReviews = isGoogle
    ? google.reviews.map((review) => ({ ...review, body: review.excerpt, title: "" }))
    : trustindex.reviews.map((review) => ({ ...review, publishedLabel: "", isExcerpt: false }));
  return (
    <>
      <div className="mb-5 flex justify-end"><div role="tablist" aria-label="Review source" className="inline-flex max-w-full flex-wrap justify-center rounded-2xl border border-line bg-card p-1 sm:rounded-full">{tabs.map((tab, index) => <button key={tab.id} id={`reviews-tab-${tab.id}`} role="tab" type="button" aria-selected={source === tab.id} aria-controls="reviews-source-panel" tabIndex={source === tab.id ? 0 : -1} onClick={() => setSource(tab.id)} onKeyDown={(event) => {
        const next = event.key === "ArrowRight" ? (index + 1) % tabs.length : event.key === "ArrowLeft" ? (index + tabs.length - 1) % tabs.length : event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : -1;
        if (next >= 0) { event.preventDefault(); setSource(tabs[next].id); document.getElementById(`reviews-tab-${tabs[next].id}`)?.focus(); }
      }} className={cn("rounded-full px-4 py-2.5 text-xs font-semibold transition-colors sm:text-sm", source === tab.id ? "bg-pine text-white" : "text-muted hover:text-pine")}>{tab.label}</button>)}</div></div>
      <div id="reviews-source-panel" role="tabpanel" aria-labelledby={`reviews-tab-${source}`}>
        {source === "tripadvisor" ? children : (
          <>
            <div className="grid items-center gap-6 lg:grid-cols-[0.8fr_1.7fr] lg:gap-12">
              <div><p className="eyebrow text-pine">{sourceLabel} reviews</p><h2 className="font-display mt-3 text-[clamp(2.25rem,3.2vw,3.5rem)] leading-[1.05] tracking-tight">From our<br /><Accent>travellers.</Accent></h2>
                <ReviewRatingCard platform={isGoogle ? "Google" : "Trustindex"} href={sourceUrl} rating={isGoogle ? 4.6 : trustindex.rating} count={isGoogle ? undefined : trustindex.totalReviews} note={isGoogle ? undefined : "Combined review sources · Checked 13 October 2026"} />
                <p className="mt-3 text-xs leading-relaxed text-muted">{isGoogle ? `${selectedReviews.length} reviews from our Google listing. Full comments are included where available; entries marked as excerpts continue on Google.` : `${selectedReviews.length} featured reviews from our Trustindex profile. Read complete comments below or visit Trustindex for the full collection.`}</p>
              </div>
              <div className="min-w-0 overflow-hidden py-2"><ReviewCarousel key={source} items={selectedReviews.map((review) => ({ name: review.name, title: review.title, body: review.body, rating: review.rating, published: review.published, publishedLabel: review.publishedLabel ? `${review.publishedLabel} (as shown)` : undefined, isExcerpt: review.isExcerpt, place: null, country: null, flag: null, sourceUrl, sourceLabel }))} /></div>
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4 text-xs text-muted"><p>{isGoogle ? <>Reviews for {google.business}, transcribed from Google screenshots and Google-source entries on <a href={google.sourceUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-pine underline underline-offset-4">Trustindex</a>. Snapshot: 13 October 2026.</> : <>Reviews published on <a href={google.sourceUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-pine underline underline-offset-4">Trustindex</a> for {google.business}.</>}</p><a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-pine hover:underline">All {sourceLabel} reviews ↗</a></div>
          </>
        )}
      </div>
    </>
  );
}

