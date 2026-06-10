"use client";

import { createTheme } from "@mui/material/styles";

export const workanaTheme = createTheme({
  palette: {
    primary: {
      main: "#7246E5",
      dark: "#4D2D9F",
      light: "#BEA5FF",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#BEA5FF",
      light: "#DED2FF",
      contrastText: "#3C3C3C",
    },
    success: {
      main: "#29B8B6",
    },
    text: {
      primary: "#3C3C3C",
      secondary: "#6B7280",
    },
    background: {
      default: "#FFFFFF",
      paper: "#FFFFFF",
    },
    divider: "#D6D6D6",
    action: {
      disabled: "#D6D6D6",
      disabledBackground: "#D6D6D6",
    },
  },
  typography: {
    fontFamily: 'var(--font-app), "Poppins", "Segoe UI", system-ui, sans-serif',
    h1: { fontWeight: 700, color: "#3C3C3C" },
    h2: { fontWeight: 700, color: "#3C3C3C" },
    h3: { fontWeight: 600, color: "#3C3C3C" },
    h4: { fontWeight: 600, color: "#3C3C3C" },
    button: { textTransform: "none", fontWeight: 600 },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          boxShadow: "none",
          "&:hover": { boxShadow: "0 2px 8px rgba(114, 70, 229, 0.25)" },
        },
        contained: {
          backgroundColor: "#7246E5",
          "&:hover": { backgroundColor: "#4D2D9F" },
          "&.Mui-disabled": {
            backgroundColor: "#D6D6D6",
            color: "#888888",
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 10 },
        filled: {
          backgroundColor: "#DED2FF",
          color: "#7246E5",
        },
        outlined: {
          borderColor: "#D6D6D6",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0 1px 3px rgba(60, 60, 60, 0.06)",
          border: "1px solid #D6D6D6",
          borderRadius: 10,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { borderRadius: 10 },
        rounded: { borderRadius: 10 },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          "& .MuiOutlinedInput-notchedOutline": { borderColor: "#D6D6D6" },
          "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#BEA5FF" },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#7246E5" },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          color: "#6a6a6a",
          "&.Mui-selected": { color: "#7246E5" },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: { backgroundColor: "#7246E5" },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: { borderRadius: 0 },
      },
    },
  },
});
