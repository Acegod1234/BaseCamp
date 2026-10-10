/**
 * Company details. One place, so the header, footer, schema and contact
 * pages can never disagree. The admin's Settings screen will own these later.
 */
export const site = {
  name: "Base Camp Adventure",
  legalName: "Base Camp Adventure Pvt. Ltd.",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://basecampadventure.com").replace(/\/$/, ""),
  tagline: "Trekking & tours with the people who call Nepal home.",
  description:
    "Base Camp Adventure is a Kathmandu trekking and tour company founded in 2009 by a local guide. Everest, Annapurna, Langtang, Manaslu, peak climbing, Bhutan and Tibet.",
  founded: 2009,
  address: {
    street: "Tridevi Marg, Thamel",
    city: "Kathmandu",
    region: "Bagmati",
    postalCode: "44600",
    country: "NP",
    poBox: "P.O. Box 5019",
  },
  geo: { lat: 27.7154, lng: 85.3123 },
  phone: "+977-1-4517875",
  mobile: "+977 985 102 9616",
  mobileHref: "+9779851029616",
  whatsapp: "9779851029616",
  email: "info@basecampadventure.com",
  contactPerson: "Shree Ghimire",
  social: {
    facebook: "https://www.facebook.com/BaseCampAdventure/",
    instagram: "https://www.instagram.com/base.camp.adventure/",
    x: "https://x.com/basecampadven",
  },
  registration: [
    { label: "Govt. Reg.", value: "68517/066/067" },
    { label: "VAT", value: "303970392" },
    { label: "NMA", value: "776" },
    { label: "TAAN", value: "2010-868" },
  ],
  affiliations: [
    { name: "Nepal Tourism Board", logo: "/brand/ntb.png", href: "https://ntb.gov.np/" },
    { name: "Trekking Agencies' Association of Nepal", logo: "/brand/taan.png", href: "https://www.taan.org.np/" },
    { name: "Nepal Mountaineering Association", logo: "/brand/nma.png", href: "https://www.nepalmountaineering.org/" },
    { name: "Himalayan Rescue Association", logo: "/brand/hra.png", href: "https://himalayanrescue.org/" },
    { name: "Kathmandu Environmental Education Project", logo: "/brand/keep.png", href: "https://keepnepal.org/" },
    { name: "TripAdvisor", logo: "/brand/tripadvisor.png", href: "https://www.tripadvisor.com/" },
    { name: "Bookmundi", logo: "/brand/bookmundi.png", href: "https://www.bookmundi.com/" },
  ],
  integrations: {
    ga4: process.env.NEXT_PUBLIC_GA4_ID ?? "",
    tawkProperty: process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID ?? "",
    tawkWidget: process.env.NEXT_PUBLIC_TAWK_WIDGET_ID ?? "default",
  },
} as const;

export const whatsappHref = (text = "Namaste Base Camp Adventure, I would like to ask about a trip.") =>
  `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`;

/** Region photography and the short line each region is known for. */
export const regionMeta: Record<string, { photo: string; line: string; peak: string; altitude: number }> = {
  "everest-region": { photo: "/photos/ama-dablam.webp", line: "Base camp, Gokyo Lakes & the three high passes", peak: "Kala Patthar", altitude: 5545 },
  "annapurna-region": { photo: "/photos/machapuchare.webp", line: "The sanctuary, the circuit & Poon Hill sunrises", peak: "Thorong La", altitude: 5416 },
  "langtang-region": { photo: "/photos/langtang-sunrise.webp", line: "Glacier valleys & Tamang heritage, close to Kathmandu", peak: "Tserko Ri", altitude: 4984 },
  "manaslu-region": { photo: "/photos/manaslu.webp", line: "The quiet circuit around the eighth-highest peak", peak: "Larkya La", altitude: 5106 },
  "remote-area-trekking": { photo: "/photos/mustang.webp", line: "Mustang, Dolpo, Makalu & Kanchenjunga", peak: "Kanchenjunga BC", altitude: 5143 },
  nepal: { photo: "/photos/kathmandu-boudhanath.webp", line: "Temples, jungle safaris & lakeside Pokhara", peak: "Nagarkot", altitude: 2175 },
  bhutan: { photo: "/photos/bhutan.webp", line: "Tiger's Nest, dzongs & the Druk Path", peak: "Jimilang Tsho", altitude: 3880 },
  tibet: { photo: "/photos/tibet.webp", line: "Lhasa, Kailash & Everest's north face", peak: "Everest North BC", altitude: 5200 },
};

export const activityMeta: Record<string, { photo: string; icon: string; line: string }> = {
  "trekking-in-nepal": { photo: "/photos/cho-la-trekkers.webp", icon: "footprints", line: "Teahouse treks from 3 to 24 days" },
  "nepal-peak-climbing": { photo: "/photos/island-peak.webp", icon: "mountain-snow", line: "Trekking peaks from 5,500 to 6,500 m" },
  "nepal-tour": { photo: "/photos/kathmandu-boudhanath.webp", icon: "landmark", line: "Heritage, culture & wildlife" },
  "river-rafting-in-nepal": { photo: "/photos/rafting.webp", icon: "waves", line: "Trishuli, Bhotekoshi, Kali Gandaki & more" },
  "day-tours": { photo: "/photos/pokhara-lake.webp", icon: "sun", line: "City tours, hikes & scenic flights" },
  "tours-in-bhutan": { photo: "/photos/bhutan.webp", icon: "castle", line: "The last Himalayan kingdom" },
  "tours-in-tibet": { photo: "/photos/tibet.webp", icon: "tent", line: "Lhasa, Kailash & the high plateau" },
};

export const difficultyLabel: Record<string, string> = {
  easy: "Easy",
  medium: "Moderate",
  hard: "Challenging",
  extreme: "Strenuous",
};
