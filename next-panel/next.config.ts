import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Performance optimizations */
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,

  serverExternalPackages: ["better-sqlite3", "@vscode/sqlite3", "keyv", "@keyvhq/sqlite", "pg", "mysql2", "mongodb"],

  turbopack: {
    // resolveAlias: { ... }
  },

  webpack: (config) => {
    config.externals.push({
      "better-sqlite3": "commonjs better-sqlite3",
      "pg-native": "commonjs pg-native",
    });
    return config;
  },
};

export default nextConfig;
