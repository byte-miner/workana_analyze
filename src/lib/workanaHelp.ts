import { aiHelperQuestions } from "@/data/workanaData";

const HELP_BASE = "https://help.workana.com";
const CACHE_TTL_MS = 60 * 60 * 1000;
const FETCH_TIMEOUT_MS = 8_000;

interface HelpArticle {
  title: string;
  url: string;
  snippet: string;
}

interface CacheEntry {
  articles: HelpArticle[];
  bodies: Record<string, string>;
  fetchedAt: number;
}

const queryCache = new Map<string, CacheEntry>();

function queryKeywords(query: string): string {
  const stop = new Set([
    "the", "a", "an", "is", "are", "how", "what", "why", "can", "do", "does",
    "i", "my", "on", "at", "to", "for", "workana", "with", "and", "or",
  ]);
  return query
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stop.has(w))
    .slice(0, 6)
    .join(" ");
}

const FALLBACK_SNIPPETS: HelpArticle[] = [
  {
    title: "How much does it cost to use Workana?",
    url: `${HELP_BASE}/hc/en-us`,
    snippet:
      "Clients pay fees when there is an active contract. Freelancers pay a staggered commission based on their relationship with each client — higher on early earnings, lower as the relationship grows.",
  },
  {
    title: "How is the commission calculated at Workana?",
    url: `${HELP_BASE}/hc/en-us`,
    snippet:
      "The client pays a fixed service fee (4.5%). Freelancers pay a tiered commission: 20% on the first $300 earned with a client, 10% on $301–$3,000, and 5% above $3,000.",
  },
  {
    title: "Security Deposit (Escrow)",
    url: `${HELP_BASE}/hc/en-us`,
    snippet:
      "Workana uses escrow to protect both parties. Client funds are held securely until milestones are approved, reducing payment risk for freelancers.",
  },
  {
    title: "How do projects at Workana work?",
    url: `${HELP_BASE}/hc/en-us`,
    snippet:
      "Clients publish projects, freelancers send proposals, and once hired work happens through Workana with milestones, messaging, and protected payments.",
  },
  {
    title: "How do freelance payments work?",
    url: `${HELP_BASE}/hc/en-us`,
    snippet:
      "Payments are released after client approval. Freelancers can withdraw via supported methods on Workana's withdrawal calendar with verification requirements.",
  },
  {
    title: "Skill Certification",
    url: `${HELP_BASE}/hc/en-us`,
    snippet:
      "Freelancers can certify skills on Workana to stand out in search and proposals, demonstrating verified expertise to clients.",
  },
  ...aiHelperQuestions.map((q) => ({
    title: q.question,
    url: `${HELP_BASE}/hc/en-us`,
    snippet: q.answer,
  })),
];

function scoreArticle(query: string, article: HelpArticle): number {
  const text = `${article.title} ${article.snippet}`.toLowerCase();
  const words = query.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
  if (words.length === 0) return 0;
  return words.reduce((s, w) => s + (text.includes(w) ? 1 : 0), 0);
}

