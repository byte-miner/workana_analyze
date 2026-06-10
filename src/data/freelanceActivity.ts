import { platformRegionCounts } from "./workanaActiveCountries";

/** Relative freelance activity index (0–100) by continent — research estimate from traffic, country tiers, and platform presence */
export interface ContinentActivity {
  continent: string;
  freelancerActivity: number;
  clientActivity: number;
  platformTrafficShare: number;
  activeCountries: number;
  summary: string;
}

export const continentFreelanceActivity: ContinentActivity[] = [
  {
    continent: "Americas",
    freelancerActivity: 95,
    clientActivity: 90,
    platformTrafficShare: 85,
    activeCountries: platformRegionCounts.find((r) => r.region === "Americas")?.count ?? 0,
    summary: "Dominant continent — Brazil alone accounts for ~50% of platform traffic. Argentina, Colombia, and Mexico form the core talent and hiring triangle.",
  },
  {
    continent: "Asia",
    freelancerActivity: 48,
    clientActivity: 22,
    platformTrafficShare: 12,
    activeCountries: platformRegionCounts.find((r) => r.region === "Asia")?.count ?? 0,
    summary: "Strong freelancer supply (Malaysia, Indonesia, Philippines, India) with growing but smaller client demand. Malaysia hosts Workana's regional HQ.",
  },
  {
    continent: "Europe",
    freelancerActivity: 18,
    clientActivity: 35,
    platformTrafficShare: 3,
    activeCountries: platformRegionCounts.find((r) => r.region === "Europe")?.count ?? 0,
    summary: "Primarily a buyer market — Germany, Netherlands, UK, and Spain hire LATAM/Asian talent. Few native European freelancers.",
  },
  {
    continent: "Middle East",
    freelancerActivity: 12,
    clientActivity: 14,
    platformTrafficShare: 0.5,
    activeCountries: platformRegionCounts.find((r) => r.region === "Middle East")?.count ?? 0,
    summary: "Emerging client interest for bilingual web and e-commerce projects; freelancer supply is limited.",
  },
  {
    continent: "Africa",
    freelancerActivity: 15,
    clientActivity: 8,
    platformTrafficShare: 0.3,
    activeCountries: platformRegionCounts.find((r) => r.region === "Africa")?.count ?? 0,
    summary: "Growing freelancer participation (South Africa, Nigeria, Kenya) — mostly English-language support and dev roles.",
  },
  {
    continent: "Oceania",
    freelancerActivity: 10,
    clientActivity: 12,
    platformTrafficShare: 0.2,
    activeCountries: platformRegionCounts.find((r) => r.region === "Oceania")?.count ?? 0,
    summary: "Australia and New Zealand act as client markets hiring offshore LATAM talent.",
  },
];


export interface CountryActivityEntry {
  country: string;
  rank: number;
  activityScore: number;
  role: "Supply" | "Demand" | "Both";
  note: string;
}

export const topSupplyCountries: CountryActivityEntry[] = [
  { country: "Brazil", rank: 1, activityScore: 95, role: "Both", note: "Largest freelancer pool & hiring market (~50% traffic)" },
  { country: "Argentina", rank: 2, activityScore: 88, role: "Supply", note: "High-tier developers, designers, and marketers" },
  { country: "Colombia", rank: 3, activityScore: 82, role: "Supply", note: "Fast-growing dev and support hub" },
  { country: "Venezuela", rank: 4, activityScore: 75, role: "Supply", note: "Content, design, and VA specialists" },
  { country: "Mexico", rank: 5, activityScore: 72, role: "Both", note: "Bilingual talent + corporate clients" },
  { country: "Indonesia", rank: 6, activityScore: 65, role: "Supply", note: "UI/UX and WordPress specialists" },
  { country: "Philippines", rank: 7, activityScore: 63, role: "Supply", note: "Virtual assistance and customer care" },
  { country: "Malaysia", rank: 8, activityScore: 58, role: "Both", note: "Asia tech hub — Workana Sdn Bhd HQ" },
  { country: "Chile", rank: 9, activityScore: 52, role: "Supply", note: "Stable LATAM market with senior talent" },
  { country: "India", rank: 10, activityScore: 48, role: "Supply", note: "IT outsourcing and automation" },
];

export const topDemandCountries: CountryActivityEntry[] = [
  { country: "Brazil", rank: 1, activityScore: 92, role: "Both", note: "Companies hire locally and offshore within LATAM" },
  { country: "Mexico", rank: 2, activityScore: 78, role: "Both", note: "Corporate IT and bilingual project demand" },
  { country: "Argentina", rank: 3, activityScore: 70, role: "Both", note: "Startups and agencies outsource design/dev" },
  { country: "Colombia", rank: 4, activityScore: 68, role: "Both", note: "Growing SMB digitization wave" },
  { country: "United States", rank: 5, activityScore: 62, role: "Demand", note: "Premium buyer market (1.2% traffic)" },
  { country: "Germany", rank: 6, activityScore: 55, role: "Demand", note: "Top corporate buyer in Europe" },
  { country: "Spain", rank: 7, activityScore: 48, role: "Both", note: "Bilingual bridge between LATAM and EU" },
  { country: "Netherlands", rank: 8, activityScore: 45, role: "Demand", note: "E-commerce and SaaS hiring" },
  { country: "United Kingdom", rank: 9, activityScore: 42, role: "Demand", note: "High-capital buyer market" },
  { country: "Chile", rank: 10, activityScore: 38, role: "Both", note: "Stable nearshore client base" },
];

export const freelanceActivitySummary = {
  headline: "Americas lead globally — Brazil dominates both supply and demand",
  body: "Roughly 85% of Workana platform traffic originates from the Americas, with Brazil accounting for approximately half of all activity. Argentina, Colombia, and Mexico complete the core LATAM ecosystem. Asia contributes the second-largest freelancer supply (especially Malaysia, Indonesia, and the Philippines), while Europe functions primarily as a high-budget client market.",
  source: "Estimated from platform traffic share, 124-country active registry, and market tier analysis",
};
