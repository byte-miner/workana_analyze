"use client";

import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from "recharts";
import {
  Building2,
  BarChart3,
  Map,
  Bot,
  Radio,
  Check,
} from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { CountryCard } from "@/components/CountryCard";
import {
  coreFacts,
  countryRankings,
  trafficShareTop15,
  feeStructure,
  offices,
} from "@/data/workanaData";

const CHART_COLORS = [
  "#7246E5", "#BEA5FF", "#4D2D9F", "#DED2FF", "#29B8B6",
  "#7246E5", "#BEA5FF", "#4D2D9F", "#DED2FF", "#29B8B6",
  "#7246E5", "#BEA5FF", "#4D2D9F", "#DED2FF", "#29B8B6",
  "#7246E5", "#BEA5FF", "#4D2D9F", "#DED2FF", "#29B8B6",
];

const CHART_TOOLTIP = {
  contentStyle: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    boxShadow: "0 4px 14px rgba(0, 45, 114, 0.08)",
  },
};

const navCards = [
  { href: "/about", label: "About Workana", desc: "History, offices & mission", icon: Building2 },
  { href: "/projects", label: "Country Projects", desc: "Roles by region & market", icon: Map },
  { href: "/analytics", label: "Market Analytics", desc: "Traffic share & trends", icon: BarChart3 },
  { href: "/feed", label: "Live Feed", desc: "Real-time IT job scraper", icon: Radio },
  { href: "/ai-helper", label: "AI Helper", desc: "Ask about the platform", icon: Bot },
];

