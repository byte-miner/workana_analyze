"use client";

import { useMemo, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import { SiteLayout } from "@/components/SiteLayout";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CountryFlag } from "@/components/CountryFlag";
import {
  activePlatformCountries,
  activePlatformCountryCount,
  type PlatformRegion,
} from "@/data/workanaActiveCountries";
import { specialMarketNotes } from "@/data/workanaData";

const REGIONS: Array<PlatformRegion | "All"> = [
  "All",
  "Americas",
  "Europe",
  "Africa",
  "Asia",
  "Middle East",
  "Oceania",
];

export default function ProjectsPage() {
  const [region, setRegion] = useState<PlatformRegion | "All">("All");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return activePlatformCountries.filter((p) => {
      const matchRegion = region === "All" || p.region === region;
      const matchQuery =
        !q ||
        p.country.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.region.toLowerCase().includes(q);
      return matchRegion && matchQuery;
    });
  }, [region, query]);

  return (
    <SiteLayout>
      <Breadcrumbs items={[{ label: "Projects" }]} />

      <h1 className="workana-gradient-text text-3xl font-bold">Platform Countries</h1>
      <p className="mt-2 text-[var(--muted)]">
        All {activePlatformCountryCount} countries with active freelancers and/or clients on Workana.
      </p>

      <Box sx={{ mt: 3, mb: 2, display: "flex", flexWrap: "wrap", gap: 1 }}>
        {REGIONS.map((r) => (
          <Chip
            key={r}
            label={r}
            size="small"
            clickable
            color={region === r ? "primary" : "default"}
            variant={region === r ? "filled" : "outlined"}
            onClick={() => setRegion(r)}
            sx={{ borderRadius: "10px" }}
          />
        ))}
      </Box>

      <TextField
        fullWidth
        size="small"
        placeholder="Search country, code, or region…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        sx={{ mb: 2, maxWidth: 420 }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
            sx: { borderRadius: "10px" },
          },
        }}
      />

      <p className="mb-4 text-sm text-[var(--muted)]">
        Showing {filtered.length} of {activePlatformCountryCount} countries
      </p>

      <div className="overflow-x-auto rounded-[10px] border" style={{ borderColor: "var(--border-color)" }}>
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr style={{ background: "var(--badge-color)" }}>
              {["Country", "Region", "Freelancers", "Clients", "Market tier", "Notes"].map((h) => (
                <th
                  key={h}
                  className="whitespace-nowrap px-4 py-3 font-semibold"
                  style={{ color: "var(--workana-navy)" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr
                key={p.code}
                className="border-t transition hover:bg-gray-50"
                style={{ borderColor: "var(--border-color)" }}
              >
                <td className="px-4 py-3 font-medium" style={{ color: "var(--workana-navy)" }}>
                  <span className="flex items-center gap-2">
                    <CountryFlag country={p.country} code={p.code} size={18} />
                    {p.country}
                  </span>
                </td>
                <td className="px-4 py-3 text-[var(--muted)]">{p.region}</td>
                <td className="px-4 py-3">
                  <RoleBadge active={p.freelancers} label="Yes" off="—" />
                </td>
                <td className="px-4 py-3">
                  <RoleBadge active={p.clients} label="Yes" off="—" />
                </td>
                <td className="px-4 py-3">
                  <TierBadge tier={p.tier} />
                </td>
                <td className="px-4 py-3 text-[var(--muted)]">
                  {p.note ?? specialMarketNotes[p.country] ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <p className="mt-8 text-center text-[var(--muted)]">No countries match your filters.</p>
      )}
    </SiteLayout>
  );
}

function RoleBadge({ active, label, off }: { active: boolean; label: string; off: string }) {
  return (
    <span
      className="rounded-[10px] px-2 py-0.5 text-xs font-semibold"
      style={
        active
          ? { background: "var(--badge-color)", color: "var(--btn-color)" }
          : { color: "var(--muted)" }
      }
    >
      {active ? label : off}
    </span>
  );
}

function TierBadge({ tier }: { tier: string }) {
  const styles: Record<string, { bg: string; text: string; label: string }> = {
    primary: { bg: "var(--btn-color)", text: "#fff", label: "Primary" },
    major: { bg: "var(--badge-color)", text: "var(--btn-color)", label: "Major" },
    active: { bg: "#f5f5f5", text: "var(--muted)", label: "Active" },
  };
  const s = styles[tier] ?? styles.active;
  return (
    <span
      className="rounded-[10px] px-2 py-0.5 text-xs font-semibold"
      style={{ background: s.bg, color: s.text }}
    >
      {s.label}
    </span>
  );
}
