import { WorkanaLogo } from "./WorkanaLogo";

interface WorkanaHeaderProps {
  scraping: boolean;
  onScrape: () => void;
}

export function WorkanaHeader({ scraping, onScrape }: WorkanaHeaderProps) {
  return (
    <header
      className="sticky top-0 z-50 border-b bg-[var(--header-bg)]"
      style={{ borderColor: "var(--header-border)", boxShadow: "var(--shadow-sm)" }}
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <WorkanaLogo />
        <button
          type="button"
          onClick={onScrape}
          disabled={scraping}
          className="btn-workana"
        >
          {scraping && (
            <span className="live-dot inline-block h-2 w-2 rounded-full" />
          )}
          {scraping ? "Scraping..." : "Start Scrape"}
        </button>
      </div>

      <div
        className="border-t px-4 py-2 sm:px-6"
        style={{
          borderColor: "var(--header-border)",
          background: "var(--workana-gradient-soft)",
        }}
      >
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-1 text-xs font-medium text-[var(--workana-navy)]">
          <span className="flex items-center gap-1.5">
            <CheckIcon />
            Protected Payments
          </span>
          <span className="flex items-center gap-1.5">
            <CheckIcon />
            IT &amp; Programming
          </span>
          <span className="flex items-center gap-1.5">
            <CheckIcon />
            All Languages
          </span>
          <span className="text-[var(--muted)]">
            Real-time project intelligence for Latin America
          </span>
        </div>
      </div>
    </header>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <circle cx="7" cy="7" r="7" fill="#29B8B6" fillOpacity="0.15" />
      <path
        d="M4 7l2 2 4-4"
        stroke="#29B8B6"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
