"use client";

import Link from "next/link";
import { useState } from "react";
import { WorkanaLogo } from "./WorkanaLogo";
import { Navbar } from "./Navbar";
import { SettingsModal } from "./SettingsModal";

const SITE_MAX_WIDTH = 1170;

interface SiteLayoutProps {
  children: React.ReactNode;
  variant?: "default" | "dashboard";
}

export function SiteLayout({ children, variant = "default" }: SiteLayoutProps) {
  const isDashboard = variant === "dashboard";
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      <header
        className="sticky top-0 z-50 bg-white"
        style={{ borderBottom: "1px solid var(--border-color)" }}
      >
        <div
          className="mx-auto flex h-[70px] items-stretch justify-between gap-4 px-4 sm:px-6"
          style={{ maxWidth: SITE_MAX_WIDTH }}
        >
          <div className="flex min-w-0 items-stretch gap-6">
            <Link
              href="/"
              className="flex shrink-0 items-center"
              style={{ textDecoration: "none" }}
            >
              <WorkanaLogo />
            </Link>
            <Navbar />
          </div>

          <div className="flex shrink-0 items-center">
            <button
              type="button"
              className="settings-nav-btn"
              onClick={() => setSettingsOpen(true)}
              aria-label="Open connection settings"
            >
              <SettingsIcon />
              <span className="hidden sm:inline">Settings</span>
            </button>
          </div>
        </div>
      </header>

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />

      <main
        className={`page-enter mx-auto ${isDashboard ? "home-dashboard-shell" : "px-4 py-8 sm:px-6"}`}
        style={{ maxWidth: SITE_MAX_WIDTH }}
      >
        {children}
      </main>
    </>
  );
}

function SettingsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <path
        d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
