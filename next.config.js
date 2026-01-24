/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  typedRoutes: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable static generation to avoid database access during Vercel build
  staticPageGenerationTimeout: 0,
};

module.exports = nextConfig;
