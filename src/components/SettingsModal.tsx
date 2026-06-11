"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { defaultProxyPort } from "@/lib/proxyConfig";
import {
  CLIENT_SETTINGS_KEY,
  PROXY_TYPES,
  type ProxyMode,
  type ProxyType,
  type RuntimeSettingsInput,
  type RuntimeSettingsStatus,
} from "@/lib/settingsTypes";

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

interface FormState {
  workanaSession: string;
  workanaEmail: string;
  workanaPassword: string;
  proxyType: ProxyType;
  proxyHost: string;
  proxyPort: string;
  proxyUsername: string;
  proxyPassword: string;
  workanaProxyMode: ProxyMode;
  openaiApiKey: string;
}

const EMPTY_FORM: FormState = {
  workanaSession: "",
  workanaEmail: "",
  workanaPassword: "",
  proxyType: "socks5",
  proxyHost: "",
  proxyPort: "",
  proxyUsername: "",
  proxyPassword: "",
  workanaProxyMode: "auto",
  openaiApiKey: "",
};

function migrateLegacyForm(parsed: Record<string, unknown>): FormState {
  const form: FormState = {
    ...EMPTY_FORM,
    workanaSession: String(parsed.workanaSession ?? ""),
    workanaEmail: String(parsed.workanaEmail ?? ""),
    workanaPassword: String(parsed.workanaPassword ?? ""),
    proxyType: (parsed.proxyType as ProxyType) ?? "socks5",
    proxyHost: String(parsed.proxyHost ?? ""),
    proxyPort: String(parsed.proxyPort ?? ""),
    proxyUsername: String(parsed.proxyUsername ?? ""),
    proxyPassword: String(parsed.proxyPassword ?? ""),
    workanaProxyMode: (parsed.workanaProxyMode as ProxyMode) ?? "auto",
    openaiApiKey: String(parsed.openaiApiKey ?? ""),
  };

  const legacyProxy = String(parsed.workanaProxy ?? "");
  if (legacyProxy && !form.proxyHost) {
    const match = legacyProxy.match(/^socks5:\/\/([^:]+):(\d+):([^:]+):(.+)$/);
    if (match) {
      form.proxyType = "socks5";
      form.proxyHost = match[1];
      form.proxyPort = match[2];
      form.proxyUsername = match[3];
      form.proxyPassword = match[4];
    }
  }

  return form;
}

function loadLocalSettings(): FormState {
  if (typeof window === "undefined") return EMPTY_FORM;
  try {
    const raw = localStorage.getItem(CLIENT_SETTINGS_KEY);
    if (!raw) return EMPTY_FORM;
    return migrateLegacyForm(JSON.parse(raw) as Record<string, unknown>);
  } catch {
    return EMPTY_FORM;
  }
}

