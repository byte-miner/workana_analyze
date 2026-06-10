import type { Browser, Page } from "playwright";
import type { WorkanaJob, ScrapeResult } from "./types";
import {
  getJobsUrl,
  parseBudget,
  jobIdFromLink,
  LANGUAGES,
  IT_SCRAPE_SUBCATEGORIES,
  getDefaultMaxPages,
  getSubcategoryMaxPages,
  getIncrementalLanguages,
} from "./config";
import { normalizePublishedAt } from "./dates";
import { classifyWorkanaCategory } from "./categories";
import {
  extractListingCards,
  cleanJobDescription,
  isPlausibleCountry,
  normalizeSubcategoryLabel,
} from "./scrapeExtract";
import {
  createBrowserSession,
  routeLabel,
  selectNetworkRoute,
  getProxyMode,
  buildProxyUrl,
  type NetworkRoute,
} from "./network";
import { upsertJob, startScrapeLog, finishScrapeLog, repairInvalidPublishedDates } from "./db";

let scrapeRunning = false;
let scrapeStatus: "idle" | "running" | "error" = "idle";
let scrapeMessage: string | null = null;

const scrapeGlobal = globalThis as typeof globalThis & {
  __workanaActiveScrape?: Promise<ScrapeResult>;
};

/** Retain scrape promise on globalThis so Next.js does not drop background work. */
export function retainScrapeTask(task: Promise<ScrapeResult>): Promise<ScrapeResult> {
  scrapeGlobal.__workanaActiveScrape = task;
  return task.finally(() => {
    if (scrapeGlobal.__workanaActiveScrape === task) {
      scrapeGlobal.__workanaActiveScrape = undefined;
    }
  });
}

export function getScrapeStatus() {
  return { status: scrapeStatus, message: scrapeMessage };
}

async function setupPage(browser: Browser): Promise<Page> {
  const session = process.env.WORKANA_SESSION;
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    locale: "en-US",
    viewport: { width: 1280, height: 900 },
  });

  await context.route(/\.(png|jpe?g|gif|webp|svg|ico|woff2?|ttf|eot)(\?|$)/i, (route) =>
    route.abort()
  );
  await context.route(/googletagmanager|google-analytics|facebook\.net|hotjar|doubleclick/i, (route) =>
    route.abort()
  );

  if (session) {
    await context.addCookies([
      {
        name: "PHPSESSID",
        value: session,
        domain: ".workana.com",
        path: "/",
        httpOnly: true,
        secure: true,
        sameSite: "Lax",
      },
    ]);
  }

  const page = await context.newPage();
  return page;
}

async function waitForJobListings(page: Page, timeoutMs = 20000): Promise<number> {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const count = await page.evaluate(() => {
      return document.querySelectorAll(
        "#projects > .project-item, #projects > div.project-item, #projects > div"
      ).length;
    });
    if (count > 0) return count;
    await page.waitForTimeout(600);
  }

  return 0;
}

async function detectGuestWall(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    const text = document.body.innerText.toLowerCase();
    const hasProjects = document.querySelectorAll(
      "#projects > .project-item, #projects > div"
    ).length;
    if (hasProjects > 0) return false;
    return (
      text.includes("sign up, create your profile") ||
      text.includes("register as freelancer") ||
      text.includes("crea tu perfil")
    );
  });
}
async function dismissPopups(page: Page) {
  try {
    const acceptCookies = page.locator("#onetrust-accept-btn-handler");
    if (await acceptCookies.isVisible({ timeout: 3000 })) {
      await acceptCookies.click();
    }
  } catch {
    /* no cookie banner */
  }

  try {
    const closeBtn = page.locator("#app button").filter({ hasText: /close|fechar|cerrar/i });
    if (await closeBtn.first().isVisible({ timeout: 2000 })) {
      await closeBtn.first().click();
    }
  } catch {
    /* no modal */
  }
}

interface RawJobCard {
  title: string;
  link: string;
  price: string;
  country: string;
  skills: string[];
  bids: number | null;
  publishedAt: string | null;
  subcategory: string;
  description: string;
}

async function extractJobsFromPage(page: Page): Promise<RawJobCard[]> {
  return page.evaluate(extractListingCards);
}

