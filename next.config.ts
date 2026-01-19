import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static Export for GitHub Pages
  output: "export",

  // Image optimization
  images: {
    // @ts-expect-error - Next.js types might not be up to date for this property
    unoptimized: true,
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },

  // Performance optimizations
  experimental: {
    // optimizeCss: true, // Disabled due to CSP eval issues in dev mode
  },

  // Compression
  compress: true,

  // Power by header removal for security
  poweredByHeader: false,

  // React strict mode for better development
  reactStrictMode: true,
};

export default nextConfig;
