import { resolve } from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
    },
  },
  // Configurar aliases para compatibilidade
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': resolve(process.cwd(), './'),
      '@shared': resolve(process.cwd(), './shared'),
    };
    return config;
  },
};

export default nextConfig;
