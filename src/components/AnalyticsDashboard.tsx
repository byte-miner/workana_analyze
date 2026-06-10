"use client";

import { memo, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import type { AnalyticsSummary, CategoryStat, TopicStat } from "@/lib/types";
import { AnalyticsLabelLogo } from "@/components/AnalyticsLabelLogo";

/** High-contrast categorical palette — one stable hue per label. */
const CATEGORY_COLOR_RULES: Array<{ match: RegExp; color: string }> = [
  { match: /WordPress/i, color: "#2563EB" },
  { match: /Shopify/i, color: "#059669" },
  { match: /E-?commerce/i, color: "#EA580C" },
  { match: /\bSaaS\b/i, color: "#CA8A04" },
  { match: /\bCRM\b/i, color: "#DC2626" },
  { match: /General/i, color: "#4B5563" },
  { match: /Web Design/i, color: "#F59E0B" },
  { match: /Apps programming/i, color: "#7246E5" },
  { match: /Data Science/i, color: "#0891B2" },
  { match: /Desktop apps/i, color: "#78716C" },
  { match: /Artificial Intelligence/i, color: "#DB2777" },
];

const TOPIC_COLOR_RULES: Array<{ match: RegExp; color: string }> = [
  { match: /WordPress/i, color: "#2563EB" },
  { match: /WooCommerce/i, color: "#EA580C" },
  { match: /Shopify/i, color: "#059669" },
  { match: /Webflow/i, color: "#0D9488" },
  { match: /Wix/i, color: "#F97316" },
  { match: /Framer/i, color: "#6366F1" },
  { match: /\bSaaS\b/i, color: "#CA8A04" },
  { match: /\bCRM\b/i, color: "#DC2626" },
  { match: /\bERP\b/i, color: "#B45309" },
  { match: /Automation/i, color: "#0284C7" },
  { match: /WhatsApp/i, color: "#16A34A" },
  { match: /Chatbot/i, color: "#9333EA" },
  { match: /AI Agent/i, color: "#DB2777" },
  { match: /Blockchain/i, color: "#854D0E" },
  { match: /IoT/i, color: "#0E7490" },
  { match: /Landing Page/i, color: "#4F46E5" },
  { match: /E-?commerce/i, color: "#EA580C" },
  { match: /Healthcare|Health Clinic/i, color: "#0891B2" },
  { match: /Beauty/i, color: "#EC4899" },
  { match: /Real Estate/i, color: "#65A30D" },
  { match: /Travel/i, color: "#06B6D4" },
  { match: /Finance/i, color: "#15803D" },
  { match: /Education/i, color: "#CA8A04" },
  { match: /Food/i, color: "#C2410C" },
  { match: /Legal/i, color: "#57534E" },
  { match: /Marketing/i, color: "#A855F7" },
  { match: /Logistics/i, color: "#0369A1" },
  { match: /Automotive/i, color: "#525252" },
  { match: /HR/i, color: "#BE185D" },
  { match: /Social Media/i, color: "#E11D48" },
  { match: /Fitness/i, color: "#84CC16" },
  { match: /Virtual Assistance/i, color: "#7C3AED" },
  { match: /Agency Website/i, color: "#4F46E5" },
  { match: /Gaming/i, color: "#9333EA" },
];

const FALLBACK_COLORS = [
  "#2563EB", "#EA580C", "#059669", "#DC2626", "#7C3AED",
  "#0891B2", "#DB2777", "#F59E0B", "#4B5563", "#16A34A",
  "#9333EA", "#0D9488",
];

function colorForLabel(
  label: string,
  rules: Array<{ match: RegExp; color: string }>,
  fallbackIndex: number
): string {
  for (const { match, color } of rules) {
    if (match.test(label)) return color;
  }
  return FALLBACK_COLORS[fallbackIndex % FALLBACK_COLORS.length];
}

function categoryColor(label: string, index = 0): string {
  return colorForLabel(label, CATEGORY_COLOR_RULES, index);
}

function topicColor(label: string, index = 0): string {
  return colorForLabel(label, TOPIC_COLOR_RULES, index);
}

const CHART_AXIS = "#9ca3af";
const CHART_TOOLTIP = {
  contentStyle: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    boxShadow: "0 4px 14px rgba(114, 70, 229, 0.08)",
    color: "#1d1d1b",
  },
  labelStyle: { color: "#3C3C3C", fontWeight: 600 },
  itemStyle: { color: "#374151" },
};

