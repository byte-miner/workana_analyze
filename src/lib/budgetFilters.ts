export const BUDGET_FILTER_OPTIONS = [
  { id: "all", label: "All budgets", group: "all" as const },
  { id: "hourly", label: "Hourly budget", group: "hourly" as const },
  { id: "lt-50", label: "Less than USD 50", group: "fixed" as const },
  { id: "50-100", label: "USD 50 – 100", group: "fixed" as const },
  { id: "100-250", label: "USD 100 – 250", group: "fixed" as const },
  { id: "250-500", label: "USD 250 – 500", group: "fixed" as const },
  { id: "500-1000", label: "USD 500 – 1,000", group: "fixed" as const },
  { id: "1000-3000", label: "USD 1,000 – 3,000", group: "fixed" as const },
  { id: "gt-3000", label: "Over USD 3,000", group: "fixed" as const },
] as const;

export type BudgetFilterId = (typeof BUDGET_FILTER_OPTIONS)[number]["id"];

export function isValidBudgetFilter(value: string | null | undefined): value is BudgetFilterId {
  return BUDGET_FILTER_OPTIONS.some((option) => option.id === value);
}

/** Detect hourly / per-hour pricing from Workana budget text. */
export function isHourlyBudget(price: string): boolean {
  return /\/\s*hr|\/hour|per\s+hour|por\s+hora|\/\s*hora|hourly|precio\s+por\s+hora|preço\s+por\s+hora|precio\s*\/\s*hora|usd\s*\/\s*h|eur\s*\/\s*h|\$\s*\/\s*h/i.test(
    price
  );
}

function isUsdJob(price: string, currency: string): boolean {
  if (currency === "USD") return true;
  return /\bUSD\b|\$\s*\d/i.test(price);
}

function isLessThanBudget(price: string): boolean {
  return /less than|menos de|below|under|at[eé]\s/i.test(price);
}

function isOverBudget(price: string): boolean {
  return /more than|over|above|mais de|m[aá]s de|acima de|from\s/i.test(price);
}

/**
 * Classify a fixed USD job into a budget bucket using parsed min/max and label semantics.
 * "Less than USD 50" stores price_max=50 — bucket by upper cap, not overlap with 50–100.
 */
export function fixedUsdBucket(job: {
  price: string;
  priceMin: number | null;
  priceMax: number | null;
}): BudgetFilterId | null {
  const min = job.priceMin;
  const max = job.priceMax;

  if (isLessThanBudget(job.price) && max != null) {
    if (max <= 50) return "lt-50";
    if (max <= 100) return "50-100";
    if (max <= 250) return "100-250";
    if (max <= 500) return "250-500";
    if (max <= 1000) return "500-1000";
    if (max <= 3000) return "1000-3000";
    return "gt-3000";
  }

  if (isOverBudget(job.price) && min != null) {
    if (min >= 3000) return "gt-3000";
    if (min >= 1000) return "1000-3000";
    if (min >= 500) return "500-1000";
    if (min >= 250) return "250-500";
    if (min >= 100) return "100-250";
    if (min >= 50) return "50-100";
    return "lt-50";
  }

  const anchor = min ?? max;
  if (anchor == null) return null;

  if (anchor < 50) return "lt-50";
  if (anchor < 100) return "50-100";
  if (anchor < 250) return "100-250";
  if (anchor < 500) return "250-500";
  if (anchor < 1000) return "500-1000";
  if (anchor < 3000) return "1000-3000";
  return "gt-3000";
}

