"use client";

import { useMemo, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
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
  FIELD_CATEGORIES,
  FIELD_GROUPS,
  FIELD_GROUP_MAP,
  fieldsGroupedByCategory,
  projectFields,
  sortFieldsByRank,
  type FieldCategory,
  type FieldGroup,
  type ProjectField,
} from "@/data/projectFieldAnalysis";

const CHART_COLORS = ["#7246E5", "#BEA5FF", "#4D2D9F", "#DED2FF", "#29B8B6"];
const CHART_TOOLTIP = {
  contentStyle: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    boxShadow: "0 4px 14px rgba(114, 70, 229, 0.08)",
  },
};

const DEMAND_STYLES: Record<string, { bg: string; text: string }> = {
  "Very High": { bg: "var(--btn-color)", text: "#fff" },
  High: { bg: "var(--badge-color)", text: "var(--btn-color)" },
  Medium: { bg: "#f5f5f5", text: "var(--muted)" },
  Growing: { bg: "#e8faf9", text: "#1a8a88" },
};

const CHART_ROW_1: FieldCategory[] = ["Industry Vertical", "Automation & AI"];
const CHART_ROW_2: FieldCategory[] = ["Website Builder", "E-commerce & CMS", "Business Services"];

export function ProjectFieldExplorer() {
  const [category, setCategory] = useState<FieldCategory | "All">("All");
  const [query, setQuery] = useState("");

  const isSearchMode = query.trim().length > 0;

  const filteredFlat = useMemo(() => {
    const q = query.toLowerCase();
    return sortFieldsByRank(
      projectFields.filter((f) => {
        const matchCategory = category === "All" || f.category === category;
        const matchQuery =
          !q ||
          f.name.toLowerCase().includes(q) ||
          f.category.toLowerCase().includes(q) ||
          f.typicalProjects.some((p) => p.toLowerCase().includes(q)) ||
          f.insight.toLowerCase().includes(q);
        return matchCategory && matchQuery;
      })
    );
  }, [category, query]);

  const groupedSections = useMemo(() => {
    if (isSearchMode) return [];

    const categories =
      category === "All" ? FIELD_CATEGORIES : FIELD_CATEGORIES.filter((c) => c === category);

    return FIELD_GROUPS.flatMap((group) => {
      const sections = fieldsGroupedByCategory
        .filter(({ category: cat }) => categories.includes(cat) && FIELD_GROUP_MAP[cat] === group)
        .map(({ category: cat, fields }) => ({
          group,
          category: cat,
          fields,
        }));

      return sections.length > 0 ? [{ group, sections }] : [];
    });
  }, [category, isSearchMode]);

  const visibleCharts = useMemo(() => {
    const map = new Map(
      fieldsGroupedByCategory
        .filter(({ fields }) => fields.length > 0)
        .filter(({ category: cat }) => category === "All" || category === cat)
        .map((entry) => [entry.category, entry])
    );
    return map;
  }, [category]);

  const chartRows = useMemo(() => {
    if (category !== "All") {
      const entry = visibleCharts.get(category);
      return entry ? [[entry]] : [];
    }
    const row1 = CHART_ROW_1.map((cat) => visibleCharts.get(cat)).filter(Boolean);
    const row2 = CHART_ROW_2.map((cat) => visibleCharts.get(cat)).filter(Boolean);
    return [row1, row2].filter((row) => row.length > 0);
  }, [category, visibleCharts]);

  const totalVisible = isSearchMode
    ? filteredFlat.length
    : groupedSections.reduce(
        (sum, { sections }) => sum + sections.reduce((s, sec) => s + sec.fields.length, 0),
        0
      );

  return (
    <section className="mt-10 w-full min-w-0">
      <h2 className="text-xl font-semibold" style={{ color: "var(--workana-navy)" }}>
        Project Fields & Verticals
      </h2>
      <p className="mt-2 w-full text-sm text-[var(--muted)]">
        Demand analysis grouped by niche markets and technology stacks, ranked by demand index
        within each category.
      </p>

      <div className="mt-6 w-full min-w-0 space-y-6">
        {chartRows.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="flex flex-col gap-6 lg:flex-row"
          >
            {row.map((entry) => (
              <div
                key={entry!.category}
                className={
                  category !== "All"
                    ? "w-full"
                    : row.length === 2
                      ? "w-full lg:w-1/2"
                      : "w-full lg:w-1/3"
                }
              >
                <CategoryChart
                  category={entry!.category}
                  group={entry!.group}
                  fields={entry!.fields}
                />
              </div>
            ))}
          </div>
        ))}
      </div>

      <Box sx={{ mt: 3, mb: 2, display: "flex", flexWrap: "wrap", gap: 1 }}>
        <Chip
          label="All"
          size="small"
          clickable
          color={category === "All" ? "primary" : "default"}
          variant={category === "All" ? "filled" : "outlined"}
          onClick={() => setCategory("All")}
          sx={{ borderRadius: "10px" }}
        />
        {FIELD_CATEGORIES.map((c) => (
          <Chip
            key={c}
            label={c}
            size="small"
            clickable
            color={category === c ? "primary" : "default"}
            variant={category === c ? "filled" : "outlined"}
            onClick={() => setCategory(c)}
            sx={{ borderRadius: "10px" }}
          />
        ))}
      </Box>

      <TextField
        fullWidth
        size="small"
        placeholder="Search field, stack, or project type…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        sx={{ mb: 3, maxWidth: 420 }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
            sx: { borderRadius: "10px" },
          },
        }}
      />

      <p className="mb-4 text-sm text-[var(--muted)]">
        Showing {totalVisible} of {projectFields.length} fields
      </p>

      {isSearchMode ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredFlat.map((field, index) => (
            <FieldCard key={field.id} field={field} rank={index + 1} />
          ))}
        </div>
      ) : (
        <div className="space-y-10">
          {groupedSections.map(({ group, sections }) => (
            <div key={group}>
              <h3
                className="mb-5 border-b pb-2 text-lg font-semibold"
                style={{ color: "var(--workana-navy)", borderColor: "var(--border-color)" }}
              >
                {group}
              </h3>
              <div className="space-y-8">
                {sections.map(({ category: cat, fields }) => (
                  <div key={cat}>
                    <h4 className="mb-4 text-base font-semibold" style={{ color: "var(--workana-navy)" }}>
                      {cat}
                    </h4>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {fields.map((field, index) => (
                        <FieldCard key={field.id} field={field} rank={index + 1} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {totalVisible === 0 && (
        <p className="mt-8 text-center text-[var(--muted)]">No fields match your filters.</p>
      )}
    </section>
  );
}

function CategoryChart({
  category,
  group,
  fields,
}: {
  category: FieldCategory;
  group: FieldGroup;
  fields: ProjectField[];
}) {
  const chartData = fields.map((f, index) => ({
    name: f.name.length > 16 ? `${f.name.slice(0, 14)}…` : f.name,
    fullName: f.name,
    score: f.demandScore,
    rank: index + 1,
  }));

  const chartHeight = Math.max(280, 220 + Math.min(fields.length, 6) * 8);

  return (
    <div className="workana-panel w-full p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">{group}</p>
      <h3 className="mb-4 text-base font-semibold" style={{ color: "var(--workana-navy)" }}>
        {category} — ranked by demand
      </h3>
      <div className="w-full" style={{ height: chartHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ left: 8, right: 8, bottom: 8 }}>
            <XAxis
              dataKey="name"
              tick={{ fontSize: 9, fill: "#3c3c3c" }}
              angle={-40}
              textAnchor="end"
              height={72}
              interval={0}
            />
            <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#6b7280" }} />
            <Tooltip
              {...CHART_TOOLTIP}
              formatter={(v, _n, props) => {
                const p = props.payload as { fullName: string; rank: number };
                return [`#${p.rank} · ${v}/100`, p.fullName];
              }}
            />
            <Bar dataKey="score" radius={[4, 4, 0, 0]} isAnimationActive={false}>
              {chartData.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function FieldCard({ field, rank }: { field: ProjectField; rank: number }) {
  const demandStyle = DEMAND_STYLES[field.demand] ?? DEMAND_STYLES.Medium;

  return (
    <article className="workana-panel flex h-full flex-col p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-start gap-2">
          <span
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
            style={{ background: "var(--btn-color)" }}
          >
            {rank}
          </span>
          <h3 className="font-semibold leading-snug" style={{ color: "var(--workana-navy)" }}>
            {field.name}
          </h3>
        </div>
        <span
          className="shrink-0 rounded-[10px] px-2 py-0.5 text-xs font-semibold"
          style={{ background: demandStyle.bg, color: demandStyle.text }}
        >
          {field.demand}
        </span>
      </div>
      <p className="mt-1 pl-8 text-xs text-[var(--muted)]">
        {FIELD_GROUP_MAP[field.category]} · {field.category} · {field.demandScore}/100
      </p>
      <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">{field.insight}</p>
      <dl className="mt-4 space-y-2 text-sm">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">Typical projects</dt>
          <dd className="mt-1 text-[var(--workana-navy)]">{field.typicalProjects.join(" · ")}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">Avg. budget</dt>
          <dd className="mt-0.5 font-medium" style={{ color: "var(--workana-navy)" }}>{field.avgBudget}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">Top client countries</dt>
          <dd className="mt-0.5 text-[var(--workana-navy)]">{field.topClientCountries.join(", ")}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">Top freelancer countries</dt>
          <dd className="mt-0.5 text-[var(--workana-navy)]">{field.topFreelancerCountries.join(", ")}</dd>
        </div>
      </dl>
    </article>
  );
}
