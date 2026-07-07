import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // These packages use Node.js APIs (TCP sockets, streams)
  // Mark as external so Cloudflare Edge build doesn't bundle them
  serverExternalPackages: ["@react-pdf/renderer", "pg"],
};

export default nextConfig;
