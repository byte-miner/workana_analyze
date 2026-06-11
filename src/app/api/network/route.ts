import { NextResponse } from "next/server";
import { selectNetworkRoute, routeLabel, getProxyMode } from "@/lib/network";
import { buildProxyUrl } from "@/lib/proxyConfig";
import { getEffectiveSettings } from "@/lib/runtimeSettings.server";
import type { NetworkConfig } from "@/lib/settingsTypes";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function toNetworkConfig(settings: Awaited<ReturnType<typeof getEffectiveSettings>>): NetworkConfig {
  return {
    proxyType: settings.proxyType,
    proxyHost: settings.proxyHost,
    proxyPort: settings.proxyPort,
    proxyUsername: settings.proxyUsername,
    proxyPassword: settings.proxyPassword,
    workanaProxy: settings.workanaProxy,
    workanaProxyMode: settings.workanaProxyMode,
  };
}

export async function GET() {
  const settings = await getEffectiveSettings();
  const config = toNetworkConfig(settings);

  try {
    const route = await selectNetworkRoute(config);
    return NextResponse.json({
      route,
      label: routeLabel(route, config),
      mode: getProxyMode(config),
      proxyConfigured: Boolean(buildProxyUrl(config)),
      proxyType: settings.proxyType,
    });
  } catch (err) {
    return NextResponse.json(
      {
        route: null,
        error: err instanceof Error ? err.message : "Network probe failed",
        mode: getProxyMode(config),
        proxyConfigured: Boolean(buildProxyUrl(config)),
        proxyType: settings.proxyType,
      },
      { status: 503 }
    );
  }
}
