import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Smaller production image for Docker
  output: "standalone",
  // Allow phone/LAN access to Next.js HMR in development
  allowedDevOrigins: ["192.168.100.8", "localhost", "192.168.100.184"],
  // Keep PDF tooling outside the Next bundler (pdf.js worker paths break otherwise)
  serverExternalPackages: ["pdf-parse", "pdfjs-dist"],
};

export default nextConfig;
