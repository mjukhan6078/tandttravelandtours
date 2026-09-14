import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  allowedDevOrigins: ["192.168.100.8", "localhost", "192.168.100.184"],
};

export default nextConfig;
