// next.config.ts
import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.sstatic.net',
        pathname: '/l60Hf.png',
        
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
        pathname: '/**',
      },
    ],
  },
  /* your existing config options here */
experimental: {
  
   serverActions: {
      allowedOrigins: [
      'localhost:3000', // Allow local development
      'expert-guacamole-5gg7jxw6g5pgh79pw-3000.app.github.dev', // Allow your specific GitHub Codespaces URL
      // If you are using a different codespaces URL format, add it here too.
      // e.g., '*.app.github.dev' with appropriate security caution
    ],
    }
  // Add supported experimental options here if needed
  
},
reactStrictMode: true,
turbopack: {}
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

