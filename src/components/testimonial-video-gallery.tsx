import { Accent } from "@/components/section-heading";
import { VideoReviewGallery, type VideoReview } from "@/components/video-review-gallery";

export function TestimonialVideoGallery({ items }: { items: VideoReview[] }) {
  if (!items.length) return null;
  return <div>
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div><p className="eyebrow text-pine">The traveller collection</p><h2 className="font-display mt-3 text-[clamp(2rem,3.5vw,3.5rem)] leading-tight tracking-tight">Their journeys. <Accent>On film.</Accent></h2></div>
      <p className="max-w-sm text-sm leading-relaxed text-ink-soft">Stories from the people who travelled with us. Tap a video to watch.</p>
    </div>
    <VideoReviewGallery items={items} />
  </div>;
}
