import { NextResponse } from "next/server";
import { getEffectiveSettings } from "@/lib/runtimeSettings.server";
import {
  buildSettingsStatus,
  cookieOptions,
  mergeRuntimeSettings,
  normalizeProxyType,
  SETTINGS_COOKIE,
  type ProxyMode,
  type RuntimeSettingsInput,
} from "@/lib/settingsTypes";

export const dynamic = "force-dynamic";

function parseBody(body: unknown): RuntimeSettingsInput {
  if (!body || typeof body !== "object") return {};
  const data = body as Record<string, unknown>;
  const proxyMode = data.workanaProxyMode;
  const proxyType = data.proxyType;

  return {
    workanaSession:
      typeof data.workanaSession === "string" ? data.workanaSession : undefined,
    workanaEmail:
      typeof data.workanaEmail === "string" ? data.workanaEmail : undefined,
    workanaPassword:
      typeof data.workanaPassword === "string" ? data.workanaPassword : undefined,
    proxyType:
      proxyType === "ssh" ||
      proxyType === "https" ||
      proxyType === "http" ||
      proxyType === "socks5"
        ? proxyType
        : undefined,
    proxyHost: typeof data.proxyHost === "string" ? data.proxyHost : undefined,
    proxyPort: typeof data.proxyPort === "string" ? data.proxyPort : undefined,
    proxyUsername:
      typeof data.proxyUsername === "string" ? data.proxyUsername : undefined,
    proxyPassword:
      typeof data.proxyPassword === "string" ? data.proxyPassword : undefined,
    workanaProxyMode:
      proxyMode === "auto" || proxyMode === "always" || proxyMode === "never"
        ? proxyMode
        : undefined,
    openaiApiKey:
      typeof data.openaiApiKey === "string" ? data.openaiApiKey : undefined,
  };
}

function assignField<T extends string>(
  input: T | undefined,
  current: T,
  trim = true
): T {
  if (input === undefined) return current;
  return (trim ? input.trim() : input) as T;
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
      workanaSession: assignField(input.workanaSession, current.workanaSession),
      workanaEmail: assignField(input.workanaEmail, current.workanaEmail),
      workanaPassword: assignField(input.workanaPassword, current.workanaPassword),
      proxyType:
        input.proxyType !== undefined
          ? normalizeProxyType(input.proxyType)
          : current.proxyType,
      proxyHost: assignField(input.proxyHost, current.proxyHost),
      proxyPort: assignField(input.proxyPort, current.proxyPort),
      proxyUsername: assignField(input.proxyUsername, current.proxyUsername),
      proxyPassword: assignField(input.proxyPassword, current.proxyPassword),
      workanaProxyMode:
        input.workanaProxyMode !== undefined
          ? input.workanaProxyMode
          : current.workanaProxyMode,
      openaiApiKey: assignField(input.openaiApiKey, current.openaiApiKey),
    });

    const response = NextResponse.json({
      ok: true,
      ...buildSettingsStatus(next),
    });

    const opts = cookieOptions();
    response.cookies.set(SETTINGS_COOKIE.session, next.workanaSession, opts);
    response.cookies.set(SETTINGS_COOKIE.email, next.workanaEmail, opts);
    response.cookies.set(SETTINGS_COOKIE.password, next.workanaPassword, opts);
    response.cookies.set(SETTINGS_COOKIE.proxyType, next.proxyType, opts);
    response.cookies.set(SETTINGS_COOKIE.proxyHost, next.proxyHost, opts);
    response.cookies.set(SETTINGS_COOKIE.proxyPort, next.proxyPort, opts);
    response.cookies.set(SETTINGS_COOKIE.proxyUser, next.proxyUsername, opts);
    response.cookies.set(SETTINGS_COOKIE.proxyPass, next.proxyPassword, opts);
    response.cookies.set(
      SETTINGS_COOKIE.proxyMode,
      next.workanaProxyMode as ProxyMode,
      opts
    );
    response.cookies.set(SETTINGS_COOKIE.openai, next.openaiApiKey, opts);
    response.cookies.set(SETTINGS_COOKIE.proxyLegacy, "", { ...opts, maxAge: 0 });

    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to save settings";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
