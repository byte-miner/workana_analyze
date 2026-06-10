import { buildCountryIsoMap } from "@/data/workanaActiveCountries";

/** ISO 3166-1 alpha-2 codes — synced with Workana active platform countries */
export const countryIsoCodes: Record<string, string> = buildCountryIsoMap();

export function getCountryCode(country: string): string | undefined {
  return countryIsoCodes[country];
}
