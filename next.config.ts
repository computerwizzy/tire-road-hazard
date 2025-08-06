
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
  },
  allowedDevOrigins: [
      "https://9000-firebase-studio-1754348898809.cluster-ux5mmlia3zhhask7riihruxydo.cloudworkstations.dev",
      "https://6000-firebase-studio-1754348898809.cluster-ux5mmlia3zhhask7riihruxydo.cloudworkstations.dev"
  ],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.tirerack.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'evsportline.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
};

// Triggering a rebuild to clear cache.
export default nextConfig;
