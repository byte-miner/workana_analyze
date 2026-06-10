"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { CountryFlag } from "@/components/CountryFlag";
import {
  continentFreelanceActivity,
  freelanceActivitySummary,
  topDemandCountries,
  topSupplyCountries,
} from "@/data/freelanceActivity";

const CHART_TOOLTIP = {
  contentStyle: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    boxShadow: "0 4px 14px rgba(114, 70, 229, 0.08)",
  },
};

const CONTINENT_COLORS = ["#7246E5", "#BEA5FF", "#4D2D9F", "#DED2FF", "#29B8B6", "#3C3C3C"];

export function FreelanceActivityPanel() {
  const chartData = continentFreelanceActivity.map((c) => ({
    continent: c.continent,
    supply: c.freelancerActivity,
    demand: c.clientActivity,
    traffic: c.platformTrafficShare,
    countries: c.activeCountries,
  }));

  return (
    <section className="mt-10 w-full min-w-0">
      <h2 className="text-xl font-semibold" style={{ color: "var(--workana-navy)" }}>
        Freelance Activity by Continent & Country
      </h2>
      <p className="mt-2 w-full text-sm text-[var(--muted)]">
        {freelanceActivitySummary.body}
      </p>
      <p className="mt-1 text-xs text-[var(--muted)]">{freelanceActivitySummary.source}</p>

      <div className="mt-6 w-full min-w-0 workana-panel p-5">
        <h3 className="mb-4 text-base font-semibold" style={{ color: "var(--workana-navy)" }}>
          Activity Index by Continent
        </h3>
        <div className="h-80 w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ left: 8, right: 8, bottom: 8 }}>
              <XAxis dataKey="continent" tick={{ fontSize: 11, fill: "#6b7280" }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#6b7280" }} />
              <Tooltip {...CHART_TOOLTIP} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="supply" name="Freelancer activity" fill="#7246E5" radius={[4, 4, 0, 0]} isAnimationActive={false} />
              <Bar dataKey="demand" name="Client activity" fill="#BEA5FF" radius={[4, 4, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {continentFreelanceActivity.map((c, i) => (
            <div key={c.continent} className="rounded-[10px] p-3" style={{ background: "var(--accent-soft)" }}>
              <p className="flex items-center gap-2 font-semibold" style={{ color: "var(--workana-navy)" }}>
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ background: CONTINENT_COLORS[i % CONTINENT_COLORS.length] }}
                />
                {c.continent}
                <span className="text-xs font-normal text-[var(--muted)]">
                  ({c.activeCountries} countries · {c.platformTrafficShare}% traffic)
                </span>
              </p>
              <p className="mt-1 text-sm text-[var(--muted)]">{c.summary}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-stretch lg:gap-8">
        <div className="flex w-full flex-col lg:w-1/2">
          <h3 className="mb-3 shrink-0 text-lg font-semibold" style={{ color: "var(--workana-navy)" }}>
            Highest Freelancer Supply
          </h3>
          <div className="workana-panel flex flex-1 flex-col p-6">
            <CountryActivityList entries={topSupplyCountries} />
          </div>
        </div>
        <div className="flex w-full flex-col lg:w-1/2">
          <h3 className="mb-3 shrink-0 text-lg font-semibold" style={{ color: "var(--workana-navy)" }}>
            Highest Client Demand
          </h3>
          <div className="workana-panel flex flex-1 flex-col p-6">
            <CountryActivityList entries={topDemandCountries} />
          </div>
        </div>
      </div>
    </section>
  );
}

function CountryActivityList({
  entries,
}: {
  entries: typeof topSupplyCountries;
}) {
  return (
    <ul className="space-y-3">
      {entries.map((entry) => (
        <li key={entry.country} className="flex items-start gap-3 py-1">
          <CountryFlag country={entry.country} size={18} className="mt-0.5 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="font-medium" style={{ color: "var(--workana-navy)" }}>
              {entry.country}
              <span className="ml-2 text-xs font-normal text-[var(--muted)]">
                {entry.role} · {entry.activityScore}/100
              </span>
            </p>
            <p className="text-sm text-[var(--muted)]">{entry.note}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
