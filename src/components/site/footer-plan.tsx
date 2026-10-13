"use client";

import { usePathname } from "next/navigation";

export function FooterPlan({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return pathname.replace(/\/$/, "") === "/our-affiliation" ? null : children;
}
