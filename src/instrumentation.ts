export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { configureLocalBypass } = await import("./lib/network");
    configureLocalBypass();

    if (process.env.SCRAPE_AUTO === "true") {
      const intervalMin = parseInt(process.env.SCRAPE_AUTO_INTERVAL_MIN || "30", 10);
      const { runScraper, isScrapeRunning } = await import("./lib/scraper");
      const { getIncrementalMaxPages } = await import("./lib/config");

      setInterval(() => {
        if (isScrapeRunning()) return;
        runScraper({ maxPages: getIncrementalMaxPages(), enrichCountry: false }).catch(
          console.error
        );
      }, Math.max(intervalMin, 10) * 60_000);
    }
  }
}
