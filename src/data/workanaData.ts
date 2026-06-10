export type Region = "Americas" | "Asia" | "Europe";
export type CountryRole = "Producer" | "Client" | "Both";

export interface CountryRanking {
  rank: number;
  country: string;
  share: number;
  shareLabel: string;
  role: string;
  region: Region;
}

export interface CountryProject {
  country: string;
  region: Region;
  role: CountryRole;
  projectTypes: string[];
  specialization: string;
  priority?: "primary" | "secondary" | "buyer";
}

export interface Office {
  city: string;
  country: string;
  type: "HQ" | "Regional";
}

export type RegistrationType =
  | "Parent company"
  | "Operational HQ"
  | "Registered office"
  | "Regional subsidiary";

export interface RegisteredCountry {
  country: string;
  region: Region | "North America" | "Europe" | "Oceania";
  entityName: string;
  registrationType: RegistrationType;
  city: string;
  address?: string;
  role: string;
  since?: number;
  source: string;
}

export interface CompetitorComparison {
  name: string;
  focus: string;
  fees: string;
  strength: string;
  weakness: string;
}

export interface AiQuestion {
  question: string;
  answer: string;
}

export const coreFacts = {
  founded: 2012,
  foundedIn: "Buenos Aires, Argentina",
  founders: [
    "Tomás O'Farrell",
    "Guillermo Bracciaforte",
    "Fernando Fornales",
    "Mariano Iglesias",
  ],
  funding: {
    round: "Series C",
    amount: "$7M",
    investor: "SEEK",
    year: 2018,
  },
  userBase: {
    freelancers: "Millions of freelancers",
    monthlyProjects: "Tens of thousands of monthly projects",
  },
  mission:
    "Democratize freelance work across Latin America and beyond — secure payments, language accessibility, and bypassing local regulatory barriers for remote talent.",
};

export const offices: Office[] = [
  { city: "Buenos Aires", country: "Argentina", type: "HQ" },
  { city: "São Paulo", country: "Brazil", type: "Regional" },
  { city: "New York", country: "United States", type: "Regional" },
  { city: "Kuala Lumpur", country: "Malaysia", type: "Regional" },
];

/** Legal entities & registered offices (Workana LLC + subsidiaries/affiliates per Terms & public filings) */
export const registeredCountries: RegisteredCountry[] = [
  {
    country: "United States",
    region: "North America",
    entityName: "Workana LLC",
    registrationType: "Parent company",
    city: "New York, NY",
    address: "1732 1st Ave, Number 28490, New York, NY 10128",
    role: "Delaware-incorporated parent company. Governs platform Terms; legal notices and IP claims are handled at this US address.",
    since: 2012,
    source: "Workana Terms & Conditions (help.workana.com)",
  },
  {
    country: "United States",
    region: "North America",
    entityName: "Workana LLC",
    registrationType: "Registered office",
    city: "Wilmington, DE",
    address: "Registered in Delaware as a limited liability company",
    role: "State of incorporation for Workana LLC — foreign LLC registered for US legal and financial operations.",
    since: 2012,
    source: "Workana Terms & Conditions; NY DOS foreign LLC filing (2012)",
  },
  {
    country: "Argentina",
    region: "Americas",
    entityName: "Workana (operational HQ)",
    registrationType: "Operational HQ",
    city: "Buenos Aires",
    address: "Castillo 1366, CABA",
    role: "Founded 2012 in Buenos Aires. Original company home and Latin America operational headquarters.",
    since: 2012,
    source: "Workana blog; Craft.co company profile",
  },
  {
    country: "Brazil",
    region: "Americas",
    entityName: "Workana Brazil operations",
    registrationType: "Registered office",
    city: "São Paulo",
    address: "R. Butantã 194",
    role: "Registered office for Brazilian operations — localized payments, support, and compliance for Brazil's market (~50% of platform traffic).",
    source: "Craft.co; regional operations filings",
  },
  {
    country: "Ireland",
    region: "Europe",
    entityName: "Workana European operations",
    registrationType: "Registered office",
    city: "Dublin",
    role: "Registered office for European and other international users (excluding US and Brazil) — EU/international legal and financial operations.",
    source: "Public company registry summaries; Workana global structure",
  },
  {
    country: "Malaysia",
    region: "Asia",
    entityName: "Workana Sdn Bhd",
    registrationType: "Regional subsidiary",
    city: "Kuala Lumpur",
    address: "13A Wisma Mont Kiara, No 1 Jalan Kiara",
    role: "Malaysian subsidiary established as Southeast Asia regional base (2019 expansion). Supports Asia-Pacific freelancer and client operations.",
    since: 2019,
    source: "Workana press release (2019); Digital News Asia; Malaysian business registry",
  },
];

