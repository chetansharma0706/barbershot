// next.config.ts
import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";

const nextConfig: NextConfig = {
  /* your existing config options here */
  reactStrictMode: true,
  turbopack:{}
};

// Wrap the nextConfig object with withPWA
export default withPWA({
  dest: "public",
  // disable: process.env.NODE_ENV === "development", // Disable PWA in development
  register: true,
  // Add other PWA options here if needed, e.g.:
  cacheOnFrontEndNav: true,
  // aggressiveFrontEndNavCaching: true,
})(nextConfig);

