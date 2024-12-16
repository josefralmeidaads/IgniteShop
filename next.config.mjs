/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    localPatterns: [
      {
        pathname: '/assets/**',
        search: '',
      },
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'files.stripe.com',
        // port: '',
        // pathname: '/account123/**',
      },
    ],
  },
};

export default nextConfig;
