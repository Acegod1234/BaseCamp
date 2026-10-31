import { Check } from "lucide-react";

/** A quiet, consistent verification marker at the end of reviewer rows. */
export function ReviewVerified() {
  return <span className="ml-auto inline-flex size-3.5 shrink-0 items-center justify-center rounded-full bg-emerald-600" title="Verified review" role="img" aria-label="Verified review"><Check className="size-2.5 text-white" strokeWidth={3} aria-hidden /></span>;
}
