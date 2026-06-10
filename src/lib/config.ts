import path from "path";

export const WORKANA_BASE = "https://www.workana.com";
export const IT_PROGRAMMING_CATEGORY = "it-programming";

// Scrape all languages (pt, es, en) and dedupe by job link
export const LANGUAGES = ["pt", "es", "en"] as const;

/** Workana subcategory slugs — extra listing feeds beyond the main IT category page. */
export const IT_SCRAPE_SUBCATEGORIES = [
  "web-development",
  "web-design",
  "e-commerce",
  "wordpress",
  "apps-programming",
  "data-science",
  "desktop-apps",
  "artificial-intelligence",
] as const;

export function getJobsUrl(
  page: number,
  language?: string,
  subcategory?: string
): string {
  const params = new URLSearchParams({
    category: IT_PROGRAMMING_CATEGORY,
    page: String(page),
  });
  if (language) {
    params.set("language", language);
  }
  if (subcategory) {
    params.set("subcategory", subcategory);
  }
  return `${WORKANA_BASE}/jobs?${params.toString()}`;
}

export function getDefaultMaxPages(): number {
  return parseInt(process.env.SCRAPE_MAX_PAGES || "25", 10);
}

export function getIncrementalMaxPages(): number {
  return parseInt(process.env.SCRAPE_INCREMENTAL_PAGES || "8", 10);
}

export function getSubcategoryMaxPages(): number {
  return parseInt(process.env.SCRAPE_SUBCATEGORY_PAGES || "3", 10);
}

/** Languages for manual/incremental scrapes — defaults to English only for speed. */
export function getIncrementalLanguages(): (typeof LANGUAGES)[number][] {
  const raw = process.env.SCRAPE_LANGUAGES?.trim();
  if (!raw) return ["en"];
  return raw
    .split(",")
    .map((l) => l.trim())
    .filter((l): l is (typeof LANGUAGES)[number] =>
      (LANGUAGES as readonly string[]).includes(l)
    );
}

export function parseProxy(proxyUrl: string) {
  // socks5://host:port:user:pass
  const match = proxyUrl.match(
    /^socks5:\/\/([^:]+):(\d+):([^:]+):(.+)$/
  );
  if (!match) {
    throw new Error("Invalid WORKANA_PROXY format. Expected socks5://host:port:user:pass");
  }
  return {
    server: `socks5://${match[1]}:${match[2]}`,
    username: match[3],
    password: match[4],
  };
}

export function getDbPath(): string {
  return path.join(process.cwd(), "data", "workana.db");
}

export function parseBudget(budget: string): {
  priceMin: number | null;
  priceMax: number | null;
  currency: string;
} {
  const text = budget.trim();
  if (!text || text.toLowerCase().includes("not defined")) {
    return { priceMin: null, priceMax: null, currency: "USD" };
  }

  const currencyMatch = text.match(/^(USD|EUR|BRL|ARS|MXN|COP|\$|€|R\$)/i);
  const currency = currencyMatch
    ? currencyMatch[1].replace("$", "USD").replace("€", "EUR").replace("R$", "BRL")
    : "USD";

  const numbers = text.match(/[\d,.]+/g)?.map((n) =>
    parseFloat(n.replace(/,/g, ""))
  ) ?? [];

  if (/less than|menos de|at[eé]|below|under/i.test(text) && numbers.length === 1) {
    return { priceMin: null, priceMax: numbers[0], currency };
  }
  if (/more than|mais de|m[aá]s de|over|above|from|acima de/i.test(text) && numbers.length === 1) {
    return { priceMin: numbers[0], priceMax: null, currency };
  }

  if (numbers.length >= 2) {
    return { priceMin: Math.min(...numbers), priceMax: Math.max(...numbers), currency };
  }
  if (numbers.length === 1) {
    return { priceMin: numbers[0], priceMax: numbers[0], currency };
  }
  return { priceMin: null, priceMax: null, currency };
}

export function jobIdFromLink(link: string): string {
  try {
    const url = new URL(link);
    const slug = url.pathname.split("/").filter(Boolean).pop();
    return slug ?? link;
  } catch {
    return link;
  }
}
