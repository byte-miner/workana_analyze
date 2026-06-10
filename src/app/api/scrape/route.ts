import { after } from "next/server";
import { NextResponse } from "next/server";
import { runScraper, isScrapeRunning, getScrapeStatus } from "@/lib/scraper";
import { getIncrementalMaxPages } from "@/lib/config";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST() {
  if (isScrapeRunning()) {
    return NextResponse.json(
      { error: "Scrape already in progress" },
      { status: 409 }
    );
  }

  // Keep scrape alive after the HTTP response (Next.js would otherwise drop the task).
  after(async () => {
    try {
      await runScraper({ maxPages: getIncrementalMaxPages(), enrichCountry: false });
    } catch (err) {
      console.error("Background scrape failed:", err);
    }
  });

  return NextResponse.json({
    message: "Scrape started",
    status: "running",
  });
}

export async function GET() {
  return NextResponse.json({
    running: isScrapeRunning(),
    ...getScrapeStatus(),
  });
}
