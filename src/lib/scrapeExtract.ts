/** Normalize subcategory slugs / labels from Workana listing cards. */
export const SUBCATEGORY_SLUG_LABELS: Record<string, string> = {
  "web-development": "Web Development",
  "web-design": "Web Design",
  "e-commerce": "E-commerce",
  wordpress: "WordPress",
  "apps-programming": "Apps programming. Android, iOS and others",
  "data-science": "Data Science",
  "desktop-apps": "Desktop apps",
  "artificial-intelligence": "Artificial Intelligence",
};

export function normalizeSubcategoryLabel(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "General";

  const slugKey = trimmed.toLowerCase().replace(/\s+/g, "-");
  if (SUBCATEGORY_SLUG_LABELS[slugKey]) {
    return SUBCATEGORY_SLUG_LABELS[slugKey];
  }

  const partial = Object.entries(SUBCATEGORY_SLUG_LABELS).find(
    ([slug]) => slugKey.includes(slug) || slug.includes(slugKey)
  );
  if (partial) return partial[1];

  return trimmed;
}

export function cleanJobDescription(text: string): string {
  if (!text) return "";

  return text
    .replace(/\uFFFD/g, "")
    .replace(/^\?+\s*/gm, "• ")
    .replace(/\s*\?+\s*/g, " ")
    .replace(/Category:\s*IT\s*&?\s*Programming[\s\S]*$/i, "")
    .replace(/Subcategory:\s*[\s\S]*$/i, "")
    .replace(/(?:Ver más|View more|Veja mais)[\s\S]*$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function isPlausibleCountry(country: string): boolean {
  const value = country.trim();
  if (!value || value === "Unknown") return false;
  if (value.length < 3 || value.length > 40) return false;
  if (/freelancer|verified|member|client|usuario|user/i.test(value)) return false;
  if (/^[A-Z](?:\.\s*[A-Z]){1,}(?:\.)?\s*$/i.test(value)) return false;
  if (/^\(?\.?\s*[A-Z]\.?\s*\)?$/i.test(value)) return false;
  return true;
}

export interface RawListingCard {
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

/** Runs inside the browser via page.evaluate — must be self-contained. */
export function extractListingCards(): RawListingCard[] {
  function cleanDescription(text: string): string {
    if (!text) return "";
    return text
      .replace(/\uFFFD/g, "")
      .replace(/^\?+\s*/gm, "• ")
      .replace(/\s*\?+\s*/g, " ")
      .replace(/Category:\s*IT\s*&?\s*Programming[\s\S]*$/i, "")
      .replace(/Subcategory:\s*[\s\S]*$/i, "")
      .replace(/(?:Ver más|View more|Veja mais)[\s\S]*$/i, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function isPlausibleCountryValue(value: string): boolean {
    if (!value || value === "Unknown") return false;
    if (value.length < 3 || value.length > 40) return false;
    if (/freelancer|verified|member|client|usuario|user/i.test(value)) return false;
    if (/^[A-Z](?:\.\s*[A-Z]){1,}(?:\.)?\s*$/i.test(value)) return false;
    return true;
  }

  function parseSubcategory(card: Element): string {
    const link = card.querySelector('a[href*="subcategory="]');
    if (link) {
      const href = link.getAttribute("href") || "";
      const match = href.match(/subcategory=([^&]+)/i);
      if (match) {
        return decodeURIComponent(match[1].replace(/\+/g, " ")).replace(/-/g, " ");
      }
      const text = link.textContent?.trim();
      if (text) return text;
    }
    const meta = card.querySelector("[class*='subcategory'], .project-category a");
    return meta?.textContent?.trim() || "General";
  }

  function parseCountry(card: Element): string {
    const author = card.querySelector(".project-author, .author-info, .client-info");
    if (author) {
      const flagImg = author.querySelector(
        'img[src*="flag"], img[src*="country"], img[class*="flag"], span[class*="flag"] img'
      );
      if (flagImg) {
        const fromFlag =
          flagImg.getAttribute("title") ||
          flagImg.getAttribute("alt") ||
          "";
        if (isPlausibleCountryValue(fromFlag)) return fromFlag;
      }

      const location = author.querySelector(
        "[class*='country'], [class*='location'], .country-name"
      );
      const locText = location?.textContent?.trim() || location?.getAttribute("title") || "";
      if (isPlausibleCountryValue(locText)) return locText;
    }

    const countryEl = card.querySelector(
      ".country-name, [data-country], [class*='client-country']"
    );
    if (countryEl) {
      const fromEl =
        countryEl.getAttribute("data-country") ||
        countryEl.getAttribute("title") ||
        countryEl.textContent?.trim() ||
        "";
      if (isPlausibleCountryValue(fromEl)) return fromEl;
    }

    return "Unknown";
  }

  function parsePublishedAt(
    card: Element,
    detailsText: string,
    cardText: string
  ): string | null {
    const timeEl = card.querySelector("time[datetime]");
    if (timeEl) {
      const dt = timeEl.getAttribute("datetime");
      if (dt) return dt;
      const timeText = timeEl.textContent?.trim();
      if (timeText) return timeText;
    }

    const dateEl = card.querySelector(
      ".project-main-details .date, .project-header .date, span.date, p.date, [class*='date']"
    );
    const dateTitle = dateEl?.getAttribute("title") || "";
    const dateText = dateEl?.textContent?.trim() || "";
    if (dateTitle) return dateTitle;
    if (dateText) return dateText;

    const pubMatch = (detailsText || cardText).match(
      /(?:Published|Publicado|Publicado em|Publicación)[:\s]+(.+?)(?:\s+(?:Bids|Propostas|Propuestas|Ofertas)|$)/i
    );
    return pubMatch?.[1]?.trim() || null;
  }

  const projects = document.querySelector("#projects");
  if (!projects) return [];

  const cards = projects.querySelectorAll(
    ":scope > .project-item, :scope > div.project-item, :scope > div[data-project], :scope > div"
  );

  const results: RawListingCard[] = [];

  cards.forEach((card) => {
    const titleEl = card.querySelector(".project-header h2 a, h2 a");
    if (!titleEl) return;

    const title =
      titleEl.getAttribute("title") ||
      titleEl.textContent?.trim() ||
      "";
    const link = (titleEl as HTMLAnchorElement).href || "";
    if (!link || !title) return;

    const priceEl = card.querySelector(".project-header h4 span, h4 span, .budget");
    const price = priceEl?.textContent?.trim() || "Not defined";

    const detailsEl = card.querySelector(".project-main-details, .item-info");
    const detailsText = detailsEl?.textContent?.replace(/\s+/g, " ") || "";
    const cardText = (card.textContent || "").replace(/\s+/g, " ");

    const publishedAt = parsePublishedAt(card, detailsText, cardText);

    let bids: number | null = null;
    const bidsEl = card.querySelector(".project-main-details .bids, .bids");
    const bidsSource = bidsEl?.textContent || detailsText || cardText;
    const bidsMatch = bidsSource.match(
      /(?:Bids|Propostas|Propuestas|Ofertas)[:\s]+(\d+)/i
    );
    if (bidsMatch) bids = parseInt(bidsMatch[1], 10);

    const skillEls = card.querySelectorAll(
      ".project-body .skills a.skill, .skills a.skill, .skills a"
    );
    const skills = Array.from(skillEls)
      .map((el) => el.textContent?.trim() || "")
      .filter(Boolean);

    const descEl = card.querySelector(
      ".html-desc.project-details, .html-desc, .project-details:not(.project-main-details), .project-body .html-text"
    );
    let description = "";
    if (descEl) {
      const clone = descEl.cloneNode(true) as HTMLElement;
      clone.querySelectorAll("a, script, style, .view-more").forEach((n) => n.remove());
      description = cleanDescription(clone.innerText || clone.textContent || "");
    }

    results.push({
      title,
      link,
      price,
      country: parseCountry(card),
      skills,
      bids,
      publishedAt,
      subcategory: parseSubcategory(card),
      description,
    });
  });

  return results;
}