export default function HomePage() {
  const top6 = countryRankings.slice(0, 6);
  const chartData = trafficShareTop15.map((c) => ({
    name: c.country,
    share: c.share,
    label: c.shareLabel,
  }));

  return (
    <SiteLayout variant="dashboard">
      <div className="flex flex-col gap-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard title="Founded" value={String(coreFacts.founded)} badge="Since 2012" sub={coreFacts.foundedIn} />
          <MetricCard title="User Base" value="Millions" badge="Global" sub="Active freelancers worldwide" />
          <MetricCard title="Offices" value={String(offices.length)} badge="Regional" sub="Across 4 countries" />
          <MetricCard title="Freelancer Fee" value="5~20%" badge="Tiered" sub="Tiered per client (down to 5%)" />
        </div>

        <div className="min-w-0">
          <p className="mb-6 text-sm leading-relaxed text-[var(--muted)]">
            Comprehensive research on Latin America&apos;s leading freelance marketplace —
            founded {coreFacts.founded} in {coreFacts.foundedIn}, serving {coreFacts.userBase.freelancers.toLowerCase()} with{" "}
            {coreFacts.userBase.monthlyProjects.toLowerCase()}.
          </p>

          <section className="mb-8">
            <h2 className="home-section-title">Fee Structure Highlights</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="home-pack-card home-pack-card--default">
                <h3 className="text-lg font-medium" style={{ color: "var(--workana-navy)" }}>
                  Clients
                </h3>
                <p className="mt-2 text-sm text-[var(--muted)]">{feeStructure.clients.summary}</p>
                <p className="mt-4">
                  <span className="text-3xl font-semibold" style={{ color: "var(--workana-navy)" }}>
                    {feeStructure.clients.serviceFee}
                  </span>
                  <span className="home-discount-badge">Service fee</span>
                </p>
                <p className="mt-1 text-xs text-[var(--muted)]">Plus payment processing</p>
                <ul className="home-check-list mt-6 flex-1">
                  <li>
                    <Check className="home-check-icon h-4 w-4" strokeWidth={2.5} />
                    {feeStructure.clients.serviceFee} service fee on each transaction
                  </li>
                  <li>
                    <Check className="home-check-icon h-4 w-4" strokeWidth={2.5} />
                    {feeStructure.clients.paymentProcessing}
                  </li>
                </ul>
                <Link href="/about" className="home-btn-primary mt-6">
                  Learn about clients
                </Link>
              </div>

              <div className="home-pack-card home-pack-card--highlight">
                <h3 className="text-lg font-medium" style={{ color: "var(--workana-navy)" }}>
                  Freelancers
                </h3>
                <p className="mt-2 text-sm text-[var(--muted)]">{feeStructure.freelancers.summary}</p>
                <p className="mt-4">
                  <span className="text-3xl font-semibold" style={{ color: "var(--workana-navy)" }}>
                    20→5%
                  </span>
                  <span className="home-discount-badge">Per client</span>
                </p>
                <p className="mt-1 text-xs text-[var(--muted)]">Decreases with repeat work</p>
                <ul className="home-check-list mt-6 flex-1">
                  {feeStructure.freelancers.tiers.map((t) => (
                    <li key={t.range}>
                      <Check className="home-check-icon h-4 w-4" strokeWidth={2.5} />
                      <span>
                        <strong style={{ color: "var(--workana-navy)" }}>{t.rate}</strong> on {t.range}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link href="/about" className="home-btn-primary mt-6">
                  Learn about freelancers
                </Link>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch">
              <div className="flex w-full flex-col lg:w-[55%]">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="home-section-title mb-0">Top Country Rankings</h2>
                  <Link href="/analytics" className="text-xs font-medium text-[var(--btn-color)] hover:underline">
                    More information
                  </Link>
                </div>
                <div className="flex-1">
                  <div className="grid grid-cols-2 gap-3 lg:grid-rows-3 lg:auto-rows-fr">
                    {top6.map((c) => (
                      <CountryCard key={c.country} country={c} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex w-full flex-col lg:w-[45%]">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="home-section-title mb-0">Traffic Share — Top 15 Countries</h2>
                </div>
                <div className="home-card-white flex min-h-[480px] flex-1 flex-col p-4 lg:min-h-0">
                  <div className="min-h-0 flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} layout="vertical" margin={{ left: 4, right: 8 }}>
                        <XAxis type="number" unit="%" tick={{ fontSize: 10, fill: "#6b7280" }} />
                        <YAxis
                          type="category"
                          dataKey="name"
                          width={110}
                          tick={{ fontSize: 10, fill: "#3c3c3c" }}
                        />
                        <Tooltip
                          {...CHART_TOOLTIP}
                          formatter={(v, _n, props) => [
                            `${v}% (${(props.payload as { label: string }).label})`,
                            "Share",
                          ]}
                        />
                        <Bar dataKey="share" radius={[0, 4, 4, 0]} isAnimationActive={false}>
                          {chartData.map((_, i) => (
                            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="home-section-title">Explore the Platform</h2>
            <div className="home-card-white overflow-hidden">
              {navCards.map(({ href, label, desc, icon: Icon }) => (
                <Link key={href} href={href} className="home-explore-row group">
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                    style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold group-hover:text-[var(--accent)]" style={{ color: "var(--workana-navy)" }}>
                      {label}
                    </p>
                    <p className="mt-0.5 text-sm text-[var(--muted)]">{desc}</p>
                  </div>
                  <span className="home-btn-outline shrink-0 text-xs">Open</span>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </SiteLayout>
  );
}

function MetricCard({
  title,
  value,
  badge,
  sub,
}: {
  title: string;
  value: string;
  badge: string;
  sub: React.ReactNode;
}) {
  return (
    <div className="home-metric-panel flex h-full flex-col">
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-sm font-medium" style={{ color: "var(--workana-navy)" }}>
          {title}
        </span>
        <span
          className="shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold"
          style={{ background: "var(--badge-color)", color: "var(--btn-color)" }}
        >
          {badge}
        </span>
      </div>
      <p className="mt-3 text-2xl font-semibold tabular-nums" style={{ color: "var(--workana-navy)" }}>
        {value}
      </p>
      <div className="mt-2 flex-1 text-xs leading-relaxed text-[var(--muted)]">{sub}</div>
    </div>
  );
}
