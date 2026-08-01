import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Smaller production image for Docker
  output: "standalone",
  // Allow phone/LAN access to Next.js HMR in development
  allowedDevOrigins: ["192.168.100.8", "localhost", "192.168.100.184"],
};

export default nextConfig;
