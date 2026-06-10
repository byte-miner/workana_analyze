export type ProxyMode = "auto" | "always" | "never";

export const SETTINGS_COOKIE = {
  session: "wa_session",
  proxy: "wa_proxy",
  proxyMode: "wa_proxy_mode",
  openai: "wa_openai",
} as const;

export const CLIENT_SETTINGS_KEY = "workana-app-settings";

export interface RuntimeSettings {
  workanaSession: string;
  workanaProxy: string;
  workanaProxyMode: ProxyMode;
  openaiApiKey: string;
}

export interface RuntimeSettingsInput {
  workanaSession?: string;
  workanaProxy?: string;
  workanaProxyMode?: ProxyMode;
  openaiApiKey?: string;
}

export interface RuntimeSettingsStatus {
  configured: {
    session: boolean;
    proxy: boolean;
    openai: boolean;
  };
  proxyMode: ProxyMode;
  sessionPreview: string | null;
  proxyPreview: string | null;
  openaiPreview: string | null;
}

export function normalizeProxyMode(value: string | undefined): ProxyMode {
  const mode = (value || "auto").toLowerCase();
  if (mode === "always" || mode === "never") return mode;
  return "auto";
}

export function maskSecret(value: string, visible = 4): string | null {
  if (!value) return null;
  if (value.length <= visible) return "••••";
  return `${"•".repeat(Math.min(8, value.length - visible))}${value.slice(-visible)}`;
}

export function mergeRuntimeSettings(
  overrides?: Partial<RuntimeSettings>
): RuntimeSettings {
  return {
    workanaSession:
      overrides?.workanaSession?.trim() ||
      process.env.WORKANA_SESSION?.trim() ||
      "",
    workanaProxy:
      overrides?.workanaProxy?.trim() || process.env.WORKANA_PROXY?.trim() || "",
    workanaProxyMode: normalizeProxyMode(
      overrides?.workanaProxyMode || process.env.WORKANA_PROXY_MODE
    ),
    openaiApiKey:
      overrides?.openaiApiKey?.trim() || process.env.OPENAI_API_KEY?.trim() || "",
  };
}

export function buildSettingsStatus(settings: RuntimeSettings): RuntimeSettingsStatus {
  return {
    configured: {
      session: Boolean(settings.workanaSession),
      proxy: Boolean(settings.workanaProxy),
      openai: Boolean(settings.openaiApiKey),
    },
    proxyMode: settings.workanaProxyMode,
    sessionPreview: maskSecret(settings.workanaSession),
    proxyPreview: settings.workanaProxy
      ? settings.workanaProxy.replace(/:([^:@/]+)$/, ":••••")
      : null,
    openaiPreview: maskSecret(settings.openaiApiKey),
  };
}

export const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

export function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  };
}