function saveLocalSettings(form: FormState) {
  localStorage.setItem(CLIENT_SETTINGS_KEY, JSON.stringify(form));
}

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [status, setStatus] = useState<RuntimeSettingsStatus | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const usingSession = Boolean(form.workanaSession.trim());

  const loadSettings = useCallback(async () => {
    setError(null);
    setSaved(false);
    setForm(loadLocalSettings());

    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        setStatus(await res.json());
      }
    } catch {
      // Local form still usable if status fetch fails.
    }
  }, []);

  useEffect(() => {
    if (open) {
      void loadSettings();
    }
  }, [open, loadSettings]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    const payload: RuntimeSettingsInput = {
      workanaSession: form.workanaSession,
      workanaEmail: form.workanaEmail,
      workanaPassword: form.workanaPassword,
      proxyType: form.proxyType,
      proxyHost: form.proxyHost,
      proxyPort: form.proxyPort,
      proxyUsername: form.proxyUsername,
      proxyPassword: form.proxyPassword,
      workanaProxyMode: form.workanaProxyMode,
      openaiApiKey: form.openaiApiKey,
    };

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save settings");
      }

      saveLocalSettings(form);
      setStatus(data);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="settings-modal-overlay"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className="settings-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="settings-modal-header">
          <div>
            <h2 id={titleId} className="settings-modal-title">
              Connection settings
            </h2>
            <p className="settings-modal-subtitle">
              Configure Workana authentication, proxy, and OpenAI for scraping and AI
              features.
            </p>
          </div>
          <button
            type="button"
            className="settings-modal-close"
            onClick={onClose}
            aria-label="Close settings"
          >
            ×
          </button>
        </div>

        {status && (
          <div className="settings-status-row">
            <StatusChip label="Login" active={status.configured.login} />
            <StatusChip label="Proxy" active={status.configured.proxy} />
            <StatusChip label="OpenAI" active={status.configured.openai} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="settings-form">
          <section className="settings-section">
            <h3 className="settings-section-title">Workana account</h3>

            <label className="settings-field">
              <span className="settings-label">Session (PHPSESSID)</span>
              <input
                type="password"
                className="settings-input"
                value={form.workanaSession}
                onChange={(e) => updateField("workanaSession", e.target.value)}
                placeholder="Paste your PHPSESSID cookie value"
                autoComplete="off"
              />
              <span className="settings-hint">
                Fastest option — paste the session cookie from your browser.
              </span>
            </label>

            <div className="settings-divider">
              <span>or sign in with email</span>
            </div>

            <label className="settings-field">
              <span className="settings-label">Login email</span>
              <input
                type="email"
                className="settings-input"
                value={form.workanaEmail}
                onChange={(e) => updateField("workanaEmail", e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                disabled={usingSession}
              />
            </label>

            <label className="settings-field">
              <span className="settings-label">Login password</span>
              <input
                type="password"
                className="settings-input"
                value={form.workanaPassword}
                onChange={(e) => updateField("workanaPassword", e.target.value)}
                placeholder="Workana account password"
                autoComplete="current-password"
                disabled={usingSession}
              />
              <span className="settings-hint">
                {usingSession
                  ? "Clear the session field above to use email login instead."
                  : "Used when no session is set — the scraper signs in automatically."}
              </span>
            </label>
          </section>

          <section className="settings-section">
            <h3 className="settings-section-title">Proxy</h3>

            <label className="settings-field">
              <span className="settings-label">Proxy type</span>
              <select
                className="settings-input"
                value={form.proxyType}
                onChange={(e) => {
                  const nextType = e.target.value as ProxyType;
                  updateField("proxyType", nextType);
                  if (!form.proxyPort.trim()) {
                    updateField("proxyPort", defaultProxyPort(nextType));
                  }
                }}
              >
                {PROXY_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type === "ssh"
                      ? "SSH (SOCKS tunnel)"
                      : type.toUpperCase()}
                  </option>
                ))}
              </select>
            </label>

            <div className="settings-grid-2">
              <label className="settings-field">
                <span className="settings-label">Host</span>
                <input
                  type="text"
                  className="settings-input"
                  value={form.proxyHost}
                  onChange={(e) => updateField("proxyHost", e.target.value)}
                  placeholder="proxy.example.com"
                  autoComplete="off"
                />
              </label>

              <label className="settings-field">
                <span className="settings-label">Port</span>
                <input
                  type="text"
                  className="settings-input"
                  value={form.proxyPort}
                  onChange={(e) => updateField("proxyPort", e.target.value)}
                  placeholder={defaultProxyPort(form.proxyType)}
                  autoComplete="off"
                />
              </label>
            </div>

            <div className="settings-grid-2">
              <label className="settings-field">
                <span className="settings-label">Proxy username</span>
                <input
                  type="text"
                  className="settings-input"
                  value={form.proxyUsername}
                  onChange={(e) => updateField("proxyUsername", e.target.value)}
                  placeholder="Optional"
                  autoComplete="off"
                />
              </label>

              <label className="settings-field">
                <span className="settings-label">Proxy password</span>
                <input
                  type="password"
                  className="settings-input"
                  value={form.proxyPassword}
                  onChange={(e) => updateField("proxyPassword", e.target.value)}
                  placeholder="Optional"
                  autoComplete="off"
                />
              </label>
            </div>

            <label className="settings-field">
              <span className="settings-label">Proxy mode</span>
              <select
                className="settings-input"
                value={form.workanaProxyMode}
                onChange={(e) =>
                  updateField("workanaProxyMode", e.target.value as ProxyMode)
                }
              >
                <option value="auto">Auto — try direct, then proxy</option>
                <option value="always">Always — force proxy</option>
                <option value="never">Never — direct / VPN only</option>
              </select>
            </label>

            <span className="settings-hint">
              {form.proxyType === "ssh"
                ? "SSH uses a SOCKS tunnel on the host/port above (e.g. after ssh -D)."
                : "Leave host empty if you connect directly or via VPN."}
            </span>
          </section>

          <section className="settings-section">
            <h3 className="settings-section-title">OpenAI</h3>

            <label className="settings-field">
              <span className="settings-label">API key</span>
              <input
                type="password"
                className="settings-input"
                value={form.openaiApiKey}
                onChange={(e) => updateField("openaiApiKey", e.target.value)}
                placeholder="sk-proj-..."
                autoComplete="off"
              />
              <span className="settings-hint">
                Powers AI Helper and market insights on the analytics dashboard.
              </span>
            </label>
          </section>

          {error && <p className="settings-error">{error}</p>}
          {saved && <p className="settings-success">Settings saved successfully.</p>}

          <div className="settings-actions">
            <button type="button" className="settings-btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-workana" disabled={saving}>
              {saving ? "Saving..." : "Save settings"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function StatusChip({ label, active }: { label: string; active: boolean }) {
  return (
    <span className={`settings-chip${active ? " settings-chip-active" : ""}`}>
      <span className="settings-chip-dot" aria-hidden />
      {label}
    </span>
  );
}
