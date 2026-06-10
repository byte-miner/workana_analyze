import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["playwright", "proxy-chain"],
  webpack: (config, { dev }) => {
    if (dev) {
      // Windows dev: avoid EBUSY rename failures on .next/dev/cache/webpack pack files
      config.cache = { type: "memory" };
      // Ignore Windows system folders when the project lives on a drive root
      config.watchOptions = {
        ...config.watchOptions,
        ignored: [
          "**/node_modules/**",
          "**/.git/**",
          "**/System Volume Information/**",
          "**/$RECYCLE.BIN/**",
        ],
      };
    }
    return config;
  },
};

export default nextConfig;
