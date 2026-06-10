"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import type { RegisteredCountry } from "@/data/workanaData";
import { uniqueRegisteredCountryNames } from "@/data/workanaData";
import { CountryFlag } from "@/components/CountryFlag";

const typeColors: Record<string, { bg: string; color: string }> = {
  "Parent company": { bg: "#7246E5", color: "#fff" },
  "Operational HQ": { bg: "#29B8B6", color: "#fff" },
  "Registered office": { bg: "#DED2FF", color: "#7246E5" },
  "Regional subsidiary": { bg: "#BEA5FF", color: "#3C3C3C" },
};

interface RegisteredCountryCardProps {
  entry: RegisteredCountry;
}

export function RegisteredCountryCard({ entry }: RegisteredCountryCardProps) {
  const badge = typeColors[entry.registrationType] ?? typeColors["Registered office"];

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
          <CountryFlag country={entry.country} size={22} />
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }} color="text.primary">
              {entry.country}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {entry.city}
            </Typography>
          </Box>
        </Box>

        <Chip
          label={entry.registrationType}
          size="small"
          sx={{
            mb: 1.5,
            bgcolor: badge.bg,
            color: badge.color,
            fontWeight: 600,
            borderRadius: "10px",
          }}
        />

        <Typography variant="body2" color="primary.main" sx={{ fontWeight: 600, mb: 0.5 }}>
          {entry.entityName}
        </Typography>

        {entry.address && (
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
            {entry.address}
          </Typography>
        )}

        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
          {entry.role}
        </Typography>

        <Box sx={{ mt: 1.5, display: "flex", flexWrap: "wrap", gap: 1 }}>
          {entry.since && (
            <Chip label={`Since ${entry.since}`} size="small" variant="outlined" sx={{ borderRadius: "10px" }} />
          )}
          <Chip
            label={entry.region}
            size="small"
            sx={{ bgcolor: "secondary.light", color: "primary.main", borderRadius: "10px" }}
          />
        </Box>
      </CardContent>
    </Card>
  );
}