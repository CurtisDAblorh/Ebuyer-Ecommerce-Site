const MESSAGES = [
  "Free delivery on orders over £75",
  "Use code EBUYER10 for 10% off",
  "30-day free returns",
  "New drops every Friday",
  "Next-day delivery when you order by 8pm",
];

/** Scrolling promo strip. The list is duplicated so the CSS marquee loops seamlessly. */
export function AnnouncementBar() {
  return (
    <div
      className="overflow-hidden bg-lime text-[13px] font-semibold text-[#141414]"
      role="region"
      aria-label="Promotions"
    >
      <div className="flex w-max animate-marquee gap-12 py-2 hover:[animation-play-state:paused]">
        {[...MESSAGES, ...MESSAGES].map((m, i) => (
          <span
            key={i}
            className="flex items-center gap-12 whitespace-nowrap"
            aria-hidden={i >= MESSAGES.length}
          >
            {m}
            <span aria-hidden>✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
