export function Logo({ className = "" }: { className?: string }) {
  return (
    <span
      className={`flex items-center gap-1.5 text-[22px] font-extrabold tracking-tight ${className}`}
    >
      <span
        className="grid size-8 place-items-center rounded-xl bg-[#141414] text-lime dark:bg-lime dark:text-[#141414]"
        aria-hidden
      >
        <svg
          viewBox="0 0 24 24"
          className="size-[18px]"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 7h12l-1.2 11.2a2 2 0 0 1-2 1.8H9.2a2 2 0 0 1-2-1.8L6 7Z" />
          <path d="M9 7V6a3 3 0 0 1 6 0v1" />
        </svg>
      </span>
      ebuyer<span className="text-coral">.</span>
    </span>
  );
}
