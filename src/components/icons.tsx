import {
  Castle,
  Compass,
  Footprints,
  Landmark,
  MountainSnow,
  Sun,
  Tent,
  Waves,
  type LucideIcon,
} from "lucide-react";

/** Activity icons by name, so menus built on the server can pick an icon. */
export const activityIcons: Record<string, LucideIcon> = {
  footprints: Footprints,
  "mountain-snow": MountainSnow,
  landmark: Landmark,
  waves: Waves,
  sun: Sun,
  castle: Castle,
  tent: Tent,
  compass: Compass,
};

export function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M13.5 21v-7.5h2.5l.4-3h-2.9V8.6c0-.9.3-1.5 1.5-1.5h1.5V4.4c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2.4H8v3h2.6V21h2.9z" />
    </svg>
  );
}

export function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden {...props}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M17.8 3h3l-6.6 7.6L22 21h-6.1l-4.8-6.2L5.6 21h-3l7.1-8.1L2.2 3h6.2l4.3 5.7L17.8 3zm-1 16.2h1.7L7.3 4.7H5.5l11.3 14.5z" />
    </svg>
  );
}

export function WhatsappIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M12 2.2A9.7 9.7 0 0 0 3.6 16.8L2.3 21.7l5-1.3A9.7 9.7 0 1 0 12 2.2zm0 17.7a8 8 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1 1 12 19.9zm4.4-6c-.2-.1-1.4-.7-1.7-.8-.2-.1-.4-.1-.5.1l-.8 1c-.1.2-.3.2-.5.1a6.6 6.6 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.5-.4h-.5a.9.9 0 0 0-.7.3 2.8 2.8 0 0 0-.9 2.1 5 5 0 0 0 1 2.6 11.3 11.3 0 0 0 4.4 3.9c1.6.7 2.3.8 3.1.6.5-.1 1.4-.6 1.6-1.1.2-.6.2-1 .1-1.1l-.5-.3z" />
    </svg>
  );
}

/** Card scheme marks, drawn simply in their brand colours for the checkout. */
export function PaymentMarks({ className }: { className?: string }) {
  return (
    <div className={className} aria-label="We accept Visa, Mastercard, American Express, UnionPay and JCB">
      <svg viewBox="0 0 48 30" className="h-7 w-auto" aria-hidden>
        <rect width="48" height="30" rx="5" fill="#fff" stroke="#e3e3e3" />
        <text x="24" y="20" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="900" fontStyle="italic" fontSize="13" fill="#1A1F71">VISA</text>
      </svg>
      <svg viewBox="0 0 48 30" className="h-7 w-auto" aria-hidden>
        <rect width="48" height="30" rx="5" fill="#fff" stroke="#e3e3e3" />
        <circle cx="20" cy="15" r="8" fill="#EB001B" />
        <circle cx="28" cy="15" r="8" fill="#F79E1B" fillOpacity=".9" />
        <path d="M24 8.1a8 8 0 0 1 0 13.8 8 8 0 0 1 0-13.8z" fill="#FF5F00" />
      </svg>
      <svg viewBox="0 0 48 30" className="h-7 w-auto" aria-hidden>
        <rect width="48" height="30" rx="5" fill="#2E77BC" />
        <text x="24" y="19" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="800" fontSize="9" fill="#fff">AMEX</text>
      </svg>
      <svg viewBox="0 0 48 30" className="h-7 w-auto" aria-hidden>
        <rect width="48" height="30" rx="5" fill="#fff" stroke="#e3e3e3" />
        <path d="M9 6h10l-4 18H5z" fill="#E21836" />
        <path d="M19 6h10l-4 18H15z" fill="#00447C" />
        <path d="M29 6h12l-4 18H25z" fill="#007B84" />
        <text x="24" y="18" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="800" fontSize="6.5" fill="#fff">UnionPay</text>
      </svg>
      <svg viewBox="0 0 48 30" className="h-7 w-auto" aria-hidden>
        <rect width="48" height="30" rx="5" fill="#fff" stroke="#e3e3e3" />
        <rect x="9" y="7" width="9" height="16" rx="3" fill="#0E4C96" />
        <rect x="19.5" y="7" width="9" height="16" rx="3" fill="#E21836" />
        <rect x="30" y="7" width="9" height="16" rx="3" fill="#007940" />
        <text x="24" y="18.5" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="800" fontSize="7" fill="#fff">JCB</text>
      </svg>
    </div>
  );
}
