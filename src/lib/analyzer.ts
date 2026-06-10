import OpenAI from "openai";
import { subDays, formatISO } from "date-fns";
import type { AnalyticsSummary, CategoryStat, TechStackStat } from "./types";
import { getJobsSince, getAllJobs, getJobCount, getLastScrapeLog } from "./db";
import { getScrapeStatus } from "./scraper";
import { countWorkanaCategories, topWorkanaCategories, countWebDevSubcategories } from "./categories";
import {
  countProjectTopics,
  countStackTopics,
  countIndustryTopics,
  topProjectTopics,
  topStackTopics,
  topIndustryTopics,
} from "./topics";

function extractTechStacks(jobs: ReturnType<typeof getAllJobs>): TechStackStat[] {
  const counts = new Map<string, number>();
  for (const job of jobs) {
    for (const skill of job.skills) {
      const normalized = skill.trim();
      if (normalized) {
        counts.set(normalized, (counts.get(normalized) || 0) + 1);
      }
    }
  }
  const total = jobs.reduce((sum, j) => sum + j.skills.length, 0) || 1;
  return Array.from(counts.entries())
    .map(([technology, count]) => ({
      technology,
      count,
      percentage: Math.round((count / total) * 1000) / 10,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 30);
}

async function generatePromisingAreas(
  categories: CategoryStat[],
  techStacks: TechStackStat[],
  totalProjects: number,
  apiKeyOverride?: string
): Promise<string[]> {
  const apiKey = apiKeyOverride?.trim() || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return buildFallbackInsights(categories, techStacks);
  }

  try {
    const openai = new OpenAI({ apiKey });
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a freelance market analyst specializing in IT & Programming projects on Workana (Latin America). Provide concise, actionable insights.",
        },
        {
          role: "user",
          content: `Analyze this Workana IT programming market data from the past month (${totalProjects} projects):

Top categories: ${JSON.stringify(categories.slice(0, 8))}
Top technologies: ${JSON.stringify(techStacks.slice(0, 15))}

Return exactly 5 bullet points about which areas show the most promise for freelancers in the near future. Be specific about technologies and project types. Return as a JSON array of strings only.`,
        },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) return buildFallbackInsights(categories, techStacks);

    const parsed = JSON.parse(content) as { insights?: string[]; areas?: string[]; bullets?: string[] };
    const insights = parsed.insights || parsed.areas || parsed.bullets;
    if (Array.isArray(insights)) return insights.slice(0, 5);
    return buildFallbackInsights(categories, techStacks);
  } catch {
    return buildFallbackInsights(categories, techStacks);
  }
}

function buildFallbackInsights(
  categories: CategoryStat[],
  techStacks: TechStackStat[]
): string[] {
  const insights: string[] = [];
  if (categories[0]) {
    insights.push(
      `${categories[0].category} leads with ${categories[0].count} projects (${categories[0].percentage}%) — strongest demand area right now.`
    );
  }
  if (techStacks[0]) {
    insights.push(
      `${techStacks[0].technology} is the most requested skill (${techStacks[0].count} mentions) — high demand for this stack.`
    );
  }
  if (categories[1]) {
    insights.push(
      `${categories[1].category} is the second-largest category — worth building expertise here.`
    );
  }
  if (techStacks[1]) {
    insights.push(
      `Combined ${techStacks[0]?.technology} + ${techStacks[1]?.technology} skills cover a significant share of listings.`
    );
  }
  insights.push(
    "Mobile apps, AI/automation, and e-commerce integrations continue to appear frequently in IT programming listings."
  );
  return insights.slice(0, 5);
}

let cachedPromisingAreas: string[] | null = null;