const EMPTY_ANALYTICS: AnalyticsSummary = {
  totalProjectsPastMonth: 0,
  totalProjectsAllTime: 0,
  categories: [],
  subcategories: [],
  webDevSubcategories: [],
  topics: [],
  topTopics: [],
  stackTopics: [],
  industryTopics: [],
  topStackTopics: [],
  topIndustryTopics: [],
  techStacks: [],
  topCategories: [],
  promisingAreas: [],
  lastScrapeAt: null,
  scrapeStatus: "idle",
  scrapeMessage: null,
};

interface AnalyticsDashboardProps {
  analytics: AnalyticsSummary | null;
  loading: boolean;
}

export function AnalyticsDashboard({ analytics, loading }: AnalyticsDashboardProps) {
  const data = analytics ?? EMPTY_ANALYTICS;

  const categoryData = useMemo(
    () => data.subcategories.filter((c) => c.count > 0),
    [data.subcategories]
  );
  const allCategoryData = data.subcategories;
  const webDevData = useMemo(
    () => data.webDevSubcategories.filter((c) => c.count > 0),
    [data.webDevSubcategories]
  );
  const stackChartData = useMemo(
    () => data.topStackTopics.filter((t) => t.count > 0).slice(0, 12),
    [data.topStackTopics]
  );
  const stackListData = useMemo(
    () => data.stackTopics.filter((t) => t.count > 0 && t.topic !== "Other Stack"),
    [data.stackTopics]
  );
  const industryChartData = useMemo(
    () => data.topIndustryTopics.filter((t) => t.count > 0).slice(0, 12),
    [data.topIndustryTopics]
  );
  const industryListData = useMemo(
    () => data.industryTopics.filter((t) => t.count > 0 && t.topic !== "Other Industry"),
    [data.industryTopics]
  );
  const techData = useMemo(() => data.techStacks.slice(0, 12), [data.techStacks]);

  if (loading && !analytics) {
    return (
      <div className="workana-panel p-8 text-center text-[var(--muted)]">
        Loading analytics...
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="workana-panel p-8 text-center text-[var(--muted)]">
        No analytics data available yet.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <StatCardsRow
        monthTotal={data.totalProjectsPastMonth}
        allTimeTotal={data.totalProjectsAllTime}
        topCategory={data.topCategories[0]}
        topStack={data.topStackTopics[0]}
        topIndustry={data.topIndustryTopics[0]}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Projects by Category">
          <CategoryPieChart data={categoryData} />
        </ChartCard>

        <ChartCard title="Category Volume & Percentage">
          <CategoryBarChart data={allCategoryData} />
        </ChartCard>
      </div>

      <ChartCard title="Categories">
        <CategoryChecklist items={allCategoryData} />
      </ChartCard>

      {webDevData.length > 0 && (
        <>
          <div className="workana-panel p-5">
            <h3
              className="mb-1 text-base font-semibold"
              style={{ color: "var(--workana-navy)" }}
            >
              Web Development Breakdown
            </h3>
            <p className="mb-4 text-sm text-[var(--muted)]">
              WordPress, E-commerce, Shopify, SaaS, CRM, and General — share of web dev projects only
            </p>
            <div className="grid gap-6 lg:grid-cols-2">
              <CategoryPieChart data={webDevData} />
              <CategoryBarChart data={webDevData} />
            </div>
          </div>

          <ChartCard title="Web Development Subcategories">
            <CategoryChecklist items={data.webDevSubcategories} />
          </ChartCard>
        </>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Technology Stack — Projects by Topic">
          <TopicBarChart data={stackChartData} />
        </ChartCard>

        <ChartCard title="Technology Stack — Volume & Percentage">
          <TopicHorizontalChart data={stackChartData} />
        </ChartCard>
      </div>

      <ChartCard title="Technology Stack">
        <TopicChecklist items={stackListData} kind="stack" />
      </ChartCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Industry Vertical — Projects by Topic">
          <TopicBarChart data={industryChartData} />
        </ChartCard>

        <ChartCard title="Industry Vertical — Volume & Percentage">
          <TopicHorizontalChart data={industryChartData} />
        </ChartCard>
      </div>

      <ChartCard title="Industry Vertical">
        <TopicChecklist items={industryListData} kind="industry" />
      </ChartCard>

      <ChartCard title="Technology Stacks (Top 12)">
        <TechStackChart data={techData} />
      </ChartCard>

      <PromisingAreasList areas={data.promisingAreas} />
    </div>
  );
}

const StatCardsRow = memo(function StatCardsRow({
  monthTotal,
  allTimeTotal,
  topCategory,
  topStack,
  topIndustry,
}: {
  monthTotal: number;
  allTimeTotal: number;
  topCategory?: CategoryStat;
  topStack?: TopicStat;
  topIndustry?: TopicStat;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Projects (Past Month)">
        <AnimatedNumber value={monthTotal} />
      </StatCard>
      <StatCard label="Total in Database">
        <AnimatedNumber value={allTimeTotal} />
      </StatCard>
      <StatCard
        label="Top Category"
        sub={
          topCategory
            ? `${topCategory.count} projects (${topCategory.percentage}%)`
            : undefined
        }
      >
        <span className="text-lg font-bold leading-snug">{topCategory?.category ?? "—"}</span>
      </StatCard>
      <StatCard
        label="Top Stack / Industry"
        sub={
          topStack || topIndustry
            ? [
                topStack ? `Stack: ${topStack.topic} (${topStack.percentage}%)` : null,
                topIndustry ? `Industry: ${topIndustry.topic} (${topIndustry.percentage}%)` : null,
              ]
                .filter(Boolean)
                .join(" · ")
            : undefined
        }
      >
        <span className="text-lg font-bold leading-snug">{topStack?.topic ?? "—"}</span>
      </StatCard>
    </div>
  );
});

const CategoryChecklist = memo(function CategoryChecklist({
  items,
}: {
  items: CategoryStat[];
}) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <CategoryChecklistRow
          key={item.category}
          category={item.category}
          count={item.count}
          percentage={item.percentage}
        />
      ))}
    </ul>
  );
});

