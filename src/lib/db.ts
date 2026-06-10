import { DatabaseSync } from "node:sqlite";
import fs from "fs";
import path from "path";
import type { WorkanaJob } from "./types";
import { getDbPath } from "./config";
import { isValidPublishedIso, normalizePublishedAt } from "./dates";
import { buildBudgetFilterClause, type BudgetFilterId } from "./budgetFilters";

let db: DatabaseSync | null = null;

function ensureDataDir() {
  const dir = path.dirname(getDbPath());
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function getDb(): DatabaseSync {
  if (db) return db;

  ensureDataDir();
  db = new DatabaseSync(getDbPath());
  db.exec("PRAGMA journal_mode = WAL");

  db.exec(`
    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      link TEXT NOT NULL UNIQUE,
      country TEXT DEFAULT 'Unknown',
      price TEXT DEFAULT '',
      price_min REAL,
      price_max REAL,
      currency TEXT DEFAULT 'USD',
      category TEXT DEFAULT 'IT & Programming',
      subcategory TEXT DEFAULT 'General',
      skills TEXT DEFAULT '[]',
      bids INTEGER,
      published_at TEXT,
      scraped_at TEXT NOT NULL,
      language TEXT DEFAULT '',
      description TEXT DEFAULT ''
    );

    CREATE INDEX IF NOT EXISTS idx_jobs_scraped_at ON jobs(scraped_at);
    CREATE INDEX IF NOT EXISTS idx_jobs_published_at ON jobs(published_at);
    CREATE INDEX IF NOT EXISTS idx_jobs_subcategory ON jobs(subcategory);
    CREATE INDEX IF NOT EXISTS idx_jobs_country ON jobs(country);

    CREATE TABLE IF NOT EXISTS scrape_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      started_at TEXT NOT NULL,
      finished_at TEXT,
      new_jobs INTEGER DEFAULT 0,
      updated_jobs INTEGER DEFAULT 0,
      pages_scraped INTEGER DEFAULT 0,
      status TEXT DEFAULT 'running',
      message TEXT
    );
  `);

  return db;
}

function rowToJob(row: Record<string, unknown>): WorkanaJob {
  return {
    id: row.id as string,
    title: row.title as string,
    link: row.link as string,
    country: row.country as string,
    price: row.price as string,
    priceMin: row.price_min as number | null,
    priceMax: row.price_max as number | null,
    currency: row.currency as string,
    category: row.category as string,
    subcategory: row.subcategory as string,
    skills: JSON.parse((row.skills as string) || "[]") as string[],
    bids: row.bids as number | null,
    publishedAt: row.published_at as string | null,
    scrapedAt: row.scraped_at as string,
    language: row.language as string,
    description: row.description as string,
  };
}

export function upsertJob(job: WorkanaJob): "new" | "updated" {
  const database = getDb();
  const existing = database
    .prepare("SELECT id FROM jobs WHERE link = ?")
    .get(job.link);

  database
    .prepare(
      `INSERT INTO jobs (
        id, title, link, country, price, price_min, price_max, currency,
        category, subcategory, skills, bids, published_at, scraped_at, language, description
      ) VALUES (
        @id, @title, @link, @country, @price, @priceMin, @priceMax, @currency,
        @category, @subcategory, @skills, @bids, @publishedAt, @scrapedAt, @language, @description
      )
      ON CONFLICT(link) DO UPDATE SET
        title = excluded.title,
        country = excluded.country,
        price = excluded.price,
        price_min = excluded.price_min,
        price_max = excluded.price_max,
        currency = excluded.currency,
        subcategory = excluded.subcategory,
        skills = excluded.skills,
        bids = excluded.bids,
        published_at = COALESCE(excluded.published_at, jobs.published_at),
        scraped_at = excluded.scraped_at,
        language = excluded.language,
        description = excluded.description`
    )
    .run({
      ...job,
      skills: JSON.stringify(job.skills),
    });

  return existing ? "updated" : "new";
}

export function getRecentJobs(limit = 50, since?: string): WorkanaJob[] {
  const database = getDb();
  if (since) {
    const rows = database
      .prepare(
        "SELECT * FROM jobs WHERE scraped_at > ? ORDER BY scraped_at DESC LIMIT ?"
      )
      .all(since, limit) as Record<string, unknown>[];
    return rows.map(rowToJob);
  }
  const rows = database
    .prepare("SELECT * FROM jobs ORDER BY scraped_at DESC LIMIT ?")
    .all(limit) as Record<string, unknown>[];
  return rows.map(rowToJob);
}

export function getJobsPaginated(
  page = 1,
  pageSize = 10,
  budgetFilter: BudgetFilterId = "all"
): {
  jobs: WorkanaJob[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  budgetFilter: BudgetFilterId;
} {
  const database = getDb();
  const safePage = Math.max(1, page);
  const safeSize = Math.min(100, Math.max(1, pageSize));
  const offset = (safePage - 1) * safeSize;
  const { clause, params } = buildBudgetFilterClause(budgetFilter);

  const totalRow = database
    .prepare(`SELECT COUNT(*) as count FROM jobs ${clause}`)
    .get(...params) as { count: number };
  const total = totalRow.count;
  const totalPages = Math.max(1, Math.ceil(total / safeSize));

  const rows = database
    .prepare(
      `SELECT * FROM jobs
       ${clause}
       ORDER BY
         COALESCE(published_at, scraped_at) DESC,
         scraped_at DESC
       LIMIT ? OFFSET ?`
    )
    .all(...params, safeSize, offset) as Record<string, unknown>[];

  return {
    jobs: rows.map(rowToJob),
    total,
    page: safePage,
    pageSize: safeSize,
    totalPages,
    budgetFilter,
  };
}

export function getJobsSince(dateIso: string): WorkanaJob[] {
  const database = getDb();
  const rows = database
    .prepare(
      `SELECT * FROM jobs
       WHERE scraped_at >= ?
          OR (published_at IS NOT NULL AND published_at LIKE '%-%-%T%')
       ORDER BY scraped_at DESC`
    )
    .all(dateIso) as Record<string, unknown>[];

  return rows
    .map(rowToJob)
    .filter((job) => {
      const scrapedRecently = job.scrapedAt >= dateIso;
      const publishedRecently =
        isValidPublishedIso(job.publishedAt) && job.publishedAt >= dateIso;
      return scrapedRecently || publishedRecently;
    });
}

export function getAllJobs(): WorkanaJob[] {
  const database = getDb();
  const rows = database
    .prepare("SELECT * FROM jobs ORDER BY scraped_at DESC")
    .all() as Record<string, unknown>[];
  return rows.map(rowToJob);
}

export function getJobCount(): number {
  const database = getDb();
  const row = database.prepare("SELECT COUNT(*) as count FROM jobs").get() as {
    count: number;
  };
  return row.count;
}

/** Re-parse legacy published_at strings (e.g. "Last month") into ISO timestamps. */
export function repairInvalidPublishedDates(): number {
  const database = getDb();
  const rows = database
    .prepare(
      `SELECT id, published_at, scraped_at FROM jobs
       WHERE published_at IS NOT NULL AND published_at NOT LIKE '%-%-%T%'`
    )
    .all() as Array<{ id: string; published_at: string; scraped_at: string }>;

  const update = database.prepare("UPDATE jobs SET published_at = ? WHERE id = ?");
  let fixed = 0;

  for (const row of rows) {
    const normalized = normalizePublishedAt(
      row.published_at,
      new Date(row.scraped_at)
    );
    update.run(normalized, row.id);
    fixed++;
  }

  return fixed;
}

export function startScrapeLog(): number {
  const database = getDb();
  const result = database
    .prepare(
      "INSERT INTO scrape_log (started_at, status) VALUES (datetime('now'), 'running')"
    )
    .run();
  return Number(result.lastInsertRowid);
}

export function finishScrapeLog(
  logId: number,
  data: {
    newJobs: number;
    updatedJobs: number;
    pagesScraped: number;
    status: "success" | "error";
    message?: string;
  }
) {
  const database = getDb();
  database
    .prepare(
      `UPDATE scrape_log SET
        finished_at = datetime('now'),
        new_jobs = ?,
        updated_jobs = ?,
        pages_scraped = ?,
        status = ?,
        message = ?
      WHERE id = ?`
    )
    .run(
      data.newJobs,
      data.updatedJobs,
      data.pagesScraped,
      data.status,
      data.message ?? null,
      logId
    );
}

export function getLastScrapeLog() {
  const database = getDb();
  return database
    .prepare("SELECT * FROM scrape_log ORDER BY id DESC LIMIT 1")
    .get();
}
