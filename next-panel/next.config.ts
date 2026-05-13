import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ["better-sqlite3", "@vscode/sqlite3", "keyv", "@keyvhq/sqlite", "pg", "mysql2", "mongodb"],
  // Disable Turbopack for now to avoid native module build issues if desired,
  // or explicitly pass empty turbopack config to silence the error
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
