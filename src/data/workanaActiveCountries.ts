/** Countries where freelancers and clients can actively use Workana (platform country filters) */
export type PlatformRegion =
  | "Americas"
  | "Europe"
  | "Africa"
  | "Asia"
  | "Middle East"
  | "Oceania";

export type ActivityTier = "primary" | "major" | "active";
export type PlatformUserRole = "Both" | "Producer" | "Client";

export interface ActivePlatformCountry {
  country: string;
  code: string;
  region: PlatformRegion;
  /** Whether freelancers actively register and work from this country */
  freelancers: boolean;
  /** Whether clients actively hire from this country */
  clients: boolean;
  tier: ActivityTier;
  role: PlatformUserRole;
  note?: string;
}

/** ISO + region registry — Workana job/freelancer country filters + verified MY/SG */
const RAW: Array<[string, string, PlatformRegion]> = [
  // Americas
  ["United States", "US", "Americas"],
  ["Canada", "CA", "Americas"],
  ["Bermuda", "BM", "Americas"],
  ["Greenland", "GL", "Americas"],
  ["Mexico", "MX", "Americas"],
  ["Argentina", "AR", "Americas"],
  ["Brazil", "BR", "Americas"],
  ["Chile", "CL", "Americas"],
  ["Colombia", "CO", "Americas"],
  ["Ecuador", "EC", "Americas"],
  ["Peru", "PE", "Americas"],
  ["Bolivia", "BO", "Americas"],
  ["Paraguay", "PY", "Americas"],
  ["Uruguay", "UY", "Americas"],
  ["Venezuela", "VE", "Americas"],
  ["Panama", "PA", "Americas"],
  ["Costa Rica", "CR", "Americas"],
  ["Dominican Republic", "DO", "Americas"],
  ["Guatemala", "GT", "Americas"],
  ["Honduras", "HN", "Americas"],
  ["El Salvador", "SV", "Americas"],
  ["Nicaragua", "NI", "Americas"],
  ["Belize", "BZ", "Americas"],
  ["Jamaica", "JM", "Americas"],
  ["Trinidad and Tobago", "TT", "Americas"],
  ["Barbados", "BB", "Americas"],
  ["Haiti", "HT", "Americas"],
  ["Cuba", "CU", "Americas"],
  // Europe
  ["United Kingdom", "GB", "Europe"],
  ["France", "FR", "Europe"],
  ["Germany", "DE", "Europe"],
  ["Spain", "ES", "Europe"],
  ["Portugal", "PT", "Europe"],
  ["Italy", "IT", "Europe"],
  ["Netherlands", "NL", "Europe"],
  ["Belgium", "BE", "Europe"],
  ["Switzerland", "CH", "Europe"],
  ["Sweden", "SE", "Europe"],
  ["Norway", "NO", "Europe"],
  ["Poland", "PL", "Europe"],
  ["Romania", "RO", "Europe"],
  ["Ukraine", "UA", "Europe"],
  ["Ireland", "IE", "Europe"],
  ["Austria", "AT", "Europe"],
  ["Czech Republic", "CZ", "Europe"],
  ["Slovakia", "SK", "Europe"],
  ["Hungary", "HU", "Europe"],
  ["Bulgaria", "BG", "Europe"],
  ["Greece", "GR", "Europe"],
  ["Finland", "FI", "Europe"],
  ["Denmark", "DK", "Europe"],
  ["Iceland", "IS", "Europe"],
  ["Luxembourg", "LU", "Europe"],
  ["Malta", "MT", "Europe"],
  ["Estonia", "EE", "Europe"],
  ["Latvia", "LV", "Europe"],
  ["Lithuania", "LT", "Europe"],
  ["Croatia", "HR", "Europe"],
  ["Slovenia", "SI", "Europe"],
  ["Serbia", "RS", "Europe"],
  ["Bosnia and Herzegovina", "BA", "Europe"],
  ["North Macedonia", "MK", "Europe"],
  ["Albania", "AL", "Europe"],
  ["Montenegro", "ME", "Europe"],
  // Africa
  ["South Africa", "ZA", "Africa"],
  ["Morocco", "MA", "Africa"],
  ["Egypt", "EG", "Africa"],
  ["Tunisia", "TN", "Africa"],
  ["Algeria", "DZ", "Africa"],
  ["Nigeria", "NG", "Africa"],
  ["Kenya", "KE", "Africa"],
  ["Ghana", "GH", "Africa"],
  ["Senegal", "SN", "Africa"],
  ["Ethiopia", "ET", "Africa"],
  ["Tanzania", "TZ", "Africa"],
  ["Uganda", "UG", "Africa"],
  ["Rwanda", "RW", "Africa"],
  ["Cameroon", "CM", "Africa"],
  ["Ivory Coast", "CI", "Africa"],
  ["Benin", "BJ", "Africa"],
  ["Togo", "TG", "Africa"],
  ["Burkina Faso", "BF", "Africa"],
  ["Mali", "ML", "Africa"],
  ["Niger", "NE", "Africa"],
  ["Zimbabwe", "ZW", "Africa"],
  ["Zambia", "ZM", "Africa"],
  ["Namibia", "NA", "Africa"],
  ["Botswana", "BW", "Africa"],
  // Asia
  ["India", "IN", "Asia"],
  ["China", "CN", "Asia"],
  ["Pakistan", "PK", "Asia"],
  ["Bangladesh", "BD", "Asia"],
  ["Sri Lanka", "LK", "Asia"],
  ["Philippines", "PH", "Asia"],
  ["Indonesia", "ID", "Asia"],
  ["Vietnam", "VN", "Asia"],
  ["Thailand", "TH", "Asia"],
  ["Japan", "JP", "Asia"],
  ["Malaysia", "MY", "Asia"],
  ["Singapore", "SG", "Asia"],
  ["Nepal", "NP", "Asia"],
  ["Myanmar", "MM", "Asia"],
  ["Cambodia", "KH", "Asia"],
  ["Laos", "LA", "Asia"],
  ["Mongolia", "MN", "Asia"],
  ["Kazakhstan", "KZ", "Asia"],
  ["Uzbekistan", "UZ", "Asia"],
  ["Azerbaijan", "AZ", "Asia"],
  ["Armenia", "AM", "Asia"],
  ["Georgia", "GE", "Asia"],
  // Middle East
  ["Jordan", "JO", "Middle East"],
  ["Lebanon", "LB", "Middle East"],
  ["Oman", "OM", "Middle East"],
  ["Kuwait", "KW", "Middle East"],
  ["United Arab Emirates", "AE", "Middle East"],
  ["Saudi Arabia", "SA", "Middle East"],
  ["Qatar", "QA", "Middle East"],
  ["Turkey", "TR", "Middle East"],
  // Oceania
  ["Australia", "AU", "Oceania"],
  ["New Zealand", "NZ", "Oceania"],
  ["Fiji", "FJ", "Oceania"],
  ["Papua New Guinea", "PG", "Oceania"],
  ["Samoa", "WS", "Oceania"],
];