async function enrichJobCountry(page: Page, link: string): Promise<string> {
  try {
    await page.goto(link, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForTimeout(1500);

    const country = await page.evaluate(() => {
      const selectors = [
        "[class*='country']",
        "[class*='client-info'] [class*='location']",
        ".client-profile .location",
        "span[class*='flag']",
      ];
      for (const sel of selectors) {
        const el = document.querySelector(sel);
        if (el?.textContent?.trim()) return el.textContent.trim();
        if (el?.getAttribute("title")) return el.getAttribute("title")!;
      }

      const bodyText = document.body.innerText;
      const match = bodyText.match(/(?:Country|País|From|De):\s*([A-Za-zÀ-ÿ\s]{2,30})/i);
      return match ? match[1].trim() : "";
    });

    return country || "Unknown";
  } catch {
    return "Unknown";
  }
}

async function scrapePage(
  page: Page,
  pageNum: number,
  language: string,
  enrichCountry: boolean,
  subcategory?: string
): Promise<RawJobCard[]> {
  const url = getJobsUrl(pageNum, language, subcategory);
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90000 });
  await dismissPopups(page);
  await page.waitForSelector("#projects", { timeout: 25000 }).catch(() => null);

  let listingCount = await waitForJobListings(page);
  let jobs = listingCount > 0 ? await extractJobsFromPage(page) : [];

  for (let attempt = 0; jobs.length === 0 && attempt < 2; attempt++) {
    await page.waitForTimeout(1500);
    listingCount = await waitForJobListings(page, 10000);
    jobs = listingCount > 0 ? await extractJobsFromPage(page) : [];
  }

  if (jobs.length === 0 && (await detectGuestWall(page))) {
    throw new Error(
      "Workana returned the guest signup wall — set a valid WORKANA_SESSION cookie in .env.local"
    );
  }

  if (enrichCountry) {
    for (const job of jobs) {
      if (job.country === "Unknown") {
        job.country = await enrichJobCountry(page, job.link);
      }
    }
  }

  return jobs;
}

function ingestRawJobs(
  rawJobs: RawJobCard[],
  language: string,
  seenLinks: Set<string>,
  result: ScrapeResult
) {
  for (const raw of rawJobs) {
    if (seenLinks.has(raw.link)) continue;
    seenLinks.add(raw.link);

    const scrapedSubcategory = normalizeSubcategoryLabel(raw.subcategory);
    const country = isPlausibleCountry(raw.country) ? raw.country.trim() : "Unknown";
    const description = cleanJobDescription(raw.description);
    const { priceMin, priceMax, currency } = parseBudget(raw.price);
    const scrapedAt = new Date().toISOString();

    const jobDraft: WorkanaJob = {
      id: jobIdFromLink(raw.link),
      title: raw.title.trim(),
      link: raw.link,
      country,
      price: raw.price,
      priceMin,
      priceMax,
      currency,
      category: "IT & Programming",
      subcategory: scrapedSubcategory,
      skills: raw.skills,
      bids: raw.bids,
      publishedAt: normalizePublishedAt(raw.publishedAt, new Date(scrapedAt)),
      scrapedAt,
      language,
      description,
    };

    const classified = classifyWorkanaCategory(jobDraft);
    const job: WorkanaJob = {
      ...jobDraft,
      subcategory:
        scrapedSubcategory !== "General" ? scrapedSubcategory : classified,
    };

    const upsertResult = upsertJob(job);
    if (upsertResult === "new") result.newJobs++;
    else result.updatedJobs++;
    result.totalScraped++;
  }
}

async function scrapeFeed(
  page: Page,
  label: string,
  maxPages: number,
  language: typeof LANGUAGES[number],
  subcategory: string | undefined,
  enrichCountry: boolean,
  seenLinks: Set<string>,
  result: ScrapeResult,
  onStatus: (msg: string) => void,
  activeRoute: NetworkRoute
) {
  let consecutiveEmpty = 0;

  for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
    try {
      onStatus(`Scraping ${label} page ${pageNum}/${maxPages} (${routeLabel(activeRoute)})`);
      const rawJobs = await scrapePage(page, pageNum, language, enrichCountry, subcategory);

      if (rawJobs.length === 0) {
        consecutiveEmpty++;
        if (consecutiveEmpty >= 2) break;
        continue;
      }

      consecutiveEmpty = 0;
      result.pagesScraped++;
      ingestRawJobs(rawJobs, language, seenLinks, result);
      await page.waitForTimeout(400);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      result.errors.push(`${label} page ${pageNum}: ${msg}`);
      if (pageNum <= 3) continue;
      break;
    }
  }
}

