import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
      },
      {
        protocol: 'https',
        hostname: 'go4.pw',
      },
      {
        protocol: 'http',
        hostname: 'wtv.la',
      },
      {
        protocol: 'http',
        hostname: 'ip365.cx',
      },
      {
        protocol: 'http',
        hostname: 't365.in',
      },
      {
        protocol: 'http',
        hostname: 'go4.pw',
      },
      {
        protocol: 'http',
        hostname: 'a985.xyz',
      },
      {
        protocol: 'https',
        hostname: 'www.themoviedb.org',
      },
    ],
  },
};

export default nextConfig;
