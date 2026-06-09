/** @type {import('next').NextConfig} */
const nextConfig = {
  // Sitecore Marketplace embeds localhost in portal.sitecorecloud.io — allow dev chunks/HMR
  allowedDevOrigins: ['*.sitecorecloud.io', 'portal.sitecorecloud.io'],
  images: {
    // Relative /public paths in dev — avoids http://localhost/_next/image mixed-content in Sitecore iframe
    unoptimized: process.env.NODE_ENV === 'development',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'delivery-sitecore.sitecorecontenthub.cloud',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
