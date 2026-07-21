import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  allowedDevOrigins: [
    "app.178-104-78-101.sslip.io",
  ],
};

export default nextConfig;