import type { CategoryStat, WorkanaJob } from "./types";

/** Official Workana IT & Programming categories (platform labels). */
export const WORKANA_IT_CATEGORIES = [
  "Web Development",
  "Web Design",
  "E-commerce",
  "WordPress",
  "Apps programming. Android, iOS and others",
  "Data Science",
  "Desktop apps",
  "Artificial Intelligence",
] as const;

export type WorkanaCategory = (typeof WORKANA_IT_CATEGORIES)[number];

/** Web Development subcategories for scraped-job analysis. */
export const WEB_DEV_SUBCATEGORIES = [
  "WordPress",
  "E-commerce",
  "Shopify",
  "SaaS",
  "CRM",
  "General",
] as const;

export type WebDevSubcategory = (typeof WEB_DEV_SUBCATEGORIES)[number];

/** Flat category labels used in analytics charts. */
export const ANALYTICS_CATEGORIES = [
  "WordPress",
  "E-commerce",
  "Shopify",
  "SaaS",
  "CRM",
  "General",
  "Web Design",
  "Apps programming. Android, iOS and others",
  "Data Science",
  "Desktop apps",
  "Artificial Intelligence",
] as const;

export type AnalyticsCategory = (typeof ANALYTICS_CATEGORIES)[number];

const ALIAS_TO_CATEGORY: Array<{ category: WorkanaCategory; patterns: RegExp[] }> = [
  {
    category: "WordPress",
    patterns: [/^wordpress$/i, /wordpress/i, /desenvolvimento wordpress/i, /desarrollo wordpress/i],
  },
  {
    category: "Artificial Intelligence",
    patterns: [
      /^artificial intelligence$/i,
      /intelig[eê]ncia artificial/i,
      /inteligencia artificial/i,
      /\b(?:machine learning|deep learning|nlp|computer vision|tensorflow|pytorch|chatgpt|openai)\b/i,
    ],
  },
  {
    category: "Data Science",
    patterns: [
      /^data science$/i,
      /ci[eê]ncia de dados/i,
      /ciencia de datos/i,
      /data scientist|data analytics|big data|power bi|tableau|etl/i,
    ],
  },
  {
    category: "Apps programming. Android, iOS and others",
    patterns: [
      /apps programming/i,
      /programa[cç][aã]o de apps/i,
      /programaci[oó]n de apps/i,
      /android|ios|flutter|react native|swift|kotlin|mobile app|aplicativo mobile|app mobile/i,
    ],
  },
  {
    category: "E-commerce",
    patterns: [
      /^e-?commerce$/i,
      /com[eé]rcio eletr[oô]nico/i,
      /comercio electr[oó]nico/i,
      /woocommerce|magento|loja virtual|tienda online|marketplace|online store|loja online/i,
    ],
  },
  {
    category: "Web Design",
    patterns: [
      /^web design$/i,
      /design web|web design|design de sites|diseño web|ui\/ux|ux design|figma|wireframe|prototype/i,
    ],
  },
  {
    category: "Desktop apps",
    patterns: [
      /^desktop apps?$/i,
      /aplicativos desktop|aplicaciones de escritorio|electron|\.net desktop|windows app|desktop application/i,
    ],
  },
  {
    category: "Web Development",
    patterns: [
      /^web development$/i,
      /desenvolvimento web|desarrollo web|full stack|frontend|backend|react|node|php|laravel|django|api|website|web app|\bcrm\b|saas|software as a service/i,
    ],
  },
];

function jobText(job: WorkanaJob): string {
  return [job.subcategory, job.title, job.description, job.skills.join(" ")]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function matchAlias(text: string): WorkanaCategory | null {
  const normalized = text.trim().replace(/\s+/g, " ");
  for (const { category, patterns } of ALIAS_TO_CATEGORY) {
    if (patterns.some((p) => p.test(normalized))) return category;
  }
  return null;
}

export function classifyWorkanaCategory(job: WorkanaJob): WorkanaCategory {
  const sources = [job.subcategory, job.title, job.description, job.skills.join(" ")].filter(Boolean);

  for (const source of sources) {
    const matched = matchAlias(source);
    if (matched) return matched;
  }

  const combined = sources.join(" ").toLowerCase();
  for (const { category, patterns } of ALIAS_TO_CATEGORY) {
    if (patterns.some((p) => p.test(combined))) return category;
  }

  return "Web Development";
}

export function classifyWebDevSubcategory(job: WorkanaJob): WebDevSubcategory {
  const text = jobText(job);

  if (/shopify|liquid template|shopify theme|shopify app/i.test(text)) return "Shopify";
  if (/wordpress|wp theme|wp plugin|gutenberg|elementor|divi builder|woocommerce/i.test(text)) {
    return "WordPress";
  }
  if (/\bcrm\b|customer relationship|hubspot|pipedrive|rd station|sales pipeline|gest[aã]o de clientes/i.test(text)) {
    return "CRM";
  }
  if (/saas|software as a service|plataforma saas|subscription platform|multi-tenant|b2b platform/i.test(text)) {
    return "SaaS";
  }
  if (
    /e-?commerce|ecommerce|com[eé]rcio eletr[oô]nico|comercio electr[oó]nico|magento|loja virtual|tienda online|marketplace|online store|loja online|presta/i.test(text)
  ) {
    return "E-commerce";
  }

  return "General";
}

export function classifyAnalyticsCategory(job: WorkanaJob): AnalyticsCategory {
  const primary = classifyWorkanaCategory(job);

  if (
    primary === "Web Development" ||
    primary === "E-commerce" ||
    primary === "WordPress"
  ) {
    return classifyWebDevSubcategory(job);
  }

  return primary as AnalyticsCategory;
}

export function countWorkanaCategories(jobs: WorkanaJob[]): CategoryStat[] {
  const counts = new Map<AnalyticsCategory, number>(
    ANALYTICS_CATEGORIES.map((c) => [c, 0])
  );

  for (const job of jobs) {
    const category = classifyAnalyticsCategory(job);
    counts.set(category, (counts.get(category) ?? 0) + 1);
  }

  const total = jobs.length || 1;
  return ANALYTICS_CATEGORIES.map((category) => {
    const count = counts.get(category) ?? 0;
    return {
      category,
      count,
      percentage: Math.round((count / total) * 1000) / 10,
    };
  });
}

export function countWebDevSubcategories(jobs: WorkanaJob[]): CategoryStat[] {
  const webSubcats = new Set<string>(WEB_DEV_SUBCATEGORIES);
  const webJobs = jobs.filter((job) => webSubcats.has(classifyAnalyticsCategory(job)));

  const counts = new Map<WebDevSubcategory, number>(
    WEB_DEV_SUBCATEGORIES.map((c) => [c, 0])
  );

  for (const job of webJobs) {
    const sub = classifyWebDevSubcategory(job);
    counts.set(sub, (counts.get(sub) ?? 0) + 1);
  }

  const total = webJobs.length || 1;
  return WEB_DEV_SUBCATEGORIES.map((category) => {
    const count = counts.get(category) ?? 0;
    return {
      category,
      count,
      percentage: Math.round((count / total) * 1000) / 10,
    };
  });
}

export function topWorkanaCategories(stats: CategoryStat[]): CategoryStat[] {
  return [...stats].sort((a, b) => b.count - a.count);
}
