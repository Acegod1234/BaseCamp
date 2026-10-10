"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { ArrowRight, ChevronDown, Mail, Menu as MenuIcon, Phone, Search, X } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { FacebookIcon, InstagramIcon, WhatsappIcon, XIcon } from "@/components/icons";
import { Portal } from "@/components/portal";
import { ThemeToggle } from "@/components/theme-toggle";
import { site, whatsappHref } from "@/lib/site";
import { cn } from "@/lib/utils";

type NavLink = { label: string; href: string };
export type NavColumn = { title: string; href: string | null; sections: { title: string | null; href: string | null; links: NavLink[] }[] };
export type NavTop = { label: string; href: string | null; columns: NavColumn[] | null };

/** True when the current page lives anywhere under a menu entry. */
function contains(item: NavTop, path: string) {
  if (item.href && item.href !== "/" && path.startsWith(item.href)) return true;
  return (item.columns ?? []).some(
    (c) => c.href === path || c.sections.some((s) => s.href === path || s.links.some((l) => l.href === path)),
  );
}

export function HeaderClient({ items }: { items: NavTop[] }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState<number | null>(null);
  const [mobile, setMobile] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 8));

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setOpen(null);
      setMobile(false);
    });
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  useEffect(() => {
    document.documentElement.style.overflow = mobile ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(null);
        setMobile(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobile]);

  const show = (i: number) => {
    if (timer.current) clearTimeout(timer.current);
    setOpen(i);
  };
  const hide = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(null), 150);
  };

  const panel = open !== null ? items[open] : null;

  return (
    <>
      <header data-site-header className="fixed inset-x-0 top-0 z-50" onMouseLeave={hide}>
        {/* The live site's own top line, folded away once the page scrolls. */}
        <div
          className={cn(
            "bg-pine-night hidden overflow-hidden text-[0.8rem] text-white/80 transition-[max-height,opacity] duration-500 lg:block",
            scrolled ? "max-h-0 opacity-0" : "max-h-9 opacity-100",
          )}
        >
          <div className="mx-auto flex h-9 max-w-[90rem] items-center justify-between gap-6 px-6">
            <div className="flex items-center gap-5">
              <span className="inline-flex items-center gap-2">
                <span className="relative flex size-2">
                  <span className="bg-moss absolute inline-flex size-full animate-ping rounded-full opacity-70" />
                  <span className="bg-moss relative inline-flex size-2 rounded-full" />
                </span>
                Available 24/7 - Call Us Anytime
              </span>
              <a href={`tel:${site.mobileHref}`} className="link-draw inline-flex items-center gap-1.5 font-semibold text-white">
                <Phone className="size-3.5" aria-hidden /> +977 9851 029616 [Shree]
              </a>
              <a href={`mailto:${site.email}`} className="link-draw hidden items-center gap-1.5 hover:text-white xl:inline-flex">
                <Mail className="size-3.5" aria-hidden /> {site.email}
              </a>
            </div>
            <div className="flex items-center gap-3.5">
              <a href={site.social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:text-white"><FacebookIcon className="size-4" /></a>
              <a href={site.social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-white"><InstagramIcon className="size-4" /></a>
              <a href={site.social.x} target="_blank" rel="noopener noreferrer" aria-label="X" className="hover:text-white"><XIcon className="size-3.5" /></a>
            </div>
          </div>
        </div>

        <div
          data-header-bar
          className={cn(
            "relative border-b transition-[background-color,box-shadow,border-color] duration-500",
            scrolled || panel
              ? "border-line bg-snow/95 shadow-[0_10px_30px_-20px_oklch(0.2_0.04_170/0.35)] backdrop-blur-xl"
              : "border-line/60 bg-snow/90 backdrop-blur-xl",
          )}
        >
          <div className="mx-auto flex h-16 max-w-[90rem] items-center gap-3 px-4 sm:px-6 lg:h-[4.5rem]">
            <Link href="/" aria-label="Base Camp Adventure home" className="shrink-0">
              <Logo priority className="w-[96px] sm:w-[108px] lg:w-[116px]" />
            </Link>

            <nav aria-label="Main" className="ml-auto hidden items-center xl:flex 2xl:ml-10">
              {items.map((it, i) => {
                const active = contains(it, pathname);
                const cls = cn(
                  "relative inline-flex h-[4.5rem] items-center gap-1 px-3 text-[0.9rem] font-semibold whitespace-nowrap transition-colors 2xl:px-3.5",
                  active || open === i ? "text-pine" : "text-ink-soft hover:text-ink",
                );
                const bar = (
                  <span
                    aria-hidden
                    className={cn("bg-marigold absolute inset-x-3 bottom-0 h-[3px] rounded-t-full transition-transform duration-300 2xl:inset-x-3.5", active || open === i ? "scale-x-100" : "scale-x-0")}
                  />
                );
                if (!it.columns) {
                  return (
                    <Link key={it.label} href={it.href ?? "/"} className={cls} onMouseEnter={() => setOpen(null)} aria-current={active ? "page" : undefined}>
                      {it.label}
                      {bar}
                    </Link>
                  );
                }
                return (
                  <button
                    key={it.label}
                    type="button"
                    className={cls}
                    aria-expanded={open === i}
                    onMouseEnter={() => show(i)}
                    onFocus={() => show(i)}
                    onClick={() => (open === i ? setOpen(null) : show(i))}
                  >
                    {it.label}
                    <ChevronDown className={cn("size-3.5 opacity-60 transition-transform", open === i && "rotate-180")} aria-hidden />
                    {bar}
                  </button>
                );
              })}
            </nav>

            <div className="ml-auto flex items-center gap-1 xl:ml-4">
              <Link href="/trip/" aria-label="Search trips" className="grid size-10 place-items-center rounded-full text-ink transition-colors hover:bg-snow-2">
                <Search className="size-[1.15rem]" aria-hidden />
              </Link>
              <ThemeToggle />
              <Link
                href="/customize-trip/"
                className="bg-pine hover:bg-pine-deep ml-1 hidden items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold text-white transition-colors sm:inline-flex xl:hidden 2xl:inline-flex"
              >
                Customize Trip <ArrowRight className="size-4" aria-hidden />
              </Link>
              <button
                type="button"
                onClick={() => setMobile(true)}
                aria-label="Open menu"
                aria-expanded={mobile}
                className="bg-ink text-snow ml-1 grid size-10 place-items-center rounded-full xl:hidden"
              >
                <MenuIcon className="size-5" aria-hidden />
              </button>
            </div>
          </div>

          {/* Dropdown: columns straight from the live menu, centred under the bar. */}
          <AnimatePresence>
            {panel?.columns ? (
              <motion.div
                key={panel.label}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                onMouseEnter={() => open !== null && show(open)}
                className="absolute inset-x-0 top-full hidden px-6 pt-2 xl:block"
              >
                <div className="mx-auto w-fit max-w-[min(86rem,100%)] overflow-hidden rounded-[1.4rem] border border-line bg-card shadow-[0_30px_70px_-30px_oklch(0.2_0.04_170/0.45)]">
                  <div className="flex">
                    {panel.columns.map((c, ci) => (
                      <div key={ci} className={cn("w-[15.5rem] p-5", ci > 0 && "border-l border-line")}>
                        {c.href ? (
                          <Link href={c.href} className="eyebrow mb-3 block truncate text-pine hover:underline">{c.title}</Link>
                        ) : (
                          <p className="eyebrow mb-3 truncate text-muted">{c.title}</p>
                        )}
                        {c.sections.map((s, si) => (
                          <div key={si} className={cn(si > 0 && "mt-4")}>
                            {s.title ? (
                              s.href ? (
                                <Link href={s.href} className="mb-1.5 block px-2 text-sm font-bold text-ink hover:text-pine">{s.title}</Link>
                              ) : (
                                <p className="mb-1.5 px-2 text-sm font-bold text-ink">{s.title}</p>
                              )
                            ) : null}
                            <ul className="space-y-px">
                              {s.links.map((l) => (
                                <li key={l.href + l.label}>
                                  <Link
                                    href={l.href}
                                    className={cn(
                                      "block rounded-lg px-2 py-1.5 text-[0.85rem] leading-snug transition-colors hover:bg-snow-2 hover:text-pine",
                                      pathname === l.href ? "bg-snow-2 font-semibold text-pine" : "text-ink-soft",
                                    )}
                                  >
                                    {l.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                  {panel.href ? (
                    <Link href={panel.href} className="flex items-center justify-between border-t border-line bg-snow px-5 py-3 text-sm font-bold text-pine hover:bg-snow-2">
                      View all {panel.label} <ArrowRight className="size-4" aria-hidden />
                    </Link>
                  ) : null}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </header>

      {/* Phone and tablet menu */}
      <Portal>
        <AnimatePresence>
          {mobile ? (
            <motion.div
              data-lenis-prevent
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="fixed inset-0 z-[150] flex flex-col bg-snow xl:hidden"
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
            >
              <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-4 pt-[env(safe-area-inset-top)] sm:px-6">
                <Logo className="w-[96px]" />
                <div className="flex items-center gap-1">
                  <ThemeToggle />
                  <button type="button" onClick={() => setMobile(false)} aria-label="Close menu" className="bg-ink text-snow grid size-10 place-items-center rounded-full">
                    <X className="size-5" aria-hidden />
                  </button>
                </div>
              </div>

              <nav aria-label="Mobile" className="flex-1 overflow-y-auto overscroll-contain px-4 pt-2 pb-6 sm:px-6">
                <Link href="/" className="flex items-center justify-between border-b border-line py-4 text-lg font-bold">
                  Home <ArrowRight className="size-4 text-muted" aria-hidden />
                </Link>
                {items.map((it, i) =>
                  it.columns ? (
                    <MobileGroup key={it.label} item={it} delay={i} pathname={pathname} />
                  ) : (
                    <Link key={it.label} href={it.href ?? "/"} className="flex items-center justify-between border-b border-line py-4 text-lg font-bold">
                      {it.label} <ArrowRight className="size-4 text-muted" aria-hidden />
                    </Link>
                  ),
                )}
                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  {[
                    { href: "/trip/", label: "All trips" },
                    { href: "/blogs/", label: "Travel journal" },
                    { href: "/gallery/", label: "Gallery" },
                    { href: "/testimonials/", label: "Reviews" },
                  ].map((l) => (
                    <Link key={l.href} href={l.href} className="rounded-xl border border-line bg-card px-4 py-3 font-semibold">
                      {l.label}
                    </Link>
                  ))}
                </div>
              </nav>

              <div className="grid shrink-0 gap-2 border-t border-line bg-card px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6">
                <p className="text-center text-xs font-semibold text-muted">Available 24/7 - Call Us Anytime</p>
                <div className="grid grid-cols-2 gap-2">
                  <a href={`tel:${site.mobileHref}`} className="flex items-center justify-center gap-2 rounded-full border border-line py-3 text-sm font-bold">
                    <Phone className="size-4" aria-hidden /> Call Shree
                  </a>
                  <a href={whatsappHref()} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-full bg-[#25D366] py-3 text-sm font-bold text-white">
                    <WhatsappIcon className="size-4" /> WhatsApp
                  </a>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </Portal>
    </>
  );
}

function MobileGroup({ item, delay, pathname }: { item: NavTop; delay: number; pathname: string }) {
  const [open, setOpen] = useState(contains(item, pathname));
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 * delay, duration: 0.3 }} className="border-b border-line">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full items-center justify-between py-4 text-left text-lg font-bold">
        {item.label}
        <ChevronDown className={cn("size-5 text-muted transition-transform", open && "rotate-180 text-pine")} aria-hidden />
      </button>
      <motion.div initial={false} animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden" inert={!open}>
        <div className="space-y-4 pb-5">
          {item.columns?.map((c, ci) => (
            <div key={ci}>
              {c.title.trim() ? (
                c.href ? (
                  <Link href={c.href} className="eyebrow mb-1.5 block text-pine">{c.title}</Link>
                ) : (
                  <p className="eyebrow mb-1.5 text-muted">{c.title}</p>
                )
              ) : null}
              {c.sections.map((s, si) => (
                <div key={si} className={cn(si > 0 && "mt-2")}>
                  {s.title ? <p className="px-1 py-1 text-sm font-bold">{s.title}</p> : null}
                  <ul className="grid gap-px">
                    {s.links.map((l) => (
                      <li key={l.href + l.label}>
                        <Link href={l.href} className={cn("block rounded-lg px-3 py-2.5 text-[0.95rem]", pathname === l.href ? "bg-snow-2 font-semibold text-pine" : "text-ink-soft active:bg-snow-2")}>
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ))}
          {item.href ? (
            <Link href={item.href} className="text-pine inline-flex items-center gap-1.5 px-1 text-sm font-bold">
              View all {item.label} <ArrowRight className="size-4" aria-hidden />
            </Link>
          ) : null}
        </div>
      </motion.div>
    </motion.div>
  );
}