export function uniqueRegisteredCountryNames(entries: RegisteredCountry[] = registeredCountries): string[] {
  return [...new Set(entries.map((e) => e.country))];
}

export const feeStructure = {
  clients: {
    serviceFee: "4.5%",
    paymentProcessing: "Additional payment processing fee",
    summary: "Clients pay a 4.5% service fee plus payment processing fees on each transaction.",
  },
  freelancers: {
    summary: "Tiered commission per client relationship:",
    tiers: [
      { range: "First $300", rate: "20%" },
      { range: "$301 – $3,000", rate: "10%" },
      { range: "$3,000+", rate: "5%" },
    ],
  },
};

export const countryRankings: CountryRanking[] = [
  { rank: 1, country: "Brazil", share: 50.5, shareLabel: "49.2~51.8%", role: "Producer & hiring", region: "Americas" },
  { rank: 2, country: "Argentina", share: 9.3, shareLabel: "9.3%", role: "High-tier freelancers", region: "Americas" },
  { rank: 3, country: "Colombia", share: 8.7, shareLabel: "8.7%", role: "Growing hub", region: "Americas" },
  { rank: 4, country: "Mexico", share: 7.2, shareLabel: "7.2%", role: "Corporate clients", region: "Americas" },
  { rank: 5, country: "Venezuela", share: 3.7, shareLabel: "3.7%", role: "Content & design", region: "Americas" },
  { rank: 6, country: "Chile", share: 2.4, shareLabel: "~2.4%", role: "Stable LATAM market", region: "Americas" },
  { rank: 7, country: "Peru", share: 2.0, shareLabel: "~2.0%", role: "Growing freelancer base", region: "Americas" },
  { rank: 8, country: "Ecuador", share: 1.8, shareLabel: "~1.8%", role: "Design & development", region: "Americas" },
  { rank: 9, country: "Malaysia", share: 1.5, shareLabel: "1.5%", role: "Asia tech hub", region: "Asia" },
  { rank: 10, country: "Uruguay", share: 1.3, shareLabel: "~1.3%", role: "High-quality talent", region: "Americas" },
  { rank: 11, country: "United States", share: 1.2, shareLabel: "1.2%", role: "Buyer market", region: "Americas" },
  { rank: 12, country: "Indonesia", share: 0.9, shareLabel: "~0.9%", role: "UI/UX, mobile dev", region: "Asia" },
  { rank: 13, country: "Philippines", share: 0.8, shareLabel: "~0.8%", role: "VA & customer care", region: "Asia" },
  { rank: 14, country: "Spain", share: 0.7, shareLabel: "~0.7%", role: "Bilingual bridge", region: "Europe" },
  { rank: 15, country: "Germany", share: 0.6, shareLabel: "~0.6%", role: "Top corporate buyer", region: "Europe" },
  { rank: 16, country: "India", share: 0.5, shareLabel: "~0.5%", role: "IT outsourcing", region: "Asia" },
  { rank: 17, country: "Dominican Republic", share: 0.45, shareLabel: "~0.45%", role: "Caribbean hub", region: "Americas" },
  { rank: 18, country: "Paraguay", share: 0.4, shareLabel: "~0.4%", role: "Emerging talent pool", region: "Americas" },
  { rank: 19, country: "Costa Rica", share: 0.35, shareLabel: "~0.35%", role: "Nearshore clients", region: "Americas" },
  { rank: 20, country: "United Kingdom", share: 0.3, shareLabel: "~0.3%", role: "High-capital buyer", region: "Europe" },
];

/** Top countries by platform traffic share */
export const trafficShareTop15 = countryRankings.slice(0, 15);
export const trafficShareTop20 = countryRankings.slice(0, 20);

export const topNonAmericanCountries = [
  { rank: 1, country: "Malaysia", note: "Asia ops hub" },
  { rank: 2, country: "Indonesia", note: "UI/UX, mobile dev" },
  { rank: 3, country: "Philippines", note: "VA, customer care" },
  { rank: 4, country: "Germany", note: "Top corporate buyer" },
  { rank: 5, country: "Spain", note: "Bilingual bridge" },
  { rank: 6, country: "Netherlands", note: "E-commerce hiring" },
  { rank: 7, country: "Italy", note: "Creative & translation" },
  { rank: 8, country: "Portugal", note: "Brazilian talent access" },
  { rank: 9, country: "United Kingdom", note: "High-capital buyer" },
  { rank: 10, country: "China", note: "Manufacturing sourcing" },
];

