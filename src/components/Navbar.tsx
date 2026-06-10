"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { navLinks } from "@/data/workanaData";

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav
      className="flex min-w-0 items-stretch overflow-x-auto"
      aria-label="Main navigation"
    >
      <ul className="flex items-stretch gap-4 sm:gap-6 md:gap-8 lg:gap-10">
        {navLinks.map(({ href, label }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);

          return (
            <li key={href} className="flex shrink-0">
              <Link
                href={href}
                className={`nav-link${active ? " nav-link-active" : ""}`}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
