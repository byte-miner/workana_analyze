import "server-only";

import { cookies } from "next/headers";
import {
  mergeRuntimeSettings,
  normalizeProxyMode,
  SETTINGS_COOKIE,
  type RuntimeSettings,
} from "./settingsTypes";

export async function getRuntimeSettingsFromCookies(): Promise<Partial<RuntimeSettings>> {
  const store = await cookies();
  const session = store.get(SETTINGS_COOKIE.session)?.value;
  const proxy = store.get(SETTINGS_COOKIE.proxy)?.value;
  const proxyMode = store.get(SETTINGS_COOKIE.proxyMode)?.value;
  const openai = store.get(SETTINGS_COOKIE.openai)?.value;

  return {
    ...(session !== undefined ? { workanaSession: session } : {}),
    ...(proxy !== undefined ? { workanaProxy: proxy } : {}),
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
