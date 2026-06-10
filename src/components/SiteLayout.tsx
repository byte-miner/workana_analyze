"use client";

import Link from "next/link";
import { WorkanaLogo } from "./WorkanaLogo";
import { Navbar } from "./Navbar";

const SITE_MAX_WIDTH = 1170;

interface SiteLayoutProps {
  children: React.ReactNode;
  variant?: "default" | "dashboard";
}

export function SiteLayout({ children, variant = "default" }: SiteLayoutProps) {
  const isDashboard = variant === "dashboard";

  return (
    <>
      <header
        className="sticky top-0 z-50 bg-white"
        style={{ borderBottom: "1px solid var(--border-color)" }}
      >
        <div
          className="mx-auto flex h-[70px] items-stretch gap-4 px-4 sm:px-6"
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
        </div>
      </header>

      <main
        className={`page-enter mx-auto ${isDashboard ? "home-dashboard-shell" : "px-4 py-8 sm:px-6"}`}
        style={{ maxWidth: SITE_MAX_WIDTH }}
      >
        {children}
      </main>
    </>
  );
}
