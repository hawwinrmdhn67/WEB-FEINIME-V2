/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.myanimelist.net',
      },
    ],
    qualities: [25, 50, 75, 80, 100], 
  },
};

export default nextConfig;