async function performScrapeLoop(
  page: Page,
  maxPages: number,
  enrichCountry: boolean,
  activeRoute: NetworkRoute,
  onStatus: (msg: string) => void,
  languages: (typeof LANGUAGES)[number][] = [...LANGUAGES]
): Promise<ScrapeResult> {
  const result: ScrapeResult = {
    newJobs: 0,
    updatedJobs: 0,
    totalScraped: 0,
    pagesScraped: 0,
    errors: [],
  };
  const seenLinks = new Set<string>();
  const subcategoryPages = getSubcategoryMaxPages();

  for (const language of languages) {
    await scrapeFeed(
      page,
      `${language} IT jobs`,
      maxPages,
      language,
      undefined,
      enrichCountry,
      seenLinks,
      result,
      onStatus,
      activeRoute
    );
  }

  for (const subcategory of IT_SCRAPE_SUBCATEGORIES) {
    await scrapeFeed(
      page,
      `en/${subcategory}`,
      subcategoryPages,
      "en",
      subcategory,
      false,
      seenLinks,
      result,
      onStatus,
      activeRoute
    );
  }

  return result;
}

function alternateRoute(route: NetworkRoute): NetworkRoute {
  return route === "direct" ? "proxy" : "direct";
}

export async function runScraper(options?: {
  maxPages?: number;
  enrichCountry?: boolean;
  languages?: (typeof LANGUAGES)[number][];
}): Promise<ScrapeResult> {
  return retainScrapeTask(
    (async () => {
      if (scrapeRunning) {
        throw new Error("Scrape already in progress");
      }

      scrapeRunning = true;
      scrapeStatus = "running";
      scrapeMessage = "Starting scrape...";

      const maxPages = options?.maxPages ?? getDefaultMaxPages();
      const enrichCountry = options?.enrichCountry ?? false;
      const languages = options?.languages ?? getIncrementalLanguages();
      const logId = startScrapeLog();

      let session: Awaited<ReturnType<typeof createBrowserSession>> | null = null;
      let activeRoute: NetworkRoute | null = null;
      let result: ScrapeResult = {
        newJobs: 0,
        updatedJobs: 0,
        totalScraped: 0,
        pagesScraped: 0,
        errors: [],
      };

      try {
        scrapeMessage = "Detecting network route (VPN/proxy)...";
        activeRoute = await selectNetworkRoute();

        const routesToTry: NetworkRoute[] = [activeRoute];
        const fallback = alternateRoute(activeRoute);
        const mode = getProxyMode();
        if (
          mode === "auto" &&
          (fallback === "direct" || buildProxyUrl()) &&
          fallback !== activeRoute
        ) {
          routesToTry.push(fallback);
        }

        for (const route of routesToTry) {
          if (mode === "never" && route === "proxy") continue;
          if (mode === "always" && route === "direct") continue;
          if (route === "proxy" && !buildProxyUrl()) continue;

          if (session) {
            await session.close();
            session = null;
          }

          activeRoute = route;
          scrapeMessage = `Connecting via ${routeLabel(route)}...`;
          session = await createBrowserSession(route);
          const page = await setupPage(session.browser);

          result = await performScrapeLoop(
            page,
            maxPages,
            enrichCountry,
            route,
            (msg) => {
              scrapeMessage = msg;
            },
            languages
          );

          if (result.pagesScraped > 0) break;

          if (routesToTry.indexOf(route) < routesToTry.length - 1) {
            result.errors.push(
              `${routeLabel(route)} returned no pages — retrying with ${routeLabel(alternateRoute(route))}`
            );
          }
        }

        if (result.pagesScraped === 0 && result.errors.length === 0) {
          result.errors.push("No projects found on any page");
        }

        if (!process.env.WORKANA_SESSION) {
          result.errors.push(
            "WORKANA_SESSION is not set — listings may be incomplete behind Workana's guest wall"
          );
        }

        scrapeStatus = result.pagesScraped > 0 ? "idle" : "error";
        const repairedDates = result.pagesScraped > 0 ? repairInvalidPublishedDates() : 0;
        scrapeMessage =
          result.pagesScraped > 0
            ? `Done via ${routeLabel(activeRoute!)}: ${result.newJobs} new, ${result.updatedJobs} updated${repairedDates ? `, ${repairedDates} dates fixed` : ""}`
            : `Scrape failed — try toggling VPN. ${result.errors.slice(-1)[0] ?? ""}`;

        finishScrapeLog(logId, {
          newJobs: result.newJobs,
          updatedJobs: result.updatedJobs,
          pagesScraped: result.pagesScraped,
          status: result.pagesScraped > 0 ? "success" : "error",
          message: scrapeMessage,
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        result.errors.push(msg);
        scrapeStatus = "error";
        scrapeMessage = msg;
        finishScrapeLog(logId, {
          newJobs: result.newJobs,
          updatedJobs: result.updatedJobs,
          pagesScraped: result.pagesScraped,
          status: "error",
          message: msg,
        });
      } finally {
        if (session) await session.close();
        scrapeRunning = false;
      }

      return result;
    })()
  );
}

export function isScrapeRunning() {
  return scrapeRunning;
}
