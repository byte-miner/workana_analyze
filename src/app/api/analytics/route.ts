import { NextResponse } from "next/server";
import { computeAnalytics } from "@/lib/analyzer";

export const dynamic = "force-dynamic";

export async function GET() {
  const analytics = await computeAnalytics();
  return NextResponse.json(analytics);
}
