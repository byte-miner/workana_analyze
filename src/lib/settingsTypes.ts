export type ProxyMode = "auto" | "always" | "never";
export type ProxyType = "ssh" | "https" | "http" | "socks5";

export const PROXY_TYPES: ProxyType[] = ["socks5", "http", "https", "ssh"];

export const SETTINGS_COOKIE = {
  session: "wa_session",
  email: "wa_email",
  password: "wa_password",
  proxyType: "wa_proxy_type",
  proxyHost: "wa_proxy_host",
  proxyPort: "wa_proxy_port",
  proxyUser: "wa_proxy_user",
  proxyPass: "wa_proxy_pass",
  proxyMode: "wa_proxy_mode",
  openai: "wa_openai",
  /** @deprecated legacy single-string proxy */
  proxyLegacy: "wa_proxy",
} as const;

export const CLIENT_SETTINGS_KEY = "workana-app-settings";

export interface RuntimeSettings {
  workanaSession: string;
  workanaEmail: string;
  workanaPassword: string;
  proxyType: ProxyType;
  proxyHost: string;
  proxyPort: string;
  proxyUsername: string;
  proxyPassword: string;
  /** @deprecated legacy env/cookie single-string proxy */
  workanaProxy: string;
  workanaProxyMode: ProxyMode;
  openaiApiKey: string;
}

export interface RuntimeSettingsInput {
  workanaSession?: string;
  workanaEmail?: string;
  workanaPassword?: string;
  proxyType?: ProxyType;
  proxyHost?: string;
  proxyPort?: string;
  proxyUsername?: string;
  proxyPassword?: string;
  workanaProxy?: string;
  workanaProxyMode?: ProxyMode;
  openaiApiKey?: string;
}

export interface RuntimeSettingsStatus {
  configured: {
    session: boolean;
    login: boolean;
    proxy: boolean;
    openai: boolean;
  };
  authMethod: "session" | "email" | "none";
  proxyMode: ProxyMode;
  proxyType: ProxyType | null;
  sessionPreview: string | null;
  emailPreview: string | null;
  proxyPreview: string | null;
  openaiPreview: string | null;
}

export function normalizeProxyMode(value: string | undefined): ProxyMode {
  const mode = (value || "auto").toLowerCase();
  if (mode === "always" || mode === "never") return mode;
  return "auto";
}

export function normalizeProxyType(value: string | undefined): ProxyType {
  const type = (value || "socks5").toLowerCase();
  if (type === "http" || type === "https" || type === "ssh" || type === "socks5") {
    return type;
  }
  return "socks5";
}

export function maskSecret(value: string, visible = 4): string | null {
  if (!value) return null;
  if (value.length <= visible) return "••••";
  return `${"•".repeat(Math.min(8, value.length - visible))}${value.slice(-visible)}`;
}

export function maskEmail(value: string): string | null {
  if (!value) return null;
  const [local, domain] = value.split("@");
  if (!domain) return maskSecret(value);
  const head = local.length <= 2 ? local[0] : `${local.slice(0, 2)}•••`;
  return `${head}@${domain}`;
}

export function hasWorkanaAuth(settings: Pick<RuntimeSettings, "workanaSession" | "workanaEmail" | "workanaPassword">): boolean {
  if (settings.workanaSession.trim()) return true;
  return Boolean(settings.workanaEmail.trim() && settings.workanaPassword.trim());
}

export function hasProxyConfig(
  settings: Pick<
    RuntimeSettings,
    "proxyHost" | "proxyPort" | "proxyUsername" | "proxyPassword" | "workanaProxy"
  >
): boolean {
  if (settings.proxyHost.trim()) return true;
  return Boolean(settings.workanaProxy.trim());
}

export function mergeRuntimeSettings(
  overrides?: Partial<RuntimeSettings>
): RuntimeSettings {
  return {
    workanaSession:
      overrides?.workanaSession?.trim() ||
      process.env.WORKANA_SESSION?.trim() ||
      "",
    workanaEmail:
      overrides?.workanaEmail?.trim() || process.env.WORKANA_EMAIL?.trim() || "",
    workanaPassword:
      overrides?.workanaPassword?.trim() ||
      process.env.WORKANA_PASSWORD?.trim() ||
      "",
    proxyType: normalizeProxyType(
      overrides?.proxyType || process.env.WORKANA_PROXY_TYPE
    ),
    proxyHost:
      overrides?.proxyHost?.trim() || process.env.WORKANA_PROXY_HOST?.trim() || "",
    proxyPort:
      overrides?.proxyPort?.trim() || process.env.WORKANA_PROXY_PORT?.trim() || "",
    proxyUsername:
      overrides?.proxyUsername?.trim() ||
      process.env.WORKANA_PROXY_USER?.trim() ||
      "",
    proxyPassword:
      overrides?.proxyPassword?.trim() ||
      process.env.WORKANA_PROXY_PASS?.trim() ||
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
  const session = Boolean(settings.workanaSession.trim());
  const login = Boolean(settings.workanaEmail.trim() && settings.workanaPassword.trim());

  return {
    configured: {
      session,
      login: session || login,
      proxy: hasProxyConfig(settings),
      openai: Boolean(settings.openaiApiKey.trim()),
    },
    authMethod: session ? "session" : login ? "email" : "none",
    proxyMode: settings.workanaProxyMode,
    proxyType: hasProxyConfig(settings) ? settings.proxyType : null,
    sessionPreview: maskSecret(settings.workanaSession),
    emailPreview: maskEmail(settings.workanaEmail),
    proxyPreview: settings.proxyHost.trim()
      ? `${settings.proxyType}://${settings.proxyHost}:${settings.proxyPort || "…"}`
      : settings.workanaProxy
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

export function emptyRuntimeSettings(): RuntimeSettings {
  return mergeRuntimeSettings({
    workanaSession: "",
    workanaEmail: "",
    workanaPassword: "",
    proxyHost: "",
    proxyPort: "",
    proxyUsername: "",
    proxyPassword: "",
    workanaProxy: "",
    openaiApiKey: "",
  });
}

export type NetworkConfig = Pick<
  RuntimeSettings,
  | "proxyType"
  | "proxyHost"
  | "proxyPort"
  | "proxyUsername"
  | "proxyPassword"
  | "workanaProxyMode"
  | "workanaProxy"
>;
