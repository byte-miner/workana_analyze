"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import type { WorkanaJob, AnalyticsSummary } from "@/lib/types";
import { JobList } from "@/components/JobList";
import { JobBudgetFilter } from "@/components/JobBudgetFilter";
import { SiteLayout } from "@/components/SiteLayout";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import type { BudgetFilterId } from "@/lib/budgetFilters";

const AnalyticsDashboard = dynamic(
  () =>
    import("@/components/AnalyticsDashboard").then((mod) => ({
      default: mod.AnalyticsDashboard,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="workana-panel p-8 text-center text-[var(--muted)]">
        Loading analytics dashboard...
      </div>
    ),
  }
);

type Tab = "live" | "analytics";
const PAGE_SIZE = 10;
const ANALYTICS_REFRESH_MS = 90_000;

export function FeedPage() {
  const [tab, setTab] = useState<Tab>("live");
  const [jobs, setJobs] = useState<WorkanaJob[]>([]);
  const [jobsTotal, setJobsTotal] = useState(0);
  const [jobsPage, setJobsPage] = useState(1);
  const [jobsTotalPages, setJobsTotalPages] = useState(1);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [budgetFilter, setBudgetFilter] = useState<BudgetFilterId>("all");

  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  const [scraping, setScraping] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const tabRef = useRef(tab);
  const jobsPageRef = useRef(jobsPage);
  const wasScrapingRef = useRef(false);
  const analyticsLoadedRef = useRef(false);
  const budgetFilterRef = useRef(budgetFilter);
  const mountedRef = useRef(false);

  useEffect(() => {
    budgetFilterRef.current = budgetFilter;
  }, [budgetFilter]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    tabRef.current = tab;
  }, [tab]);

  useEffect(() => {
    jobsPageRef.current = jobsPage;
  }, [jobsPage]);

  const fetchJobs = useCallback(
    async (page: number, filter: BudgetFilterId, options?: { silent?: boolean }) => {
      if (!options?.silent) setJobsLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(page),
          pageSize: String(PAGE_SIZE),
          budget: filter,
        });
        const res = await fetch(`/api/jobs?${params.toString()}`);
        if (!res.ok || !mountedRef.current) return;
        const data = await res.json();
        if (!mountedRef.current) return;
        setJobs(data.jobs ?? []);
        setJobsTotal(data.total ?? 0);
        setJobsPage(data.page ?? page);
        setJobsTotalPages(data.totalPages ?? 1);
      } catch (err) {
        console.error("Failed to fetch jobs:", err);
      } finally {
        if (!options?.silent && mountedRef.current) setJobsLoading(false);
      }
    },
    []
  );

  const fetchAnalytics = useCallback(async (options?: { silent?: boolean }) => {
    if (!options?.silent) setAnalyticsLoading(true);
    try {
      const res = await fetch("/api/analytics");
      if (!res.ok || !mountedRef.current) return;
      const data = await res.json();
      if (!mountedRef.current) return;
      setAnalytics(data);
      analyticsLoadedRef.current = true;
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
    } finally {
      if (!options?.silent && mountedRef.current) setAnalyticsLoading(false);
    }
  }, []);

  const refreshJobsAfterScrape = useCallback(() => {
    setJobsPage(1);
    jobsPageRef.current = 1;
    fetchJobs(1, budgetFilterRef.current, { silent: true });
    if (tabRef.current === "analytics") fetchAnalytics({ silent: true });
  }, [fetchJobs, fetchAnalytics]);

  const startScrape = async () => {
    setScraping(true);
    wasScrapingRef.current = true;
    setStatusMsg("Starting scrape...");
    try {
      const res = await fetch("/api/scrape", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setStatusMsg(data.error || "Failed to start scrape");
        setScraping(false);
        wasScrapingRef.current = false;
        return;
      }
      setStatusMsg("Scrape running — new jobs will appear automatically");
      // Kick off an early refresh in case jobs land quickly
      window.setTimeout(() => refreshJobsAfterScrape(), 5000);
    } catch {
      setStatusMsg("Failed to start scrape");
      setScraping(false);
      wasScrapingRef.current = false;
    }
  };

  const handlePageChange = (page: number) => {
    setJobsPage(page);
    fetchJobs(page, budgetFilter);
  };

  const handleBudgetFilterChange = (filter: BudgetFilterId) => {
    setBudgetFilter(filter);
    setJobsPage(1);
    fetchJobs(1, filter);
  };

  useEffect(() => {
    fetchJobs(1, "all");
  }, [fetchJobs]);

  useEffect(() => {
    if (tab !== "analytics") return;
    if (!analyticsLoadedRef.current) fetchAnalytics();
    const interval = setInterval(() => fetchAnalytics({ silent: true }), ANALYTICS_REFRESH_MS);
    return () => clearInterval(interval);
  }, [tab, fetchAnalytics]);

  useEffect(() => {
    if (!scraping) return;

    const pollScrapeStatus = async () => {
      try {
        const res = await fetch("/api/scrape");
        if (!res.ok || !mountedRef.current) return;
        const data = await res.json();
        const isRunning = Boolean(data.running);
        setScraping(isRunning);
        if (data.message) setStatusMsg(data.message);
        if (wasScrapingRef.current && !isRunning) {
          wasScrapingRef.current = false;
          refreshJobsAfterScrape();
        }
      } catch {
        /* ignore transient poll errors */
      }
    };

    const statusInterval = window.setInterval(pollScrapeStatus, 5000);
    return () => window.clearInterval(statusInterval);
  }, [scraping, refreshJobsAfterScrape]);

  useEffect(() => {
    if (!scraping) return;
    const interval = window.setInterval(() => {
      fetchJobs(1, budgetFilterRef.current, { silent: true });
    }, 12_000);
    return () => window.clearInterval(interval);
  }, [scraping, fetchJobs]);

  useEffect(() => {
    let es: EventSource | null = null;
    let reconnectTimer: number | undefined;
    let disposed = false;

    const handleStatus = (e: MessageEvent) => {
      if (!mountedRef.current) return;
      const data = JSON.parse(e.data);
      const isRunning = Boolean(data.running);
      setScraping(isRunning);
      if (data.message) setStatusMsg(data.message);
      if (wasScrapingRef.current && !isRunning) {
        wasScrapingRef.current = false;
        refreshJobsAfterScrape();
      }
    };

    const connect = () => {
      if (disposed) return;
      es = new EventSource("/api/stream");
      es.addEventListener("status", handleStatus);
      es.onerror = () => {
        es?.close();
        if (!disposed) {
          reconnectTimer = window.setTimeout(connect, 3000);
        }
      };
    };

    connect();

    return () => {
      disposed = true;
      if (reconnectTimer) window.clearTimeout(reconnectTimer);
      es?.close();
    };
  }, [fetchJobs, fetchAnalytics, refreshJobsAfterScrape]);

  const scrapeButton = (
    <button type="button" onClick={startScrape} disabled={scraping} className="btn-workana">
      {scraping && <span className="live-dot inline-block h-2 w-2 rounded-full" />}
      {scraping ? "Scraping..." : "Start Scrape"}
    </button>
  );

  return (
    <SiteLayout>
      <Breadcrumbs items={[{ label: "Live Feed" }]} />

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="workana-gradient-text text-2xl font-bold sm:text-3xl">
            IT &amp; Programming Freelance Jobs
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Real-time scraped listings with live analytics
          </p>
        </div>
        <div className="shrink-0">{scrapeButton}</div>
      </div>

      {statusMsg && (
        <div
          className="mb-6 rounded-xl px-4 py-3 text-sm"
          style={{
            background: "var(--accent-soft)",
            border: "1px solid rgba(114, 70, 229, 0.2)",
            color: "var(--workana-navy)",
          }}
        >
          {statusMsg}
        </div>
      )}

      <nav
        className="mb-6 flex gap-1 rounded-full p-1"
        style={{ background: "var(--accent-soft)", border: "1px solid var(--header-border)" }}
      >
        {(["live", "analytics"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex-1 rounded-full px-4 py-2.5 text-sm font-semibold capitalize transition ${
              tab === t
                ? "bg-white text-[var(--accent)] shadow-sm"
                : "text-[var(--muted)] hover:text-[var(--workana-navy)]"
            }`}
          >
            {t === "live" ? `Live Feed (${jobsTotal})` : "Scrape Analytics"}
          </button>
        ))}
      </nav>

      {tab === "live" ? (
        <>
          <JobBudgetFilter
            value={budgetFilter}
            onChange={handleBudgetFilterChange}
            disabled={jobsLoading}
          />
          <JobList
            jobs={jobs}
            total={jobsTotal}
            page={jobsPage}
            totalPages={jobsTotalPages}
            loading={jobsLoading}
            budgetFilter={budgetFilter}
            onPageChange={handlePageChange}
          />
        </>
      ) : (
        <AnalyticsDashboard analytics={analytics} loading={analyticsLoading} />
      )}
    </SiteLayout>
  );
}
