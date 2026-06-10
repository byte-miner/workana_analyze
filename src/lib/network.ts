import { chromium, type Browser } from "playwright";
import { anonymizeProxy, closeAnonymizedProxy } from "proxy-chain";
import { WORKANA_BASE, IT_PROGRAMMING_CATEGORY } from "./config";

export type NetworkRoute = "proxy" | "direct";
export type ProxyMode = "auto" | "always" | "never";

const PROBE_URL = `${WORKANA_BASE}/jobs?category=${IT_PROGRAMMING_CATEGORY}&page=1&language=pt`;
const PROBE_TIMEOUT_MS = 25000;

/** Hosts that must bypass system/VPN proxy (local app + OpenAI). */
export function configureLocalBypass() {
  const hosts = ["localhost", "127.0.0.1", "::1", "api.openai.com"];
  const existing = process.env.NO_PROXY || process.env.no_proxy || "";
  const merged = new Set(
    existing
      .split(",")
      .map((h) => h.trim())
      .filter(Boolean)
  );
  hosts.forEach((h) => merged.add(h));
  const value = [...merged].join(",");
  process.env.NO_PROXY = value;
  process.env.no_proxy = value;
}

export function getProxyMode(): ProxyMode {
  const mode = (process.env.WORKANA_PROXY_MODE || "auto").toLowerCase();
  if (mode === "always" || mode === "never") return mode;
  return "auto";
}

export function buildProxyUrl(): string | null {
  const raw = process.env.WORKANA_PROXY?.trim();
  if (!raw) return null;

  const match = raw.match(/^socks5:\/\/([^:]+):(\d+):([^:]+):(.+)$/);
  if (match) {
    return `socks5://${match[3]}:${match[4]}@${match[1]}:${match[2]}`;
  }
  return raw;
}

export interface BrowserSession {
  browser: Browser;
  route: NetworkRoute;
  close: () => Promise<void>;
}

async function launchBrowser(route: NetworkRoute): Promise<BrowserSession> {
  let anonymizedProxy: string | null = null;

  const launchOptions: Parameters<typeof chromium.launch>[0] = {
    headless: true,
  };

  if (route === "proxy") {
    const proxyUrl = buildProxyUrl();
    if (!proxyUrl) {
      throw new Error("WORKANA_PROXY is not configured");
    }
    anonymizedProxy = await anonymizeProxy(proxyUrl);
    launchOptions.proxy = { server: anonymizedProxy };
  }

  const browser = await chromium.launch(launchOptions);

  return {
    browser,
    route,
    close: async () => {
      await browser.close();
      if (anonymizedProxy) {
        await closeAnonymizedProxy(anonymizedProxy, true);
      }
    },
  };
}

async function probeRoute(route: NetworkRoute): Promise<boolean> {
  let session: BrowserSession | null = null;
  try {
    session = await launchBrowser(route);
    const page = await session.browser.newPage();
    const response = await page.goto(PROBE_URL, {
      waitUntil: "domcontentloaded",
      timeout: PROBE_TIMEOUT_MS,
    });
    const ok = response !== null && response.status() < 400;
    await page.close();
    return ok;
  } catch {
    return false;
  } finally {
    if (session) await session.close();
  }
}

/**
 * Pick the best route for the current network (VPN on or off).
 * auto: try direct first (works with VPN), then proxy (works without VPN).
 */
export async function selectNetworkRoute(): Promise<NetworkRoute> {
  const mode = getProxyMode();
  const hasProxy = Boolean(buildProxyUrl());

  if (mode === "never") return "direct";
  if (mode === "always") {
    if (!hasProxy) {
      throw new Error("WORKANA_PROXY_MODE=always but WORKANA_PROXY is not set");
    }
    return "proxy";
  }

  // auto — prefer direct (VPN-friendly), fall back to SOCKS proxy
  if (await probeRoute("direct")) return "direct";
  if (hasProxy && (await probeRoute("proxy"))) return "proxy";

  throw new Error(
    "Cannot reach Workana. Try toggling VPN or check WORKANA_PROXY settings."
  );
}

export async function createBrowserSession(
  preferredRoute?: NetworkRoute
): Promise<BrowserSession> {
  const route = preferredRoute ?? (await selectNetworkRoute());
  return launchBrowser(route);
}

export function routeLabel(route: NetworkRoute): string {
  return route === "proxy" ? "SOCKS5 proxy" : "direct connection";
}
