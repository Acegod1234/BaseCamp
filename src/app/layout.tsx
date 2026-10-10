import type { Metadata, Viewport } from "next";
import { Big_Shoulders, JetBrains_Mono, Manrope, Newsreader } from "next/font/google";
import { JsonLd } from "@/components/json-ld";
import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";
import { SmoothScroll } from "@/components/site/smooth-scroll";
import { Integrations } from "@/components/site/integrations";
import { WhatsappFab } from "@/components/site/whatsapp-fab";
import { organizationLd, websiteLd } from "@/lib/seo";
import { site } from "@/lib/site";
import "./globals.css";

/**
 * Four faces, each with one job:
 * Big Shoulders  headlines, condensed like a trail sign at a pass
 * Newsreader     the single italic word that gives a headline its voice
 * Manrope        everything people read
 * JetBrains Mono altitudes, codes and figures that line up
 */
const display = Big_Shoulders({ variable: "--font-display-face", subsets: ["latin"], display: "swap", axes: ["opsz"] });
const serif = Newsreader({ variable: "--font-serif-face", subsets: ["latin"], style: ["italic"], display: "swap", axes: ["opsz"] });
const sans = Manrope({ variable: "--font-sans-face", subsets: ["latin"], display: "swap" });
const mono = JetBrains_Mono({ variable: "--font-mono-face", subsets: ["latin"], display: "swap", weight: ["400", "500"] });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} | Trekking & Tours in Nepal since 2009`, template: `%s | ${site.name}` },
  description: site.description,
  applicationName: site.name,
  formatDetection: { telephone: false },
  openGraph: { siteName: site.name, locale: "en_US", type: "website" },
  verification: {
    google: process.env.NEXT_PUBLIC_GSC_VERIFICATION || undefined,
    other: process.env.NEXT_PUBLIC_BING_VERIFICATION ? { "msvalidate.01": process.env.NEXT_PUBLIC_BING_VERIFICATION } : undefined,
  },
};

export const viewport: Viewport = {
  themeColor: "#14261f",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${serif.variable} ${sans.variable} ${mono.variable}`} data-scroll-behavior="smooth">
      <body id="top" className="min-h-dvh">
        <a href="#main" className="bg-marigold text-pine-night sr-only z-[100] rounded-full px-5 py-3 font-bold focus:not-sr-only focus:fixed focus:top-4 focus:left-4">
          Skip to content
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
        <WhatsappFab />
        <Integrations />
        <SmoothScroll />
        <JsonLd data={[organizationLd(), websiteLd()]} />
      </body>
    </html>
  );
}
