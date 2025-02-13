/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.externals = [...config.externals, 'sharp'];
    return config;
  },
};

export default nextConfig;
