"use client";

import Script from "next/script";
import { useEffect } from "react";
import { site } from "@/lib/site";

/**
 * Third-party scripts, each switched on by its ID alone (set in the admin's
 * Settings later; environment variables for now). Both wait until the page is
 * idle, so neither can slow the first paint or hurt Core Web Vitals.
 */
export function Integrations() {
  const { tawkProperty, tawkWidget, ga4 } = site.integrations;

  useEffect(() => {
    if (!tawkProperty) return;
    const load = () => {
      if (document.getElementById("tawk-script")) return;
      const s = document.createElement("script");
      s.id = "tawk-script";
      s.async = true;
      s.src = `https://embed.tawk.to/${tawkProperty}/${tawkWidget}`;
      s.charset = "UTF-8";
      s.setAttribute("crossorigin", "*");
      document.body.appendChild(s);
    };
    const idle = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
    const t = idle ? idle(load, { timeout: 6000 }) : window.setTimeout(load, 4000);
    return () => {
      if (!idle) window.clearTimeout(t as number);
    };
  }, [tawkProperty, tawkWidget]);

  if (!ga4) return null;
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga4}`} strategy="lazyOnload" />
      <Script id="ga4" strategy="lazyOnload">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${ga4}',{anonymize_ip:true});`}
      </Script>
    </>
  );
}