const CategoryChecklistRow = memo(function CategoryChecklistRow({
  category,
  count,
  percentage,
}: {
  category: string;
  count: number;
  percentage: number;
}) {
  return (
    <li className="flex items-center gap-3 rounded-lg border px-4 py-3" style={{ borderColor: "var(--header-border)" }}>
      <span
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
        style={{ background: "var(--accent-soft)" }}
        aria-hidden
      >
        <AnalyticsLabelLogo label={category} size={16} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm" style={{ color: "var(--workana-navy)" }}>{category}</p>
      </div>
      <div className="text-right text-sm tabular-nums">
        <span className="font-semibold" style={{ color: "var(--workana-black)" }}>{count}</span>
        <span className="ml-2 text-[var(--muted)]">({percentage}%)</span>
      </div>
    </li>
  );
});

const TopicChecklist = memo(function TopicChecklist({
  items,
  kind,
}: {
  items: TopicStat[];
  kind?: "stack" | "industry";
}) {
  if (items.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-[var(--muted)]">
        No {kind === "industry" ? "industry" : kind === "stack" ? "stack" : ""} topics detected yet — run a scrape first
      </p>
    );
  }

  const softBg = kind === "industry" ? "rgba(41, 184, 182, 0.12)" : "var(--accent-soft)";

  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {items.map((item) => (
        <TopicChecklistRow
          key={item.topic}
          topic={item.topic}
          count={item.count}
          percentage={item.percentage}
          iconBg={softBg}
        />
      ))}
    </ul>
  );
});

