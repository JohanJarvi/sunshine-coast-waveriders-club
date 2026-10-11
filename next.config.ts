import type { NextConfig } from "next";

// Next.js loads .env, .env.local etc. automatically before this file runs,
// so NEXT_PUBLIC_BASE_PATH can live in .env.local or be set by CI.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  // Static export: the whole app is client-side, so it can be hosted on
  // GitHub Pages (like First Saturday Sessions) or any static host.
  output: "export",
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
