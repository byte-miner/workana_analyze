export interface WorkanaJob {
  id: string;
  title: string;
  link: string;
  country: string;
  price: string;
  priceMin: number | null;
  priceMax: number | null;
  currency: string;
  category: string;
  subcategory: string;
  skills: string[];
  bids: number | null;
  publishedAt: string | null;
  scrapedAt: string;
  language: string;
  description: string;
}

export interface CategoryStat {
  category: string;
  count: number;
  percentage: number;
}

export interface TechStackStat {
  technology: string;
  count: number;
  percentage: number;
}

export interface TopicStat {
  topic: string;
  count: number;
  percentage: number;
  kind?: "stack" | "industry";
}

export interface AnalyticsSummary {
  totalProjectsPastMonth: number;
  totalProjectsAllTime: number;
  categories: CategoryStat[];
  subcategories: CategoryStat[];
  webDevSubcategories: CategoryStat[];
  topics: TopicStat[];
  topTopics: TopicStat[];
  stackTopics: TopicStat[];
  industryTopics: TopicStat[];
  topStackTopics: TopicStat[];
  topIndustryTopics: TopicStat[];
  techStacks: TechStackStat[];
  topCategories: CategoryStat[];
  promisingAreas: string[];
  lastScrapeAt: string | null;
  scrapeStatus: "idle" | "running" | "error";
  scrapeMessage: string | null;
}

export interface ScrapeResult {
  newJobs: number;
  updatedJobs: number;
  totalScraped: number;
  pagesScraped: number;
  errors: string[];
}