const TopicChecklistRow = memo(function TopicChecklistRow({
  topic,
  count,
  percentage,
  iconBg = "var(--accent-soft)",
}: {
  topic: string;
  count: number;
  percentage: number;
  iconBg?: string;
}) {
  return (
    <li className="flex items-center gap-3 rounded-lg border px-4 py-3" style={{ borderColor: "var(--header-border)" }}>
      <span
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
        style={{ background: iconBg }}
        aria-hidden
      >
        <AnalyticsLabelLogo label={topic} size={16} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm" style={{ color: "var(--workana-navy)" }}>{topic}</p>
      </div>
      <div className="text-right text-sm tabular-nums">
        <span className="font-semibold" style={{ color: "var(--workana-black)" }}>{count}</span>
        <span className="ml-2 text-[var(--muted)]">({percentage}%)</span>
      </div>
    </li>
  );
});

const TopicBarChart = memo(function TopicBarChart({ data }: { data: TopicStat[] }) {
  if (data.length === 0) return <EmptyChart />;

  return (
    <div className="h-[320px] w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <BarChart data={data}>
          <XAxis
            dataKey="topic"
            stroke={CHART_AXIS}
            tick={{ fontSize: 10, fill: "#6b7280" }}
            angle={-35}
            textAnchor="end"
            height={90}
          />
          <YAxis stroke={CHART_AXIS} tick={{ fill: "#6b7280" }} />
          <Tooltip
            {...CHART_TOOLTIP}
            formatter={(value, _name, props) => [
              `${value} (${(props.payload as TopicStat).percentage}%)`,
              "Projects",
            ]}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]} isAnimationActive={false}>
            {data.map((entry, i) => (
              <Cell key={entry.topic} fill={topicColor(entry.topic, i)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});

const TopicHorizontalChart = memo(function TopicHorizontalChart({
  data,
}: {
  data: TopicStat[];
}) {
  if (data.length === 0) return <EmptyChart tall />;

  return (
    <div className="h-[320px] w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
          <XAxis type="number" stroke={CHART_AXIS} tick={{ fill: "#6b7280" }} />
          <YAxis
            type="category"
            dataKey="topic"
            width={120}
            stroke={CHART_AXIS}
            tick={{ fontSize: 10, fill: "#6b7280" }}
          />
          <Tooltip
            {...CHART_TOOLTIP}
            formatter={(value, _name, props) => [
              `${value} (${(props.payload as TopicStat).percentage}%)`,
              "Projects",
            ]}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]} isAnimationActive={false}>
            {data.map((entry, i) => (
              <Cell key={entry.topic} fill={topicColor(entry.topic, i)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});

const CategoryPieChart = memo(function CategoryPieChart({
  data,
}: {
  data: CategoryStat[];
}) {
  if (data.length === 0) return <EmptyChart />;

  return (
    <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center">
      <div className="mx-auto h-[220px] w-full max-w-[240px] shrink-0 sm:mx-0">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="category"
              cx="50%"
              cy="50%"
              innerRadius={48}
              outerRadius={88}
              paddingAngle={2}
              stroke="#ffffff"
              strokeWidth={2}
              isAnimationActive={false}
            >
              {data.map((entry, i) => (
                <Cell key={entry.category} fill={categoryColor(entry.category, i)} stroke="#ffffff" />
              ))}
            </Pie>
            <Tooltip
              {...CHART_TOOLTIP}
              formatter={(value, _name, props) => [
                `${value} (${(props.payload as CategoryStat).percentage}%)`,
                "Projects",
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <ul className="grid min-w-0 flex-1 gap-x-4 gap-y-2 sm:grid-cols-2">
        {data.map((item, i) => (
          <li key={item.category} className="flex items-start gap-2 text-xs leading-snug text-gray-600">
            <span
              className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ background: categoryColor(item.category, i) }}
              aria-hidden
            />
            <span className="min-w-0">
              <span style={{ color: "var(--workana-navy)" }}>{item.category}</span>
              <span className="ml-1 tabular-nums text-[var(--muted)]">({item.percentage}%)</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
});

const CategoryBarChart = memo(function CategoryBarChart({
  data,
}: {
  data: CategoryStat[];
}) {
  if (data.length === 0) return <EmptyChart tall />;

  return (
    <div className="h-[420px] w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
          <XAxis type="number" stroke={CHART_AXIS} tick={{ fill: "#6b7280" }} />
          <YAxis
            type="category"
            dataKey="category"
            width={200}
            stroke={CHART_AXIS}
            tick={{ fontSize: 10, fill: "#6b7280" }}
          />
          <Tooltip
            {...CHART_TOOLTIP}
            formatter={(value, _name, props) => [
              `${value} (${(props.payload as CategoryStat).percentage}%)`,
              "Projects",
            ]}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]} isAnimationActive={false}>
            {data.map((entry, i) => (
              <Cell key={entry.category} fill={categoryColor(entry.category, i)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});

const TechStackChart = memo(function TechStackChart({
  data,
}: {
  data: AnalyticsSummary["techStacks"];
}) {
  if (data.length === 0) return <EmptyChart />;

  return (
    <div className="h-[320px] w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <BarChart data={data}>
          <XAxis
            dataKey="technology"
            stroke={CHART_AXIS}
            tick={{ fontSize: 10, fill: "#6b7280" }}
            angle={-35}
            textAnchor="end"
            height={80}
          />
          <YAxis stroke={CHART_AXIS} tick={{ fill: "#6b7280" }} />
          <Tooltip
            {...CHART_TOOLTIP}
            formatter={(value, _name, props) => [
              `${value} (${(props.payload as { percentage: number }).percentage}%)`,
              "Mentions",
            ]}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]} isAnimationActive={false}>
            {data.map((entry, i) => (
              <Cell key={entry.technology} fill={topicColor(entry.technology, i)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});

const PromisingAreasList = memo(function PromisingAreasList({
  areas,
}: {
  areas: string[];
}) {
  return (
    <div className="workana-panel p-6">
      <h3
        className="mb-4 text-lg font-semibold"
        style={{ color: "var(--workana-navy)" }}
      >
        Promising Areas for Future Projects
      </h3>
      <ul className="space-y-3">
        {areas.map((area, i) => (
          <li key={`${i}-${area.slice(0, 24)}`} className="flex gap-3 text-sm text-gray-600">
            <span
              className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{ background: "var(--accent)" }}
            >
              {i + 1}
            </span>
            {area}
          </li>
        ))}
      </ul>
    </div>
  );
});

function AnimatedNumber({ value }: { value: number }) {
  return (
    <span className="text-2xl font-semibold tabular-nums transition-opacity duration-300">
      {value.toLocaleString()}
    </span>
  );
}

function StatCard({
  label,
  children,
  sub,
}: {
  label: string;
  children: React.ReactNode;
  sub?: string;
}) {
  return (
    <div className="workana-panel p-5">
      <p className="text-sm text-[var(--muted)]">{label}</p>
      <div className="mt-1" style={{ color: "var(--workana-navy)" }}>{children}</div>
      {sub && <p className="mt-1 text-xs tabular-nums text-[var(--muted)]">{sub}</p>}
    </div>
  );
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="workana-panel p-5">
      <h3
        className="mb-4 text-base font-semibold"
        style={{ color: "var(--workana-navy)" }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}

function EmptyChart({ tall }: { tall?: boolean }) {
  return (
    <div
      className={`flex items-center justify-center text-[var(--muted)] ${tall ? "h-[420px]" : "h-[280px]"}`}
    >
      No data yet — run a scrape first
    </div>
  );
}
