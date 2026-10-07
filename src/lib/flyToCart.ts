/**
 * Animates a copy of a product image from its position on the page into the
 * header cart button. Purely decorative; skipped when reduced motion is preferred.
 */
export function flyToCart(source: HTMLElement | null) {
  if (typeof window === "undefined" || !source) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const target = document.getElementById("cart-button");
  if (!target || typeof source.animate !== "function") return;

  const from = source.getBoundingClientRect();
  const to = target.getBoundingClientRect();
  const ghost = source.cloneNode(true) as HTMLElement;
  Object.assign(ghost.style, {
    position: "fixed",
    left: `${from.left}px`,
    top: `${from.top}px`,
    width: `${from.width}px`,
    height: `${from.height}px`,
    zIndex: "2000",
    pointerEvents: "none",
    borderRadius: "16px",
    objectFit: "cover",
  });
  document.body.appendChild(ghost);

  const dx = to.left + to.width / 2 - (from.left + from.width / 2);
  const dy = to.top + to.height / 2 - (from.top + from.height / 2);
  ghost
    .animate(
      [
        { transform: "translate(0, 0) scale(1)", opacity: 1 },
        {
          transform: `translate(${dx * 0.6}px, ${dy - 80}px) scale(0.5)`,
          opacity: 0.9,
          offset: 0.6,
        },
        { transform: `translate(${dx}px, ${dy}px) scale(0.08)`, opacity: 0.2 },
      ],
      { duration: 700, easing: "cubic-bezier(.5,-0.2,.6,1)" },
    )
    .finished.finally(() => ghost.remove());
}
