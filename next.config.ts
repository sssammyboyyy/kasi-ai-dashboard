import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Skip TypeScript checking during build (handled by CI separately)
  typescript: {
    ignoreBuildErrors: true,
  },

  // Image optimization
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },

  // Performance optimizations
  experimental: {},

  // Compression
  compress: true,

  // Power by header removal for security
  poweredByHeader: false,

  // React strict mode for better development
  reactStrictMode: true,
};

export default nextConfig;