/** SQL fragment + params for SQLite budget filtering. */
export function buildBudgetFilterClause(filter: BudgetFilterId): {
  clause: string;
  params: (string | number | null)[];
} {
  if (filter === "all") {
    return { clause: "", params: [] };
  }

  const hourlyMatch = `(
    price LIKE '%/hr%' OR price LIKE '%/ hour%' OR price LIKE '%per hour%'
    OR price LIKE '%por hora%' OR price LIKE '%/ hora%' OR price LIKE '%hourly%'
    OR price LIKE '%precio por hora%' OR price LIKE '%preço por hora%'
    OR price LIKE '%USD / h%' OR price LIKE '%USD/h%'
  )`;

  if (filter === "hourly") {
    return { clause: `WHERE ${hourlyMatch}`, params: [] };
  }

  const usdFixed = `(currency = 'USD' OR price LIKE '%USD%' OR price LIKE '$%') AND NOT ${hourlyMatch}`;

  const lessThan = `(price LIKE '%less than%' OR price LIKE '%Less than%' OR price LIKE '%menos de%' OR price LIKE '%below%' OR price LIKE '%under%')`;
  const over = `(price LIKE '%more than%' OR price LIKE '%More than%' OR price LIKE '%Over %' OR price LIKE '%over %' OR price LIKE '%mais de%' OR price LIKE '%más de%' OR price LIKE '%acima de%')`;

  switch (filter) {
    case "lt-50":
      return {
        clause: `WHERE ${usdFixed} AND (
          (${lessThan} AND COALESCE(price_max, price_min, 999999) <= 50)
          OR (NOT ${lessThan} AND NOT ${over} AND COALESCE(price_min, price_max, 0) < 50)
        )`,
        params: [],
      };
    case "50-100":
      return {
        clause: `WHERE ${usdFixed} AND (
          (${lessThan} AND COALESCE(price_max, 0) > 50 AND COALESCE(price_max, 0) <= 100)
          OR (NOT ${lessThan} AND COALESCE(price_min, price_max, -1) >= 50 AND COALESCE(price_min, price_max, 0) < 100)
        )`,
        params: [],
      };
    case "100-250":
      return {
        clause: `WHERE ${usdFixed} AND (
          (${lessThan} AND COALESCE(price_max, 0) > 100 AND COALESCE(price_max, 0) <= 250)
          OR (NOT ${lessThan} AND COALESCE(price_min, price_max, -1) >= 100 AND COALESCE(price_min, price_max, 0) < 250)
        )`,
        params: [],
      };
    case "250-500":
      return {
        clause: `WHERE ${usdFixed} AND (
          (${lessThan} AND COALESCE(price_max, 0) > 250 AND COALESCE(price_max, 0) <= 500)
          OR (NOT ${lessThan} AND COALESCE(price_min, price_max, -1) >= 250 AND COALESCE(price_min, price_max, 0) < 500)
        )`,
        params: [],
      };
    case "500-1000":
      return {
        clause: `WHERE ${usdFixed} AND (
          (${lessThan} AND COALESCE(price_max, 0) > 500 AND COALESCE(price_max, 0) <= 1000)
          OR (NOT ${lessThan} AND COALESCE(price_min, price_max, -1) >= 500 AND COALESCE(price_min, price_max, 0) < 1000)
        )`,
        params: [],
      };
    case "1000-3000":
      return {
        clause: `WHERE ${usdFixed} AND (
          (${lessThan} AND COALESCE(price_max, 0) > 1000 AND COALESCE(price_max, 0) <= 3000)
          OR (NOT ${lessThan} AND COALESCE(price_min, price_max, -1) >= 1000 AND COALESCE(price_min, price_max, 0) < 3000)
        )`,
        params: [],
      };
    case "gt-3000":
      return {
        clause: `WHERE ${usdFixed} AND (
          (${over} AND COALESCE(price_min, price_max, 0) >= 3000)
          OR (NOT ${lessThan} AND NOT ${over} AND COALESCE(price_min, price_max, 0) >= 3000)
        )`,
        params: [],
      };
    default:
      return { clause: "", params: [] };
  }
}

export function jobMatchesBudgetFilter(
  job: { price: string; priceMin: number | null; priceMax: number | null; currency: string },
  filter: BudgetFilterId
): boolean {
  if (filter === "all") return true;

  const hourly = isHourlyBudget(job.price);
  if (filter === "hourly") return hourly;
  if (hourly || !isUsdJob(job.price, job.currency)) return false;

  return fixedUsdBucket(job) === filter;
}
