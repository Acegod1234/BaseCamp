"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { CircleCheckBig, Loader2, Lock, ShieldCheck } from "lucide-react";
import { PaymentMarks } from "@/components/icons";
import { CountrySelect } from "@/components/trip/trip-modals";

/** The live site's Online Payment Form, field for field. */
export function OnlinePaymentForm({ trips }: { trips: { slug: string; title: string }[] }) {
  const params = useSearchParams();
  const [f, setF] = useState({
    fullname: "",
    email: "",
    phone: "",
    country: "",
    trip: params.get("trip") ?? "",
    travellers: params.get("pax") ?? "",
    date: params.get("date") ?? "",
    amount: params.get("amount") ?? "",
    message: "",
    website: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<{ reference: string; paymentUrl: string | null } | null>(null);

  if (done) {
    return (
      <div className="flex flex-col items-center py-8 text-center">
        <span className="bg-moss/15 text-moss grid size-16 place-items-center rounded-full">
          {done.paymentUrl ? <Loader2 className="size-8 animate-spin" aria-hidden /> : <CircleCheckBig className="size-8" aria-hidden />}
        </span>
        <h2 className="font-display mt-5 text-4xl font-black uppercase">{done.paymentUrl ? "Opening secure payment" : "Payment request received"}</h2>
        <p className="mt-3 max-w-md text-ink-soft">
          {done.paymentUrl ? (
            <>If nothing happens, <a className="text-pine font-bold underline" href={done.paymentUrl}>continue to payment</a>.</>
          ) : (
            <>Thank you. Our team will email your secure WeTravel payment link to {f.email}.</>
          )}
        </p>
        <p className="mt-5 rounded-full bg-snow-2 px-5 py-2 font-mono text-sm">Reference {done.reference}</p>
      </div>
    );
  }

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        try {
          const res = await fetch("/api/online-payment/", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
          const json = await res.json();
          if (!json.ok) throw new Error(json.error ?? "Something went wrong");
          setDone({ reference: json.reference, paymentUrl: json.paymentUrl });
          if (json.paymentUrl) window.location.assign(json.paymentUrl);
        } catch (err) {
          setError((err as Error).message);
        } finally {
          setBusy(false);
        }
      }}
      className="grid gap-4 sm:grid-cols-2"
    >
      <F id="op-name" label="Full name *"><input id="op-name" required autoComplete="name" placeholder="Enter Full name" value={f.fullname} onChange={set("fullname")} className="input" /></F>
      <F id="op-email" label="Email *"><input id="op-email" required type="email" autoComplete="email" placeholder="Enter email" value={f.email} onChange={set("email")} className="input" /></F>
      <F id="op-phone" label="Phone *"><input id="op-phone" required type="tel" autoComplete="tel" placeholder="Enter Phone" value={f.phone} onChange={set("phone")} className="input" /></F>
      <F id="op-country" label="Country *"><CountrySelect id="op-country" required value={f.country} onChange={(v) => setF({ ...f, country: v })} /></F>
      <F id="op-trip" label="Trip *" wide>
        <select id="op-trip" required value={f.trip} onChange={set("trip")} className="input">
          <option value="">Choose a trip</option>
          {trips.map((t) => (
            <option key={t.slug} value={t.slug}>{t.title}</option>
          ))}
        </select>
      </F>
      <F id="op-pax" label="Number of travellers *"><input id="op-pax" required type="number" min={1} inputMode="numeric" placeholder="Number of travellers" value={f.travellers} onChange={set("travellers")} className="input" /></F>
      <F id="op-date" label="Trip date *"><input id="op-date" required type="date" value={f.date} onChange={set("date")} className="input" /></F>
      <F id="op-amount" label="Amount (USD) *" wide>
        <div className="relative">
          <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 font-bold text-muted">$</span>
          <input id="op-amount" required type="number" min={1} step="0.01" inputMode="decimal" placeholder="Amount" value={f.amount} onChange={set("amount")} className="input pl-8" />
        </div>
      </F>
      <F id="op-msg" label="Your message" wide><textarea id="op-msg" rows={4} placeholder="Your Message" value={f.message} onChange={set("message")} className="input py-3" /></F>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" value={f.website} onChange={set("website")} className="hidden" aria-hidden />
      {error ? <p role="alert" className="rounded-xl bg-crimson/10 px-4 py-3 text-sm font-medium text-crimson sm:col-span-2">{error}</p> : null}
      <div className="flex flex-col gap-4 border-t border-line pt-5 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2 text-xs text-muted">
          <PaymentMarks className="flex flex-wrap gap-1.5" />
          <p className="flex items-center gap-1.5"><ShieldCheck className="text-moss size-4" aria-hidden /> Paid on WeTravel&apos;s secure checkout. See our <Link href="/terms-and-conditions/" className="text-pine underline">Terms &amp; Conditions</Link>.</p>
        </div>
        <button type="submit" disabled={busy} className="bg-marigold text-pine-night inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 font-bold disabled:opacity-50">
          {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Lock className="size-4" aria-hidden />} Pay Now
        </button>
      </div>
    </form>
  );
}

function F({ id, label, wide, children }: { id: string; label: string; wide?: boolean; children: React.ReactNode }) {
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold">{label}</label>
      {children}
    </div>
  );
}