const TIER_PRIMARY = new Set(["Brazil", "Argentina", "Colombia", "Mexico"]);
const TIER_MAJOR = new Set([
  "United States", "Venezuela", "Chile", "Peru", "Ecuador", "Uruguay",
  "Malaysia", "Singapore", "Philippines", "Indonesia", "India",
  "Germany", "Spain", "United Kingdom", "Portugal", "Italy", "Netherlands",
  "France", "Canada", "Dominican Republic", "Costa Rica", "Panama",
]);

const ROLE_MAP: Record<string, PlatformUserRole> = {
  Brazil: "Both", Argentina: "Producer", Colombia: "Producer", Mexico: "Both",
  Venezuela: "Producer", Chile: "Producer", Peru: "Producer", Ecuador: "Producer",
  "United States": "Client", USA: "Client", Canada: "Client",
  Malaysia: "Both", Singapore: "Client", Indonesia: "Producer", Philippines: "Producer",
  India: "Producer", China: "Both", Japan: "Client",
  Germany: "Client", Netherlands: "Client", "United Kingdom": "Client",
  Spain: "Both", Portugal: "Client", Italy: "Both", France: "Client",
  "United Arab Emirates": "Client", "Saudi Arabia": "Client", Australia: "Client",
};

const NOTES: Record<string, string> = {
  Brazil: "~50% of platform traffic — largest freelancer & client market",
  Argentina: "High-tier technical freelancers (~9.3% traffic)",
  Colombia: "Fast-growing LATAM hub (~8.7% traffic)",
  Mexico: "Strong corporate client base (~7.2% traffic)",
  Malaysia: "Southeast Asia regional base — Workana Sdn Bhd",
  Singapore: "Enterprise client market",
  Germany: "Top corporate buyer in Europe",
  "United States": "Premium buyer market (~1.2% traffic)",
};

function buildActiveCountries(): ActivePlatformCountry[] {
  return RAW.map(([country, code, region]) => {
    const role = ROLE_MAP[country] ?? "Both";
    const tier = TIER_PRIMARY.has(country)
      ? "primary"
      : TIER_MAJOR.has(country)
        ? "major"
        : "active";
    return {
      country,
      code,
      region,
      freelancers: role !== "Client",
      clients: role !== "Producer",
      tier,
      role,
      note: NOTES[country],
    };
  });
}

export const activePlatformCountries: ActivePlatformCountry[] = buildActiveCountries();

export const activePlatformCountryCount = activePlatformCountries.length;

export function getActiveCountriesByRegion(region?: PlatformRegion): ActivePlatformCountry[] {
  if (!region) return activePlatformCountries;
  return activePlatformCountries.filter((c) => c.region === region);
}

export function getActiveCountryByName(name: string): ActivePlatformCountry | undefined {
  return activePlatformCountries.find(
    (c) => c.country.toLowerCase() === name.toLowerCase() || c.code === name.toUpperCase()
  );
}

export const platformRegionCounts = (["Americas", "Europe", "Africa", "Asia", "Middle East", "Oceania"] as PlatformRegion[]).map(
  (region) => ({
    region,
    count: activePlatformCountries.filter((c) => c.region === region).length,
  })
);

/** Build ISO map for flags from active countries */
export function buildCountryIsoMap(): Record<string, string> {
  const map: Record<string, string> = { USA: "US" };
  for (const c of activePlatformCountries) {
    map[c.country] = c.code;
  }
  return map;
}
