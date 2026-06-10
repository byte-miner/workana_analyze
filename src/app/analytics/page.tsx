"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { SiteLayout } from "@/components/SiteLayout";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CountryFlag } from "@/components/CountryFlag";
import { ProjectFieldExplorer } from "@/components/ProjectFieldExplorer";
import { FreelanceActivityPanel } from "@/components/FreelanceActivityPanel";
import {
  countryRankings,
  regionalDistribution,
  skillEqualization,
  competitors,
  topNonAmericanCountries,
} from "@/data/workanaData";

const CHART_TOOLTIP = {
  contentStyle: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    boxShadow: "0 4px 14px rgba(0, 45, 114, 0.08)",
  },
};

export default function AnalyticsPage() {
  const trafficData = countryRankings.map((c) => ({
    country: c.country,
    share: c.share,
    label: c.shareLabel,
  }));

  return (
    <SiteLayout>
      <Breadcrumbs items={[{ label: "Analytics" }]} />

      <h1 className="workana-gradient-text text-3xl font-bold">Market Analytics</h1>
      <p className="mt-2 text-[var(--muted)]">
        Project field demand, freelance activity by region, traffic share, and competitive landscape.
      </p>

      <ProjectFieldExplorer />
      <FreelanceActivityPanel />

      <h2 className="mt-10 text-xl font-semibold" style={{ color: "var(--workana-navy)" }}>
        Platform Traffic & Regions
      </h2>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="workana-panel p-5">
          <h2 className="mb-4 font-semibold" style={{ color: "var(--workana-navy)" }}>
            Country Traffic Share
          </h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trafficData} layout="vertical" margin={{ left: 8, right: 16 }}>
                <XAxis type="number" unit="%" tick={{ fill: "#6b7280" }} />
                <YAxis type="category" dataKey="country" width={80} tick={{ fontSize: 11, fill: "#6b7280" }} />
                <Tooltip
                  {...CHART_TOOLTIP}
                  formatter={(v, _n, props) => [
                    `${v}% (${(props.payload as { label: string }).label})`,
                    "Share",
                  ]}
                />
                <Bar dataKey="share" fill="#7246E5" radius={[0, 4, 4, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="workana-panel p-5">
          <h2 className="mb-4 font-semibold" style={{ color: "var(--workana-navy)" }}>
            Regional Distribution
          </h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={regionalDistribution}
                  dataKey="share"
                  nameKey="region"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  isAnimationActive={false}
                  label={(props) => {
                    const p = props.payload as { region: string; share: number };
                    return `${p.region} (${p.share}%)`;
                  }}
                >
                  {regionalDistribution.map((entry, i) => (
                    <Cell key={entry.region} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip {...CHART_TOOLTIP} formatter={(v) => [`${v}%`, "Share"]} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <section className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-stretch lg:gap-8">
        <div className="flex w-full flex-col lg:w-1/2">
          <h2 className="mb-3 shrink-0 text-lg font-semibold" style={{ color: "var(--workana-navy)" }}>
            {skillEqualization.title}
          </h2>
          <div className="workana-panel flex flex-1 flex-col p-6">
            <p className="text-sm text-[var(--muted)]">{skillEqualization.summary}</p>
            <ul className="mt-4 grid flex-1 gap-3 sm:grid-cols-2 sm:content-start">
              {skillEqualization.reasons.map((reason) => (
                <li key={reason} className="flex gap-2 py-2 text-sm text-gray-600">
                  <span style={{ color: "var(--check-color)" }}>✓</span>
                  {reason}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex w-full flex-col lg:w-1/2">
          <h2 className="mb-3 shrink-0 text-lg font-semibold" style={{ color: "var(--workana-navy)" }}>
            Top 10 Non-American Countries
          </h2>
          <div className="workana-panel flex flex-1 flex-col p-6">
            <div className="grid flex-1 gap-3 sm:grid-cols-2 sm:content-start">
              {topNonAmericanCountries.map((c) => (
                <div key={c.country} className="flex items-center gap-3 py-2">
                  <CountryFlag country={c.country} size={20} className="shrink-0" />
                  <span className="font-medium" style={{ color: "var(--workana-navy)" }}>{c.country}</span>
                  <span className="text-sm text-[var(--muted)]">— {c.note}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="mt-6">
        <h2 className="mb-4 text-lg font-semibold" style={{ color: "var(--workana-navy)" }}>
          Workana vs Competitors
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr style={{ background: "var(--accent-soft)" }}>
                {["Platform", "Focus", "Fees", "Strength", "Weakness"].map((h) => (
                  <th key={h} className="px-4 py-3 font-semibold" style={{ color: "var(--workana-navy)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {competitors.map((c) => (
                <tr
                  key={c.name}
                  style={{
                    background: c.name === "Workana" ? "var(--purple-soft)" : undefined,
                  }}
                >
                  <td className="px-4 py-3 font-semibold" style={{ color: "var(--workana-navy)" }}>
                    {c.name}
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)]">{c.focus}</td>
                  <td className="px-4 py-3 text-[var(--muted)]">{c.fees}</td>
                  <td className="px-4 py-3 text-[var(--muted)]">{c.strength}</td>
                  <td className="px-4 py-3 text-[var(--muted)]">{c.weakness}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </SiteLayout>
  );
}
