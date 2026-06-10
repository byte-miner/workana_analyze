/** Parse Workana published-at text (relative or absolute) into ISO string. */
export function parseWorkanaPublishedAt(
  raw: string | null,
  scrapedAt: Date = new Date()
): string | null {
  if (!raw?.trim()) return null;

  const text = stripPublishedPrefix(raw.trim());
  const parsed = Date.parse(text);
  if (!Number.isNaN(parsed)) {
    return new Date(parsed).toISOString();
  }

  const lower = text.toLowerCase();
  const relative = parseRelativeDuration(lower, scrapedAt);
  if (relative) return relative;

  return null;
}

export function isValidPublishedIso(value: string | null | undefined): value is string {
  if (!value?.trim()) return false;
  return !Number.isNaN(Date.parse(value)) && /^\d{4}-\d{2}-\d{2}T/.test(value);
}

export function normalizePublishedAt(
  raw: string | null,
  scrapedAt: Date = new Date()
): string | null {
  const parsed = parseWorkanaPublishedAt(raw, scrapedAt);
  return isValidPublishedIso(parsed) ? parsed : null;
}

function stripPublishedPrefix(text: string): string {
  return text
    .replace(/^(?:Publicado|Published|Publicación|Publicado em)[:\s]+/i, "")
    .trim();
}

function parseRelativeDuration(text: string, scrapedAt: Date): string | null {
  const fuzzy = parseFuzzyRelative(text, scrapedAt);
  if (fuzzy) return fuzzy;

  if (/(\d+)\s*(?:min(?:ute)?s?|minutos?|min\.?)\s+ago/i.test(text)) {
    const match = text.match(/(\d+)\s*(?:min(?:ute)?s?|minutos?|min\.?)\s+ago/i);
    if (match) {
      return new Date(scrapedAt.getTime() - parseInt(match[1], 10) * 60_000).toISOString();
    }
  }

  if (/(\d+)\s*(?:hour?s?|horas?|hr?s?)\s+ago/i.test(text)) {
    const match = text.match(/(\d+)\s*(?:hour?s?|horas?|hr?s?)\s+ago/i);
    if (match) {
      return new Date(scrapedAt.getTime() - parseInt(match[1], 10) * 3_600_000).toISOString();
    }
  }

  if (/(\d+)\s*(?:day?s?|días?|dias?)\s+ago/i.test(text)) {
    const match = text.match(/(\d+)\s*(?:day?s?|días?|dias?)\s+ago/i);
    if (match) {
      return new Date(scrapedAt.getTime() - parseInt(match[1], 10) * 86_400_000).toISOString();
    }
  }

  const patterns: Array<{ re: RegExp; ms: (n: number) => number }> = [
    {
      re: /(\d+)\s*(?:sec(?:ond)?s?|segundos?|s)\b/,
      ms: (n) => n * 1000,
    },
    {
      re: /(\d+)\s*(?:min(?:ute)?s?|minutos?|min\.?)\b/,
      ms: (n) => n * 60_000,
    },
    {
      re: /(\d+)\s*(?:hour?s?|horas?|hr?s?)\b/,
      ms: (n) => n * 3_600_000,
    },
    {
      re: /(\d+)\s*(?:day?s?|días?|dias?)\b/,
      ms: (n) => n * 86_400_000,
    },
    {
      re: /(\d+)\s*(?:week?s?|semanas?)\b/,
      ms: (n) => n * 7 * 86_400_000,
    },
    {
      re: /(\d+)\s*(?:month?s?|meses?)\b/,
      ms: (n) => n * 30 * 86_400_000,
    },
  ];

  for (const { re, ms } of patterns) {
    const match = text.match(re);
    if (match) {
      const ago = ms(parseInt(match[1], 10));
      return new Date(scrapedAt.getTime() - ago).toISOString();
    }
  }

  if (/just now|agora|ahora|hace un momento|few minutes|alguns minutos|unos minutos|poucos minutos/i.test(text)) {
    return new Date(scrapedAt.getTime() - 3 * 60_000).toISOString();
  }

  if (/hour ago|uma hora|hace una hora|1 hour/i.test(text)) {
    return new Date(scrapedAt.getTime() - 3_600_000).toISOString();
  }

  if (/yesterday|ontem|ayer/i.test(text)) {
    return new Date(scrapedAt.getTime() - 86_400_000).toISOString();
  }

  return null;
}

function parseFuzzyRelative(text: string, scrapedAt: Date): string | null {
  if (/^last month$|^el mes pasado$|^m[eê]s passado$|^hace un mes$|^a month ago$/i.test(text)) {
    return new Date(scrapedAt.getTime() - 30 * 86_400_000).toISOString();
  }
  if (/^last week$|^la semana pasada$|^semana passada$|^hace una semana$|^a week ago$/i.test(text)) {
    return new Date(scrapedAt.getTime() - 7 * 86_400_000).toISOString();
  }
  return null;
}

/** Human-readable relative time: "5 minutes ago", "2 hours ago", "3 days ago". */
export function formatTimeAgo(value: string | null, now: Date = new Date()): string {
  if (!value?.trim()) return "Unknown";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const diffMs = Math.max(0, now.getTime() - date.getTime());
  const minutes = Math.floor(diffMs / 60_000);
  const hours = Math.floor(diffMs / 3_600_000);
  const days = Math.floor(diffMs / 86_400_000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  }
  if (hours < 24) {
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }
  if (days < 30) {
    return `${days} day${days === 1 ? "" : "s"} ago`;
  }

  const weeks = Math.floor(days / 7);
  if (weeks < 8) {
    return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
  }

  const months = Math.floor(days / 30);
  return `${months} month${months === 1 ? "" : "s"} ago`;
}
