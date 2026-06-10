import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["172.20.10.4", "localhost", "127.0.0.1"],
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
