"use client";

import { useEffect, useState } from "react";
import type { WorkanaJob } from "@/lib/types";
import { formatTimeAgo } from "@/lib/dates";
import { Pagination } from "@/components/Pagination";
import type { BudgetFilterId } from "@/lib/budgetFilters";
import { BUDGET_FILTER_OPTIONS } from "@/lib/budgetFilters";

const PAGE_SIZE = 10;

interface JobListProps {
  jobs: WorkanaJob[];
  total: number;
  page: number;
  totalPages: number;
  loading: boolean;
  budgetFilter?: BudgetFilterId;
  onPageChange: (page: number) => void;
}

export function JobList({
  jobs,
  total,
  page,
  totalPages,
  loading,
  budgetFilter = "all",
  onPageChange,
}: JobListProps) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  if (loading && jobs.length === 0) {
    return (
      <div className="workana-panel p-8 text-center text-[var(--muted)]">
        Loading projects...
      </div>
    );
  }

  if (!loading && total === 0) {
    const filterLabel = BUDGET_FILTER_OPTIONS.find((o) => o.id === budgetFilter)?.label;
    return (
      <div className="workana-panel p-8 text-center text-[var(--muted)]">
        {budgetFilter !== "all" ? (
          <>
            No jobs match <strong>{filterLabel}</strong>. Try another budget range or clear the
            filter.
          </>
        ) : (
          <>No projects yet. Click &quot;Start Scrape&quot; to fetch IT programming jobs from Workana.</>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className={`space-y-4 ${loading ? "opacity-60" : ""}`}>
        {jobs.map((job) => (
          <article key={job.id} className="workana-project-card">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <a
                  href={job.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg font-semibold hover:underline"
                  style={{ color: "var(--workana-navy)" }}
                >
                  {job.title}
                </a>
                <p className="mt-1.5 text-sm text-[var(--muted)]">
                  <span>
                    Published:{" "}
                    {job.publishedAt
                      ? formatTimeAgo(job.publishedAt, now)
                      : "Date unavailable"}
                  </span>
                  <span className="mx-3">Bids: {job.bids ?? 0}</span>
                </p>
              </div>
              <span
                className="shrink-0 text-sm font-semibold"
                style={{ color: "var(--workana-navy)" }}
              >
                {job.price || "Not defined"}
              </span>
            </div>

            {job.description && (
              <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-gray-600">
                {job.description}
              </p>
            )}

            {job.skills.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {job.skills.slice(0, 10).map((skill) => (
                  <span key={skill} className="workana-skill-pill">
                    {skill}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[var(--muted)]">
              <span
                className="rounded-md px-2 py-0.5 font-medium"
                style={{ background: "var(--accent-soft)", color: "var(--workana-bright-blue)" }}
              >
                {job.country}
              </span>
              {job.subcategory && job.subcategory !== "General" && (
                <>
                  <span>·</span>
                  <span>{job.subcategory}</span>
                </>
              )}
            </div>
          </article>
        ))}
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={PAGE_SIZE}
        onPageChange={onPageChange}
      />
    </div>
  );
}
