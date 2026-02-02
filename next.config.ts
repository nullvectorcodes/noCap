import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true, // Disable Image Optimization API to avoid Sharp dependency on Apple Silicon
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Webpack config (for build/prod)
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      sharp$: path.resolve(__dirname, "./sharp-blocker.js"),
    };
    return config;
  },
  // Turbopack config (for dev)
  // Required to prevent "Webpack config present but no Turbopack config" error
  // Turbopack config (for dev)
  // Turbopack config (for dev)
  turbopack: {
    resolveAlias: {
      sharp: "./sharp-blocker.js",
    },
  },
};

export default nextConfig;
