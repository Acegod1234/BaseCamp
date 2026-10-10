"use client";

import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

const subscribe = () => () => {};

/**
 * Renders overlays (photo viewer, filter sheet) straight into <body>.
 *
 * A `position: fixed` element inside an animated or blurred ancestor is
 * positioned against that ancestor and stacked inside it, so the site header
 * could sit on top of the photo viewer. At the body level nothing can.
 */
export function Portal({ children }: { children: React.ReactNode }) {
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  return mounted ? createPortal(children, document.body) : null;
}
