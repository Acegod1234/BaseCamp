"use client";

import Link from "next/link";
import { ArrowRight, MessageSquare, Phone } from "lucide-react";
import { WhatsappIcon } from "@/components/icons";
import { openTripModal } from "@/components/trip/trip-modals";
import { site, whatsappHref } from "@/lib/site";
import type { Price } from "@/lib/types";
import { usd } from "@/lib/utils";

/**
 * The booking box, laid out like the live site's: discount, "From" price
 * per adult, Book Now, Customize Trip, and "Need help with booking?".
 */
export function BookingCard({ title, price }: { slug: string; title: string; price: Price | null; days: number }) {
  const off = price?.regular ? Math.round((1 - price.amount / price.regular) * 100) : 0;
  return (
    <div className="overflow-hidden rounded-[1.8rem] border border-line bg-card shadow-[0_30px_60px_-40px_oklch(0.2_0.04_170/0.55)]">
      <div className="bg-pine-deep aura relative overflow-hidden p-6 text-white">
        {off > 0 ? <span className="bg-crimson absolute top-5 right-5 rounded-full px-3 py-1 text-xs font-bold">{off}% Off</span> : null}
        <p className="eyebrow text-marigold">{price ? "From" : "Book this trip"}</p>
        {price ? (
          <div className="mt-2 flex flex-wrap items-end gap-x-3 gap-y-1">
            {price.regular ? <span className="pb-1.5 text-lg text-white/55 line-through">{usd(price.regular)}</span> : null}
            <span className="font-display text-6xl font-black leading-none">{usd(price.amount)}</span>
            <span className="pb-1.5 text-sm text-white/70">/ Adult</span>
          </div>
        ) : (
          <p className="font-display mt-2 text-4xl font-black uppercase leading-none">Price on request</p>
        )}
      </div>

      <div className="space-y-3 p-6">
        {price ? (
          <button type="button" onClick={() => openTripModal("book")} className="bg-marigold text-pine-night flex w-full items-center justify-center gap-2 rounded-full py-4 font-bold transition-colors hover:bg-pine hover:text-white">
            Book Now <ArrowRight className="size-4" aria-hidden />
          </button>
        ) : null}
        <Link href={`/customize-trip/?trip=${encodeURIComponent(title)}`} className="flex w-full items-center justify-center gap-2 rounded-full border border-line py-4 font-bold transition-colors hover:border-pine">
          Customize Trip
        </Link>
        <div className="rounded-2xl bg-snow-2 p-4 text-center">
          <p className="text-sm font-semibold">Need help with booking?</p>
          <button type="button" onClick={() => openTripModal("enquire")} className="text-pine mt-1 inline-flex items-center gap-1.5 text-sm font-bold hover:underline">
            <MessageSquare className="size-4" aria-hidden /> Send Us A Message
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 border-t border-line bg-snow p-5">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold">Available 24/7 - Call Us Anytime</p>
          <a href={`tel:${site.mobileHref}`} className="text-pine inline-flex items-center gap-1.5 text-sm">
            <Phone className="size-3.5" aria-hidden /> +977 9851 029616 [Shree]
          </a>
        </div>
        <a href={whatsappHref(`Namaste! I'm interested in the ${title}.`)} target="_blank" rel="noopener noreferrer" aria-label="Ask on WhatsApp" className="grid size-11 place-items-center rounded-full bg-[#25D366] text-white">
          <WhatsappIcon className="size-5" />
        </a>
      </div>
    </div>
  );
}

/** Pinned to the bottom of the screen on phones. */
export function MobileBookingBar({ price }: { slug: string; title: string; price: Price | null }) {
  return (
    <div className="glass pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-line px-4 pt-3 lg:hidden">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          {price ? (
            <>
              <p className="text-[0.68rem] font-semibold tracking-wide text-muted uppercase">From</p>
              <p className="font-display text-3xl font-black leading-none">
                {usd(price.amount)} <span className="text-sm font-semibold text-muted normal-case">/ Adult</span>
              </p>
            </>
          ) : (
            <p className="text-sm font-bold">Price on request</p>
          )}
        </div>
        <div className="flex shrink-0 gap-2">
          <button type="button" onClick={() => openTripModal("enquire")} aria-label="Send Us A Message" className="grid size-12 place-items-center rounded-full border border-line bg-card">
            <MessageSquare className="size-5" aria-hidden />
          </button>
          {price ? (
            <button type="button" onClick={() => openTripModal("book")} className="bg-marigold text-pine-night inline-flex items-center gap-2 rounded-full px-6 py-3.5 font-bold">
              Book Now <ArrowRight className="size-4" aria-hidden />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
