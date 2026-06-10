import { NextResponse } from "next/server";
import { getEffectiveSettings } from "@/lib/runtimeSettings.server";
import {
  buildSettingsStatus,
  cookieOptions,
  mergeRuntimeSettings,
  SETTINGS_COOKIE,
  type ProxyMode,
  type RuntimeSettingsInput,
} from "@/lib/settingsTypes";

export const dynamic = "force-dynamic";

function parseBody(body: unknown): RuntimeSettingsInput {
  if (!body || typeof body !== "object") return {};
  const data = body as Record<string, unknown>;
  const proxyMode = data.workanaProxyMode;
  return {
    workanaSession:
      typeof data.workanaSession === "string" ? data.workanaSession : undefined,
    workanaProxy:
      typeof data.workanaProxy === "string" ? data.workanaProxy : undefined,
    workanaProxyMode:
      proxyMode === "auto" || proxyMode === "always" || proxyMode === "never"
        ? proxyMode
        : undefined,
    openaiApiKey:
      typeof data.openaiApiKey === "string" ? data.openaiApiKey : undefined,
  };
}

export async function GET() {
  const settings = await getEffectiveSettings();
  return NextResponse.json(buildSettingsStatus(settings));
}

export async function POST(request: Request) {
  try {
    const input = parseBody(await request.json());
    const current = await getEffectiveSettings();
    const next = mergeRuntimeSettings({
      workanaSession:
        input.workanaSession !== undefined
          ? input.workanaSession.trim()
          : current.workanaSession,
      workanaProxy:
        input.workanaProxy !== undefined
          ? input.workanaProxy.trim()
          : current.workanaProxy,
      workanaProxyMode:
        input.workanaProxyMode !== undefined
          ? input.workanaProxyMode
          : current.workanaProxyMode,
      openaiApiKey:
        input.openaiApiKey !== undefined
          ? input.openaiApiKey.trim()
          : current.openaiApiKey,
    });

    const response = NextResponse.json({
      ok: true,
      ...buildSettingsStatus(next),
    });

    const opts = cookieOptions();
    response.cookies.set(SETTINGS_COOKIE.session, next.workanaSession, opts);
    response.cookies.set(SETTINGS_COOKIE.proxy, next.workanaProxy, opts);
    response.cookies.set(
      SETTINGS_COOKIE.proxyMode,
      next.workanaProxyMode as ProxyMode,
      opts
    );
    response.cookies.set(SETTINGS_COOKIE.openai, next.openaiApiKey, opts);

    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to save settings";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
