"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import type { CountryRanking } from "@/data/workanaData";
import { CountryFlag } from "@/components/CountryFlag";

interface CountryCardProps {
  country: CountryRanking;
}

export function CountryCard({ country }: CountryCardProps) {
  return (
    <Card
      sx={{
        height: "100%",
        transition: "box-shadow 0.2s, border-color 0.2s",
        "&:hover": {
          boxShadow: "0 4px 14px rgba(114, 70, 229, 0.1)",
          borderColor: "secondary.light",
        },
      }}
    >
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
          <CountryFlag country={country.country} size={22} />
          <Typography variant="h6" color="primary.dark" sx={{ fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
            {country.shareLabel}
          </Typography>
        </Box>

        <Typography variant="subtitle1" color="primary.dark" sx={{ mt: 1.5, fontWeight: 600 }}>
          {country.country}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {country.role}
        </Typography>
        <Chip
          label={country.region}
          size="small"
          sx={{
            mt: 1.5,
            bgcolor: "secondary.light",
            color: "primary.main",
            fontWeight: 500,
            borderRadius: "10px",
          }}
        />
      </CardContent>
    </Card>
  );
}