export const regionalDistribution = [
  { region: "Americas", share: 85, color: "#7246E5" },
  { region: "Asia", share: 12, color: "#BEA5FF" },
  { region: "Europe", share: 3, color: "#DED2FF" },
];

export const regionRoles = {
  americas: {
    label: "Americas (Preferred — #1 Priority)",
    countries: [
      { country: "Brazil", role: "Core freelancer base" },
      { country: "Argentina", role: "Core freelancer base" },
      { country: "Mexico", role: "Core freelancer base" },
      { country: "Colombia", role: "Core freelancer base" },
      { country: "USA", role: "Premium client market" },
    ],
  },
  asia: {
    label: "Asia (Secondary Growth)",
    countries: [
      { country: "Malaysia", role: "Regional HQ" },
      { country: "Indonesia", role: "Talent providers" },
      { country: "Philippines", role: "Talent providers" },
      { country: "Singapore", role: "Enterprise client market" },
      { country: "Japan", role: "Niche translation/localization" },
      { country: "China", role: "Supply chain & manufacturing" },
    ],
  },
  europe: {
    label: "Europe (Buyer Market — Lowest Priority for Freelancers)",
    countries: [
      { country: "Germany", role: "High-budget clients" },
      { country: "Netherlands", role: "High-budget clients" },
      { country: "United Kingdom", role: "High-budget clients" },
      { country: "Spain", role: "Linguistic/cultural bridges" },
      { country: "Portugal", role: "Linguistic/cultural bridges" },
      { country: "Italy", role: "Linguistic/cultural bridges" },
    ],
  },
};

export const specialMarketNotes: Record<string, string> = {
  Singapore: "Regional enterprise client market — not a freelancer pool.",
  Japan: "Only viable for translation and transcription projects.",
  China: "PCB design, factory auditing, e-commerce localization.",
  Italy: "Only Western European country with occasional native freelancers (dual citizenship with Argentina/Brazil).",
};

export const skillEqualization = {
  title: "Freelancer Skill Levels Equalized Globally",
  reasons: [
    "Standardized global education (GitHub portfolios, AWS certifications)",
    "Universal tools (Figma, VS Code, Google Analytics)",
    "Digital vetting through star ratings and portfolio reviews",
    "Remote work alignment — location matters less than deliverables",
  ],
  summary:
    "Asia, Europe, and US freelancers compete on equal footing because skills are verified digitally, not geographically.",
};

export const countryProjects: CountryProject[] = [
  { country: "Brazil", region: "Americas", role: "Both", projectTypes: ["Web dev", "Mobile apps", "E-commerce"], specialization: "Largest producer & hiring market (50%+ traffic)", priority: "primary" },
  { country: "Argentina", region: "Americas", role: "Producer", projectTypes: ["Software", "Design", "Marketing"], specialization: "High-tier technical freelancers", priority: "primary" },
  { country: "Colombia", region: "Americas", role: "Producer", projectTypes: ["Development", "Customer support", "Design"], specialization: "Fast-growing LATAM hub", priority: "primary" },
  { country: "Mexico", region: "Americas", role: "Both", projectTypes: ["Corporate IT", "Bilingual projects", "Marketing"], specialization: "Corporate client base + talent", priority: "primary" },
  { country: "Venezuela", region: "Americas", role: "Producer", projectTypes: ["Content writing", "Graphic design", "Social media"], specialization: "Content & design specialists", priority: "primary" },
  { country: "USA", region: "Americas", role: "Client", projectTypes: ["Enterprise software", "Consulting", "Product design"], specialization: "Premium buyer market (1.2% traffic)", priority: "buyer" },
  { country: "Malaysia", region: "Asia", role: "Both", projectTypes: ["Tech outsourcing", "Mobile dev", "QA"], specialization: "Asia regional HQ & tech hub", priority: "secondary" },
  { country: "Indonesia", region: "Asia", role: "Producer", projectTypes: ["UI/UX", "Mobile development", "WordPress"], specialization: "Design-forward talent pool", priority: "secondary" },
  { country: "Philippines", region: "Asia", role: "Producer", projectTypes: ["Virtual assistance", "Customer care", "Data entry"], specialization: "English-speaking support talent", priority: "secondary" },
  { country: "Singapore", region: "Asia", role: "Client", projectTypes: ["Enterprise apps", "FinTech", "Consulting"], specialization: "Enterprise client — not freelancer pool", priority: "buyer" },
  { country: "Japan", region: "Asia", role: "Client", projectTypes: ["Translation", "Transcription", "Localization"], specialization: "Niche translation market only", priority: "buyer" },
  { country: "China", region: "Asia", role: "Both", projectTypes: ["PCB design", "Factory auditing", "E-commerce localization"], specialization: "Manufacturing & sourcing", priority: "secondary" },
  { country: "Germany", region: "Europe", role: "Client", projectTypes: ["Enterprise software", "Engineering", "Consulting"], specialization: "Top corporate buyer in Europe", priority: "buyer" },
  { country: "Netherlands", region: "Europe", role: "Client", projectTypes: ["E-commerce", "SaaS", "Web platforms"], specialization: "E-commerce hiring hub", priority: "buyer" },
  { country: "United Kingdom", region: "Europe", role: "Client", projectTypes: ["FinTech", "Product", "Marketing"], specialization: "High-capital buyer market", priority: "buyer" },
  { country: "Spain", region: "Europe", role: "Both", projectTypes: ["Translation", "Web dev", "Marketing"], specialization: "Bilingual bridge LATAM ↔ Europe", priority: "buyer" },
  { country: "Portugal", region: "Europe", role: "Client", projectTypes: ["Localization", "Design", "Support"], specialization: "Gateway to Brazilian talent", priority: "buyer" },
  { country: "Italy", region: "Europe", role: "Both", projectTypes: ["Creative", "Translation", "Design"], specialization: "Occasional native freelancers via dual citizenship", priority: "buyer" },
];

