import "server-only";

import { cookies } from "next/headers";
import {
  mergeRuntimeSettings,
  normalizeProxyMode,
  normalizeProxyType,
  SETTINGS_COOKIE,
  type RuntimeSettings,
} from "./settingsTypes";

export async function getRuntimeSettingsFromCookies(): Promise<Partial<RuntimeSettings>> {
  const store = await cookies();

  const read = (key: keyof typeof SETTINGS_COOKIE) => store.get(SETTINGS_COOKIE[key])?.value;

  const session = read("session");
  const email = read("email");
  const password = read("password");
  const proxyType = read("proxyType");
  const proxyHost = read("proxyHost");
  const proxyPort = read("proxyPort");
  const proxyUser = read("proxyUser");
  const proxyPass = read("proxyPass");
  const proxyLegacy = read("proxyLegacy");
  const proxyMode = read("proxyMode");
  const openai = read("openai");

  return {
    ...(session !== undefined ? { workanaSession: session } : {}),
    ...(email !== undefined ? { workanaEmail: email } : {}),
    ...(password !== undefined ? { workanaPassword: password } : {}),
    ...(proxyType !== undefined ? { proxyType: normalizeProxyType(proxyType) } : {}),
    ...(proxyHost !== undefined ? { proxyHost } : {}),
    ...(proxyPort !== undefined ? { proxyPort } : {}),
    ...(proxyUser !== undefined ? { proxyUsername: proxyUser } : {}),
    ...(proxyPass !== undefined ? { proxyPassword: proxyPass } : {}),
    ...(proxyLegacy !== undefined ? { workanaProxy: proxyLegacy } : {}),
    ...(proxyMode !== undefined
      ? { workanaProxyMode: normalizeProxyMode(proxyMode) }
      : {}),
    ...(openai !== undefined ? { openaiApiKey: openai } : {}),
  };
}

export async function getEffectiveSettings(): Promise<RuntimeSettings> {
  const fromCookies = await getRuntimeSettingsFromCookies();
  return mergeRuntimeSettings(fromCookies);
}
