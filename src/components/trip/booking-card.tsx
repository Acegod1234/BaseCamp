"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, BadgeCheck, CalendarDays, Clock4, Lock, Minus, Phone, Plus, ShieldCheck, Users } from "lucide-react";
import { WhatsappIcon } from "@/components/icons";
import { site, whatsappHref } from "@/lib/site";
import type { Price } from "@/lib/types";
import { cn, usd } from "@/lib/utils";

/** Earliest bookable date: two weeks out gives time for permits and flights. */
function minDate() {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return d.toISOString().slice(0, 10);
}

export function unitPrice(price: Price, pax: number) {
  const tier = price.groupTiers.find((t) => pax >= t.from && (!t.to || pax <= t.to));
  return tier?.price ?? price.amount;
}

export function BookingCard({ slug, title, price, days }: { slug: string; title: string; price: Price | null; days: number }) {
  const [date, setDate] = useState("");
  const [pax, setPax] = useState(Math.max(1, price?.minPax ?? 1));
  const each = price ? unitPrice(price, pax) : null;
  const total = each ? each * pax : null;
  const saving = price?.regular && each ? (price.regular - each) * pax : null;

  const href = useMemo(() => {
    const q = new URLSearchParams({ trip: slug, pax: String(pax) });
    if (date) q.set("date", date);
    return `/booking/?${q}`;
  }, [slug, pax, date]);

  return (
    <div className="overflow-hidden rounded-[1.8rem] border border-line bg-white shadow-[0_30px_60px_-40px_oklch(0.2_0.04_170/0.55)]">
      <div className="bg-pine-deep aura relative overflow-hidden relative p-6 text-white">
        <p className="eyebrow text-marigold">Let&apos;s get you there</p>
        {price ? (
          <div className="mt-3 flex items-end gap-3">
            <span className="font-display text-6xl font-black leading-none">{usd(each)}</span>
            <span className="pb-1 text-sm text-white/70">
              {price.regular ? <span className="mr-1 line-through">{usd(price.regular)}</span> : null}
              per person
            </span>
          </div>
        ) : (
          <p className="font-display mt-3 text-4xl font-black uppercase leading-none">Price on request</p>
        )}
        {saving && saving > 0 ? (
          <p className="bg-marigold text-pine-night mt-3 inline-block rounded-full px-3 py-1 text-xs font-bold">You save {usd(saving)}</p>
        ) : null}
      </div>

      <div className="space-y-4 p-6">
        <label htmlFor="bk-date" className="block">
          <span className="mb-1.5 flex items-center gap-2 text-sm font-semibold"><CalendarDays className="text-pine size-4" aria-hidden /> Start date</span>
          <input
            id="bk-date"
            type="date"
            min={minDate()}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-12 w-full rounded-xl border border-line bg-snow px-4 font-medium outline-none focus:border-pine focus:ring-4 focus:ring-pine/10"
          />
          <span className="mt-1 block text-xs text-muted">Any day suits: we run private departures. {days} days on the trip.</span>
        </label>

        <div>
          <span className="mb-1.5 flex items-center gap-2 text-sm font-semibold"><Users className="text-pine size-4" aria-hidden /> Travellers</span>
          <div className="flex h-12 items-center justify-between rounded-xl border border-line bg-snow px-2">
            <button type="button" onClick={() => setPax((p) => Math.max(1, p - 1))} aria-label="One fewer traveller" className="grid size-9 place-items-center rounded-lg hover:bg-white disabled:opacity-40" disabled={pax <= 1}>
              <Minus className="size-4" aria-hidden />
            </button>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span key={pax} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} className="font-display text-2xl font-black" aria-live="polite">
                {pax} {pax === 1 ? "person" : "people"}
              </motion.span>
            </AnimatePresence>
            <button type="button" onClick={() => setPax((p) => Math.min(30, p + 1))} aria-label="One more traveller" className="grid size-9 place-items-center rounded-lg hover:bg-white">
              <Plus className="size-4" aria-hidden />
            </button>
          </div>
        </div>

        {total ? (
          <div className="flex items-baseline justify-between border-t border-dashed border-line pt-4">
            <span className="text-sm text-muted">Total for {pax}</span>
            <span className="font-display text-3xl font-black">{usd(total)}</span>
          </div>
        ) : null}

        {price ? (
          <Link href={href} className="bg-marigold text-pine-night flex w-full items-center justify-center gap-2 rounded-full py-4 font-bold transition-colors hover:bg-pine hover:text-white">
            <Lock className="size-4" aria-hidden /> Book &amp; pay securely
          </Link>
        ) : null}
        <Link
          href={`/contact-us/?trip=${encodeURIComponent(title)}${date ? `&date=${date}` : ""}&pax=${pax}`}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-full py-4 font-bold transition-colors",
            price ? "border border-line hover:border-pine" : "bg-pine text-white hover:bg-pine-deep",
          )}
        >
          Enquire about this trip <ArrowRight className="size-4" aria-hidden />
        </Link>

        <ul className="space-y-2 pt-2 text-sm text-ink-soft">
          <li className="flex gap-2"><BadgeCheck className="text-moss size-4 shrink-0" aria-hidden /> Licensed local guide, permits included</li>
          <li className="flex gap-2"><ShieldCheck className="text-moss size-4 shrink-0" aria-hidden /> Card payment through WeTravel, encrypted</li>
          <li className="flex gap-2"><Clock4 className="text-moss size-4 shrink-0" aria-hidden /> We reply within a few hours, 24/7</li>
        </ul>
      </div>

      <div className="flex items-center gap-3 border-t border-line bg-snow p-5">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold">Talk with Shree</p>
          <a href={`tel:${site.mobileHref}`} className="text-pine inline-flex items-center gap-1.5 text-sm">
            <Phone className="size-3.5" aria-hidden /> {site.mobile}
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
export function MobileBookingBar({ slug, title, price }: { slug: string; title: string; price: Price | null }) {
  return (
    <div className="glass pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-line px-4 pt-3 lg:hidden">
      <div className="flex items-center justify-between gap-4">
        <div>
          {price ? (
            <>
              <p className="font-display text-3xl font-black leading-none">{usd(price.amount)}</p>
              <p className="text-xs text-muted">per person{price.regular ? <> · <span className="line-through">{usd(price.regular)}</span></> : null}</p>
            </>
          ) : (
            <p className="font-bold">Price on request</p>
          )}
        </div>
        <Link
          href={price ? `/booking/?trip=${slug}` : `/contact-us/?trip=${encodeURIComponent(title)}`}
          className="bg-marigold text-pine-night inline-flex items-center gap-2 rounded-full px-6 py-3.5 font-bold"
        >
          {price ? "Book now" : "Enquire"} <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