export const competitors: CompetitorComparison[] = [
  {
    name: "Workana",
    focus: "Latin America & Spanish/Portuguese markets",
    fees: "4.5% client + tiered 20/10/5% freelancer",
    strength: "LATAM dominance, escrow payments, local languages",
    weakness: "Smaller global brand vs Upwork",
  },
  {
    name: "Upwork",
    focus: "Global generalist marketplace",
    fees: "5–20% sliding freelancer fee",
    strength: "Massive client base, enterprise tools",
    weakness: "Race to bottom pricing, high competition",
  },
  {
    name: "Fiverr",
    focus: "Gig-based micro-services",
    fees: "20% flat freelancer fee",
    strength: "Simple gig packaging, fast turnaround",
    weakness: "Low average project value",
  },
  {
    name: "Freelancer.com",
    focus: "Global contests & projects",
    fees: "10% or $5 minimum (whichever is greater)",
    strength: "Contest model, wide category range",
    weakness: "Quality inconsistency, spam bids",
  },
];

export const aiHelperQuestions: AiQuestion[] = [
  {
    question: "Which country has the most freelancers on Workana?",
    answer:
      "Brazil dominates with 49.2~51.8% of platform traffic — it is both the largest producer of freelancers and a major hiring market. Argentina (9.3%) and Colombia (8.7%) follow as high-quality LATAM talent hubs.",
  },
  {
    question: "How do I price myself against Brazilian freelancers?",
    answer:
      "Brazilian freelancers set the market floor due to volume. Compete on specialization (AI, niche stacks, English fluency) rather than undercutting. Argentina and Colombia freelancers often charge 15–30% more for equivalent senior roles. Highlight portfolio quality and communication speed.",
  },
  {
    question: "Can I target German clients as an Asian developer?",
    answer:
      "Yes. Skill levels are equalized globally through digital vetting, certifications, and portfolios. Germany is a high-budget buyer market (~top corporate buyer outside the Americas). Focus on English/German communication, timezone overlap, and enterprise case studies.",
  },
  {
    question: "What are the fees for freelancers?",
    answer:
      "Workana uses tiered fees per client: 20% on the first $300 earned, 10% on $301–$3,000, and 5% on earnings above $3,000. Long-term client relationships become significantly cheaper over time.",
  },
  {
    question: "How does Workana compare to Upwork?",
    answer:
      "Workana owns Latin America with Spanish/Portuguese support and escrow-first payments. Upwork has a larger global client pool but higher competition and sliding fees up to 20%. Workana is ideal for LATAM freelancers; Upwork for broad international reach.",
  },
  {
    question: "In which countries is Workana legally registered?",
    answer:
      "Workana LLC is incorporated in Delaware, USA (legal parent). Registered offices and subsidiaries operate in the United States (New York notices), Argentina (operational HQ, Buenos Aires), Brazil (São Paulo), Ireland (Dublin — Europe/international), and Malaysia (Workana Sdn Bhd, Kuala Lumpur — Asia).",
  },
  {
    question: "How many countries have active freelancers and clients on Workana?",
    answer:
      "Workana supports active freelancers and clients in 124 countries across the Americas, Europe, Africa, Asia, Middle East, and Oceania. The largest markets are Brazil, Argentina, Colombia, and Mexico.",
  },
];

export const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/analytics", label: "Analytics" },
  { href: "/feed", label: "Live Feed" },
  { href: "/ai-helper", label: "AI Helper" },
];
