import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'gold-finch.s3.ap-south-1.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'gold-finch-new.s3.ap-south-1.amazonaws.com',
      },
    ],
  },
  eslint:{
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb', // Allow up to 50MB for file uploads
    },
  },
};

export default nextConfig;
