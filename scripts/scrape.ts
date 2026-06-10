import { config } from "dotenv";
import path from "path";

config({ path: path.join(process.cwd(), ".env.local") });

async function main() {
  const { configureLocalBypass } = await import("../src/lib/network");
  configureLocalBypass();

  const { runScraper } = await import("../src/lib/scraper");
  console.log("Starting Workana IT programming scrape (all languages)...");
  const result = await runScraper({ enrichCountry: true });
  console.log("\nScrape complete:");
  console.log(`  New jobs:     ${result.newJobs}`);
  console.log(`  Updated jobs: ${result.updatedJobs}`);
  console.log(`  Total scraped: ${result.totalScraped}`);
  console.log(`  Pages scraped: ${result.pagesScraped}`);
  if (result.errors.length) {
    console.log(`  Errors (${result.errors.length}):`);
    result.errors.slice(0, 5).forEach((e) => console.log(`    - ${e}`));
  }
}

main().catch((err) => {
  console.error("Scrape failed:", err);
  process.exit(1);
});
