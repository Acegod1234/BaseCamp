import { getMenu } from "@/lib/content";
import type { MenuItem } from "@/lib/types";
import { HeaderClient, type NavColumn, type NavTop } from "./header-client";

const leaf = (i: MenuItem) => ({ label: i.label, href: i.href });

/**
 * Turns the live site's menu into header columns.
 *
 * A child with its own children becomes a titled column (Annapurna Region,
 * Day Tours, Bhutan…); loose trip links are collected into a column named
 * after the menu item. Long lists split in two so a panel never runs down
 * the screen.
 */
function columnsFor(item: MenuItem): NavColumn[] {
  const cols: NavColumn[] = [];
  const loose: { label: string; href: string }[] = [];
  for (const child of item.children ?? []) {
    if (child.children?.length) {
      const nested = child.children.some((g) => g.children?.length);
      cols.push({
        title: child.label,
        href: child.href !== "#" ? child.href : null,
        sections: nested
          ? child.children.map((g) => ({ title: g.label, href: g.href !== "#" ? g.href : null, links: (g.children ?? []).map(leaf) }))
          : [{ title: null, href: null, links: child.children.map(leaf) }],
      });
    } else {
      loose.push(leaf(child));
    }
  }
  if (loose.length) {
    const half = loose.length > 9 ? Math.ceil(loose.length / 2) : loose.length;
    cols.push({ title: item.label, href: item.href !== "#" ? item.href : null, sections: [{ title: null, href: null, links: loose.slice(0, half) }] });
    if (loose.length > half) cols.push({ title: " ", href: null, sections: [{ title: null, href: null, links: loose.slice(half) }] });
  }
  // Long single columns split too (e.g. 13 Annapurna treks stay readable).
  return cols.flatMap((c) => {
    const links = c.sections.length === 1 ? c.sections[0].links : null;
    if (!links || links.length <= 10) return [c];
    const half = Math.ceil(links.length / 2);
    return [
      { ...c, sections: [{ ...c.sections[0], links: links.slice(0, half) }] },
      { title: " ", href: null, sections: [{ title: null, href: null, links: links.slice(half) }] },
    ];
  });
}

export function SiteHeader() {
  const items: NavTop[] = getMenu()
    .filter((i) => i.label !== "Home")
    .map((i) => ({
      label: i.label,
      href: i.href !== "#" ? i.href : null,
      columns: i.children?.length ? columnsFor(i) : null,
    }));
  return <HeaderClient items={items} />;
}
