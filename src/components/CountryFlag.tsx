"use client";

import * as Flags from "country-flag-icons/react/3x2";
import { getCountryCode } from "@/lib/countryFlags";

interface CountryFlagProps {
  country?: string;
  code?: string;
  size?: number;
  className?: string;
}

export function CountryFlag({ country, code, size = 24, className = "" }: CountryFlagProps) {
  const iso = code ?? (country ? getCountryCode(country) : undefined);
  const Flag = iso
    ? (Flags[iso as keyof typeof Flags] as React.ComponentType<{
        className?: string;
        style?: React.CSSProperties;
        title?: string;
      }> | undefined)
    : undefined;

  if (!Flag) {
    return (
      <span
        className={`inline-flex items-center justify-center rounded bg-gray-200 text-[10px] font-bold text-gray-500 ${className}`}
        style={{ width: size * 1.5, height: size }}
      >
        ?
      </span>
    );
  }

  return (
    <Flag
      className={`rounded-sm shadow-sm ${className}`}
      style={{ width: size * 1.5, height: size }}
      title={country ?? iso}
    />
  );
}
