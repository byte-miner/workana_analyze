"use client";

import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import SearchIcon from "@mui/icons-material/Search";
import WorkIcon from "@mui/icons-material/Work";
import BusinessIcon from "@mui/icons-material/Business";
import {
  activePlatformCountries,
  activePlatformCountryCount,
  platformRegionCounts,
  type PlatformRegion,
  type ActivityTier,
} from "@/data/workanaActiveCountries";
import { CountryFlag } from "@/components/CountryFlag";

const REGIONS: Array<PlatformRegion | "All"> = [
  "All",
  "Americas",
  "Europe",
  "Africa",
  "Asia",
  "Middle East",
  "Oceania",
];

const TIER_FILTERS: Array<ActivityTier | "All"> = ["All", "primary", "major", "active"];

const tierLabel: Record<ActivityTier, string> = {
  primary: "Primary market",
  major: "Major market",
  active: "Active",
};

export function ActiveCountriesExplorer() {
  const [region, setRegion] = useState<PlatformRegion | "All">("All");
  const [tier, setTier] = useState<ActivityTier | "All">("All");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return activePlatformCountries.filter((c) => {
      if (region !== "All" && c.region !== region) return false;
      if (tier !== "All" && c.tier !== tier) return false;
      if (q && !c.country.toLowerCase().includes(q) && !c.code.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [region, tier, query]);

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, maxWidth: 720 }}>
        Workana connects freelancers and clients across{" "}
        <strong>{activePlatformCountryCount} countries</strong> worldwide. Both sides can register,
        post projects, and hire wherever the platform is available.
      </Typography>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
        {platformRegionCounts.map(({ region: r, count }) => (
          <Chip
            key={r}
            label={`${r} (${count})`}
            size="small"
            variant="outlined"
            sx={{ borderRadius: "10px" }}
          />
        ))}
      </Box>

      <TextField
        fullWidth
        size="small"
        placeholder="Search country or ISO code…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        sx={{ mb: 2, maxWidth: 400 }}
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

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 1.5 }}>
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

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
        {TIER_FILTERS.map((t) => (
          <Chip
            key={t}
            label={t === "All" ? "All tiers" : tierLabel[t]}
            size="small"
            clickable
            variant={tier === t ? "filled" : "outlined"}
            onClick={() => setTier(t)}
            sx={{
              borderRadius: "10px",
              ...(tier === t && t !== "All"
                ? { bgcolor: "secondary.light", color: "primary.main" }
                : {}),
            }}
          />
        ))}
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: "block" }}>
        Showing {filtered.length} of {activePlatformCountryCount} countries
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
            lg: "repeat(4, 1fr)",
          },
          gap: 1.5,
        }}
      >
        {filtered.map((c) => (
          <Paper
            key={c.code}
            variant="outlined"
            sx={{
              p: 1.5,
              borderRadius: "10px",
              borderColor: "divider",
              display: "flex",
              flexDirection: "column",
              gap: 0.75,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CountryFlag country={c.country} code={c.code} size={18} />
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                  {c.country}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {c.code} · {c.region}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {c.freelancers && (
                <Chip
                  icon={<WorkIcon sx={{ fontSize: 14 }} />}
                  label="Freelancers"
                  size="small"
                  sx={{ height: 22, fontSize: "0.65rem", borderRadius: "10px", bgcolor: "secondary.light" }}
                />
              )}
              {c.clients && (
                <Chip
                  icon={<BusinessIcon sx={{ fontSize: 14 }} />}
                  label="Clients"
                  size="small"
                  sx={{ height: 22, fontSize: "0.65rem", borderRadius: "10px", bgcolor: "secondary.light" }}
                />
              )}
              {c.tier !== "active" && (
                <Chip
                  label={tierLabel[c.tier]}
                  size="small"
                  color="primary"
                  sx={{ height: 22, fontSize: "0.65rem", borderRadius: "10px" }}
                />
              )}
            </Box>

            {c.note && (
              <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                {c.note}
              </Typography>
            )}
          </Paper>
        ))}
      </Box>
    </Box>
  );
}
