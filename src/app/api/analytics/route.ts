import { NextResponse } from "next/server";
import { computeAnalytics } from "@/lib/analyzer";
import { getEffectiveSettings } from "@/lib/runtimeSettings.server";

export const dynamic = "force-dynamic";

export async function GET() {
  const settings = await getEffectiveSettings();
  const analytics = await computeAnalytics(settings.openaiApiKey);
  return NextResponse.json(analytics);
}