function fallbackForQuery(query: string): HelpArticle[] {
  return [...FALLBACK_SNIPPETS]
    .map((article) => ({ article, score: scoreArticle(query, article) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((s) => s.article);
}

function parseSearchHtml(html: string): HelpArticle[] {
  const articles: HelpArticle[] = [];
  const seen = new Set<string>();
  const linkRe =
    /href="(\/hc\/en-us\/articles\/[^"]+)"[^>]*>([^<]+)<|href="(https:\/\/help\.workana\.com\/hc\/en-us\/articles\/[^"]+)"[^>]*>([^<]+)</gi;

  let match: RegExpExecArray | null;
  while ((match = linkRe.exec(html)) && articles.length < 5) {
    const path = match[1] || match[3];
    const title = (match[2] || match[4] || "").trim();
    if (!path || !title || title.length < 4) continue;
    const url = path.startsWith("http") ? path : `${HELP_BASE}${path}`;
    if (seen.has(url)) continue;
    seen.add(url);
    articles.push({ title, url, snippet: title });
  }
  return articles;
}

async function fetchViaHttp(query: string): Promise<{ articles: HelpArticle[]; bodies: Record<string, string> }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const searchUrl = `${HELP_BASE}/hc/en-us/search?query=${encodeURIComponent(query)}`;
    const res = await fetch(searchUrl, {
      signal: controller.signal,
      headers: {
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      },
    });

    if (!res.ok) return { articles: [], bodies: {} };

    const html = await res.text();
    const articles = parseSearchHtml(html);
    const bodies: Record<string, string> = {};
    for (const article of articles) {
      bodies[article.url] = article.snippet;
    }
    return { articles, bodies };
  } finally {
    clearTimeout(timer);
  }
}

async function fetchViaPlaywright(query: string): Promise<{ articles: HelpArticle[]; bodies: Record<string, string> }> {
  const { chromium } = await import("playwright");
  const browser = await chromium.launch({ headless: true });
  const articles: HelpArticle[] = [];
  const bodies: Record<string, string> = {};

  try {
    const context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      locale: "en-US",
    });
    const page = await context.newPage();
    const searchUrl = `${HELP_BASE}/hc/en-us/search?query=${encodeURIComponent(query)}`;
    await page.goto(searchUrl, { waitUntil: "domcontentloaded", timeout: 20_000 });
    await page.waitForTimeout(800);

    const results = await page.evaluate(() => {
      const items: { title: string; url: string; snippet: string }[] = [];
      document.querySelectorAll("a[href*='/hc/en-us/articles/']").forEach((el) => {
        const anchor = el as HTMLAnchorElement;
        const title = anchor.textContent?.trim() || "";
        const url = anchor.href;
        if (!title || items.some((i) => i.url === url)) return;
        const parent = anchor.closest("li, article, div");
        const snippet = parent?.textContent?.replace(title, "").trim().slice(0, 280) || title;
        items.push({ title, url, snippet });
      });
      return items.slice(0, 4);
    });

    articles.push(...results);
    for (const article of results) {
      bodies[article.url] = article.snippet;
    }
    await context.close();
  } finally {
    await browser.close();
  }

  return { articles, bodies };
}

function formatHelpContext(articles: HelpArticle[], bodies: Record<string, string>): string {
  if (articles.length === 0) return "No help center articles found for this query.";

  return articles
    .map((a, i) => {
      const body = bodies[a.url] || a.snippet;
      return `[Article ${i + 1}] ${a.title}\nSource: ${a.url}\n${body.slice(0, 1200)}`;
    })
    .join("\n\n---\n\n");
}

export async function fetchWorkanaHelpContext(userQuery: string): Promise<string> {
  const keywords = queryKeywords(userQuery) || userQuery.slice(0, 80);
  const cached = queryCache.get(keywords);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return formatHelpContext(cached.articles, cached.bodies);
  }

  let articles: HelpArticle[] = [];
  let bodies: Record<string, string> = {};

  try {
    const live = await fetchViaHttp(keywords);
    articles = live.articles;
    bodies = live.bodies;
  } catch {
    /* use fallback */
  }

  if (articles.length === 0 && process.env.WORKANA_HELP_LIVE === "true") {
    try {
      const live = await fetchViaPlaywright(keywords);
      articles = live.articles;
      bodies = live.bodies;
    } catch (err) {
      console.warn("Workana help Playwright fetch failed:", err);
    }
  }

  if (articles.length === 0) {
    articles = fallbackForQuery(userQuery);
    for (const a of articles) {
      bodies[a.url] = a.snippet;
    }
  }

  queryCache.set(keywords, { articles, bodies, fetchedAt: Date.now() });
  return formatHelpContext(articles, bodies);
}

export function findLocalAnswer(userMessage: string): { reply: string; sources: string[] } | null {
  const normalized = userMessage.trim().toLowerCase().replace(/\s+/g, " ");

  for (const item of aiHelperQuestions) {
    if (item.question.trim().toLowerCase() === normalized) {
      return { reply: item.answer, sources: [`${HELP_BASE}/hc/en-us`] };
    }
  }

  const queryWords = normalized.split(/\s+/).filter((w) => w.length > 3);
  if (queryWords.length === 0) return null;

  let best: { item: (typeof aiHelperQuestions)[number]; score: number } | null = null;
  for (const item of aiHelperQuestions) {
    const title = item.question.toLowerCase();
    const overlap = queryWords.filter((w) => title.includes(w)).length;
    const score = overlap / queryWords.length;
    if (score >= 0.75 && (!best || score > best.score)) {
      best = { item, score };
    }
  }

  if (best) {
    return { reply: best.item.answer, sources: [`${HELP_BASE}/hc/en-us`] };
  }

  return null;
}
