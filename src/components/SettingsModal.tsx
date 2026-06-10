"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  CLIENT_SETTINGS_KEY,
  type ProxyMode,
  type RuntimeSettingsInput,
  type RuntimeSettingsStatus,
} from "@/lib/settingsTypes";

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

interface FormState {
  workanaSession: string;
  workanaProxy: string;
  workanaProxyMode: ProxyMode;
  openaiApiKey: string;
}

const EMPTY_FORM: FormState = {
  workanaSession: "",
  workanaProxy: "",
  workanaProxyMode: "auto",
  openaiApiKey: "",
};

function loadLocalSettings(): FormState {
  if (typeof window === "undefined") return EMPTY_FORM;
  try {
    const raw = localStorage.getItem(CLIENT_SETTINGS_KEY);
    if (!raw) return EMPTY_FORM;
    const parsed = JSON.parse(raw) as Partial<FormState>;
    return {
      workanaSession: parsed.workanaSession ?? "",
      workanaProxy: parsed.workanaProxy ?? "",
      workanaProxyMode: parsed.workanaProxyMode ?? "auto",
      openaiApiKey: parsed.openaiApiKey ?? "",
    };
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

  const loadSettings = useCallback(async () => {
    setError(null);
    setSaved(false);
    const local = loadLocalSettings();
    setForm(local);

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
      workanaProxy: form.workanaProxy,
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
              Configure your Workana session, proxy, and OpenAI key for scraping and AI
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
            <StatusChip label="Session" active={status.configured.session} />
            <StatusChip label="Proxy" active={status.configured.proxy} />
            <StatusChip label="OpenAI" active={status.configured.openai} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="settings-form">
          <label className="settings-field">
            <span className="settings-label">Workana session (PHPSESSID)</span>
            <input
              type="password"
              className="settings-input"
              value={form.workanaSession}
              onChange={(e) => updateField("workanaSession", e.target.value)}
              placeholder="Paste your PHPSESSID cookie value"
              autoComplete="off"
            />
            <span className="settings-hint">
              Required for full job listings behind Workana&apos;s guest wall.
            </span>
          </label>

          <label className="settings-field">
            <span className="settings-label">SOCKS5 proxy</span>
            <input
              type="text"
              className="settings-input"
              value={form.workanaProxy}
              onChange={(e) => updateField("workanaProxy", e.target.value)}
              placeholder="socks5://host:port:user:pass"
              autoComplete="off"
            />
            <span className="settings-hint">
              Used when direct connection fails. Leave empty if you use a VPN.
            </span>
          </label>

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

          <label className="settings-field">
            <span className="settings-label">OpenAI API key</span>
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
