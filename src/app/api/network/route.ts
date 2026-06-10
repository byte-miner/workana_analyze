import { NextResponse } from "next/server";
import { selectNetworkRoute, routeLabel, getProxyMode, buildProxyUrl } from "@/lib/network";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET() {
  try {
    const route = await selectNetworkRoute();
    return NextResponse.json({
      route,
      label: routeLabel(route),
      mode: getProxyMode(),
      proxyConfigured: Boolean(buildProxyUrl()),
    });
  } catch (err) {
    return NextResponse.json(
      {
        route: null,
        error: err instanceof Error ? err.message : "Network probe failed",
        mode: getProxyMode(),
        proxyConfigured: Boolean(buildProxyUrl()),
      },
      { status: 503 }
    );
  }
}
