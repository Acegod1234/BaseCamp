import Image from "@/components/image";
import Link from "next/link";
import { Clock } from "lucide-react";
import type { PostCard as Card } from "@/lib/types";
import { formatDate, titleCase } from "@/lib/utils";

export function PostCard({ post, categoryNames, priority = false }: { post: Card; categoryNames?: Record<string, string>; priority?: boolean }) {
  const cat = post.categories[0];
  return (
    <Link href={`/${post.slug}/`} className="group flex h-full flex-col">
      <div className="zoom-img relative aspect-[16/11] overflow-hidden rounded-[1.4rem] bg-snow-2">
        {post.cover ? <Image src={post.cover.src} alt={post.cover.alt || post.title} fill preload={priority} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" quality={70} className="object-cover object-right-bottom" /> : null}
        {cat ? (
          <span className="glass absolute top-4 left-4 rounded-full px-3 py-1.5 text-xs font-semibold text-ink">{categoryNames?.[cat] ?? titleCase(cat)}</span>
        ) : null}
      </div>
      <p className="eyebrow mt-5 flex items-center gap-2 text-muted">
        {formatDate(post.published)} <span aria-hidden>·</span> <Clock className="size-3" aria-hidden /> {post.readingMinutes} min
      </p>
      <h3 className="mt-2 text-xl font-bold leading-snug transition-colors group-hover:text-pine">{post.title}</h3>
      <p className="mt-2 line-clamp-2 text-[0.95rem] text-ink-soft">{post.excerpt}</p>
    </Link>
  );
}
