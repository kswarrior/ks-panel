import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ["better-sqlite3", "@vscode/sqlite3", "keyv", "@keyvhq/sqlite"],
  webpack: (config) => {
    config.externals.push({
      "better-sqlite3": "commonjs better-sqlite3",
      "pg-native": "commonjs pg-native",
    });
    return config;
  },
};

export default nextConfig;
