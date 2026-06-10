"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-1 text-sm text-[var(--muted)]">
      <Link href="/" className="hover:text-[var(--accent)]">
        Home
      </Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          <ChevronRight className="h-3.5 w-3.5" />
          {item.href ? (
            <Link href={item.href} className="hover:text-[var(--accent)]">
              {item.label}
            </Link>
          ) : (
            <span style={{ color: "var(--workana-navy)" }}>{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
