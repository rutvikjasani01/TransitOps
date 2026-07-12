import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Allow production builds to successfully complete even if type errors are present.
    ignoreBuildErrors: true,
  },
  eslint: {
    // Allow production builds to successfully complete even if ESLint errors are present.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
