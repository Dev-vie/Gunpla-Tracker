import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },

  // Image optimization for reduced egress
  // Critical for bandwidth reduction - Next.js Image component with these settings
  // can reduce image serving costs by 40-60%
  images: {
    // Allow Supabase Storage domains
    domains: [
      "localhost",
      "*.supabase.co", // Supabase Storage CDN
    ],

    // Remote patterns for more flexible Supabase URL matching
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],

    // Image optimization settings
    deviceSizes: [320, 640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],

    // Cache optimized images for 1 year (Supabase cache-control header)
    // Browsers will cache aggressively, reducing repeat requests
    minimumCacheTTL: 31536000, // 1 year in seconds

    // Formats: AVIF is best (smaller), WebP is fallback
    formats: ["image/avif", "image/webp"],

    // Disable static imports optimization to allow runtime src
    disableStaticImages: false,
  },

  // Headers for image caching
  // This tells browsers and CDNs to cache images for 1 year
  async headers() {
    return [
      {
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/:path*.webp",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

