import type { NetworkConfig, ProxyType, RuntimeSettings } from "./settingsTypes";

const DEFAULT_PORTS: Record<ProxyType, string> = {
  http: "8080",
  https: "443",
  socks5: "1080",
  ssh: "1080",
};

export function proxyTypeLabel(type: ProxyType): string {
  const labels: Record<ProxyType, string> = {
    http: "HTTP",
    https: "HTTPS",
    socks5: "SOCKS5",
    ssh: "SSH (SOCKS tunnel)",
  };
  return labels[type];
}

function parseLegacyProxyString(raw: string): Partial<RuntimeSettings> | null {
  const legacyMatch = raw.match(/^socks5:\/\/([^:]+):(\d+):([^:]+):(.+)$/);
  if (legacyMatch) {
    return {
      proxyType: "socks5",
      proxyHost: legacyMatch[1],
      proxyPort: legacyMatch[2],
      proxyUsername: legacyMatch[3],
      proxyPassword: legacyMatch[4],
    };
  }

  try {
    const normalized = raw.includes("://") ? raw : `socks5://${raw}`;
    const url = new URL(normalized);
    const protocol = url.protocol.replace(":", "").toLowerCase();
    const proxyType =
      protocol === "http" || protocol === "https" || protocol === "socks5"
        ? protocol
        : "socks5";

    return {
      proxyType,
      proxyHost: url.hostname,
      proxyPort: url.port || DEFAULT_PORTS[proxyType],
      proxyUsername: decodeURIComponent(url.username),
      proxyPassword: decodeURIComponent(url.password),
    };
  } catch {
    return null;
  }
}

/** Build a proxy-chain / Playwright-compatible proxy URL. */
export function buildProxyUrl(config?: NetworkConfig): string | null {
  const legacy = config?.workanaProxy?.trim() || process.env.WORKANA_PROXY?.trim();

  let type = config?.proxyType || "socks5";
  let host = config?.proxyHost?.trim() || "";
  let port = config?.proxyPort?.trim() || "";
  let user = config?.proxyUsername?.trim() || "";
  let pass = config?.proxyPassword?.trim() || "";

  if (!host && legacy) {
    const parsed = parseLegacyProxyString(legacy);
    if (parsed) {
      type = parsed.proxyType || type;
      host = parsed.proxyHost || host;
      port = parsed.proxyPort || port;
      user = parsed.proxyUsername || user;
      pass = parsed.proxyPassword || pass;
    } else {
      return legacy;
    }
  }

  if (!host) return null;

  port = port || DEFAULT_PORTS[type];
  const scheme = type === "ssh" ? "socks5" : type;

  if (user && pass) {
    return `${scheme}://${encodeURIComponent(user)}:${encodeURIComponent(pass)}@${host}:${port}`;
  }
  return `${scheme}://${host}:${port}`;
}

export function defaultProxyPort(type: ProxyType): string {
  return DEFAULT_PORTS[type];
}