function buildAnalyticsCore() {
  const oneMonthAgo = formatISO(subDays(new Date(), 30));
  const monthJobs = getJobsSince(oneMonthAgo);
  const allJobs = getAllJobs();
  const scrapeInfo = getScrapeStatus();
  const lastLog = getLastScrapeLog() as Record<string, unknown> | undefined;

  const jobsForCategories = monthJobs.length > 0 ? monthJobs : allJobs;
  const subcategories = countWorkanaCategories(jobsForCategories);
  const categories = subcategories;
  const webDevSubcategories = countWebDevSubcategories(jobsForCategories);
  const stackTopics = countStackTopics(jobsForCategories);
  const industryTopics = countIndustryTopics(jobsForCategories);
  const topics = countProjectTopics(jobsForCategories, false);
  const topTopics = topProjectTopics(topics, 15);
  const topStack = topStackTopics(jobsForCategories, 12);
  const topIndustry = topIndustryTopics(jobsForCategories, 12);
  const techStacks = extractTechStacks(jobsForCategories);
  const topCategories = topWorkanaCategories(subcategories).filter((c) => c.count > 0).slice(0, 10);

  return {
    totalProjectsPastMonth: monthJobs.length,
    totalProjectsAllTime: getJobCount(),
    categories,
    subcategories,
    webDevSubcategories,
    topics,
    topTopics,
    stackTopics,
    industryTopics,
    topStackTopics: topStack,
    topIndustryTopics: topIndustry,
    techStacks,
    topCategories,
    lastScrapeAt: (lastLog?.finished_at as string) || (lastLog?.started_at as string) || null,
    scrapeStatus: scrapeInfo.status,
    scrapeMessage: scrapeInfo.message,
    insightInput: {
      categories: subcategories.length > 0 ? subcategories : categories,
      techStacks,
      totalProjects: monthJobs.length,
    },
  };
}

/** Fast snapshot for SSE — no OpenAI call, reuses cached insights. */
export async function computeAnalyticsSnapshot(): Promise<AnalyticsSummary> {
  const core = buildAnalyticsCore();
  const promisingAreas =
    cachedPromisingAreas ??
    buildFallbackInsights(core.insightInput.categories, core.insightInput.techStacks);

  return {
    totalProjectsPastMonth: core.totalProjectsPastMonth,
    totalProjectsAllTime: core.totalProjectsAllTime,
    categories: core.categories,
    subcategories: core.subcategories,
    webDevSubcategories: core.webDevSubcategories,
    topics: core.topics,
    topTopics: core.topTopics,
    stackTopics: core.stackTopics,
    industryTopics: core.industryTopics,
    topStackTopics: core.topStackTopics,
    topIndustryTopics: core.topIndustryTopics,
    techStacks: core.techStacks,
    topCategories: core.topCategories,
    promisingAreas,
    lastScrapeAt: core.lastScrapeAt,
    scrapeStatus: core.scrapeStatus,
    scrapeMessage: core.scrapeMessage,
  };
}

export async function computeAnalytics(apiKeyOverride?: string): Promise<AnalyticsSummary> {
  const core = buildAnalyticsCore();

  const promisingAreas = await generatePromisingAreas(
    core.insightInput.categories,
    core.insightInput.techStacks,
    core.insightInput.totalProjects,
    apiKeyOverride
  );
  cachedPromisingAreas = promisingAreas;

  return {
    totalProjectsPastMonth: core.totalProjectsPastMonth,
    totalProjectsAllTime: core.totalProjectsAllTime,
    categories: core.categories,
    subcategories: core.subcategories,
    webDevSubcategories: core.webDevSubcategories,
    topics: core.topics,
    topTopics: core.topTopics,
    stackTopics: core.stackTopics,
    industryTopics: core.industryTopics,
    topStackTopics: core.topStackTopics,
    topIndustryTopics: core.topIndustryTopics,
    techStacks: core.techStacks,
    topCategories: core.topCategories,
    promisingAreas,
    lastScrapeAt: core.lastScrapeAt,
    scrapeStatus: core.scrapeStatus,
    scrapeMessage: core.scrapeMessage,
  };
}
