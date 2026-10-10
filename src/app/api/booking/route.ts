import { NextResponse } from "next/server";
import { z } from "zod";
import { getTrip } from "@/lib/content";
import { rateLimited, record, reference } from "@/lib/server/store";
import { createPaymentLink, wetravelEnabled } from "@/lib/server/wetravel";

const schema = z.object({
  trip: z.string().trim().min(1).max(200),
  date: z.iso.date("Please choose a start date"),
  pax: z.coerce.number().int().min(1).max(30),
  plan: z.enum(["deposit", "full"]),
  name: z.string().trim().min(2, "Please tell us the lead traveller's name").max(120),
  email: z.email("That email address doesn't look right").max(200),
  phone: z.string().trim().min(6, "A phone or WhatsApp number helps us reach you on the trail").max(40),
  country: z.string().trim().min(2, "Please choose a nationality").max(80),
  notes: z.string().trim().max(3000).optional().or(z.literal("")),
  terms: z.literal(true, "Please accept the booking terms"),
});

/** Deposit taken at booking; the balance is due before departure. */
const DEPOSIT_RATE = 0.2;

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (rateLimited(`booking:${ip}`, 8)) {
    return NextResponse.json({ ok: false, error: "Too many attempts. Please try again shortly." }, { status: 429 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.issues[0]?.message ?? "Please check the form" }, { status: 400 });
  }
  const input = parsed.data;

  const trip = getTrip(input.trip);
  if (!trip || !trip.price) {
    return NextResponse.json({ ok: false, error: "This trip is booked on request. Please send an enquiry." }, { status: 400 });
  }
  const earliest = new Date();
  earliest.setDate(earliest.getDate() + 13);
  if (new Date(input.date) < earliest) {
    return NextResponse.json({ ok: false, error: "Please choose a start date at least two weeks away, or call us for a short-notice trip." }, { status: 400 });
  }

  // The price is always worked out here, never taken from the browser.
  const tier = trip.price.groupTiers.find((t) => input.pax >= t.from && (!t.to || input.pax <= t.to));
  const each = tier?.price ?? trip.price.amount;
  const total = Math.round(each * input.pax * 100) / 100;
  const deposit = Math.round(total * DEPOSIT_RATE * 100) / 100;
  const ref = reference("BCA");

  let paymentUrl: string | null = null;
  let paymentError: string | null = null;
  if (wetravelEnabled()) {
    const link = await createPaymentLink({
      reference: ref,
      title: trip.title,
      startDate: input.date,
      days: trip.days,
      amount: total,
      deposit: input.plan === "deposit" ? deposit : undefined,
    });
    if ("url" in link) paymentUrl = link.url;
    else paymentError = link.error;
  }

  await record("bookings", {
    reference: ref,
    status: paymentUrl ? "awaiting-payment" : "requested",
    trip: trip.slug,
    title: trip.title,
    date: input.date,
    pax: input.pax,
    each,
    total,
    plan: input.plan,
    due: input.plan === "deposit" ? deposit : total,
    lead: { name: input.name, email: input.email, phone: input.phone, country: input.country },
    notes: input.notes,
    paymentError,
    ip,
  });

  return NextResponse.json({ ok: true, reference: ref, paymentUrl, total, due: input.plan === "deposit" ? deposit : total });
}
