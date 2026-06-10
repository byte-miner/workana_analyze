import { NextRequest, NextResponse } from "next/server";
import { getJobsPaginated, getRecentJobs } from "@/lib/db";
import { isValidBudgetFilter } from "@/lib/budgetFilters";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const since = searchParams.get("since") || undefined;

  if (since) {
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const jobs = getRecentJobs(limit, since);
    return NextResponse.json({ jobs, count: jobs.length });
  }

  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
  const budgetParam = searchParams.get("budget");
  const budgetFilter = isValidBudgetFilter(budgetParam) ? budgetParam : "all";
  const result = getJobsPaginated(page, pageSize, budgetFilter);

  return NextResponse.json(result);
}
