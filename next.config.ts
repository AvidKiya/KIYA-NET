import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Enable server components and other Cloudflare-compatible features
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

export default nextConfig;
