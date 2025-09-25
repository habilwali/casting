/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'admin123',
    SERVER_PORT: process.env.SERVER_PORT || '3000',
    SERVER_HOST: process.env.SERVER_HOST || '192.168.70.215',
    MOBILE_NETWORK: process.env.MOBILE_NETWORK || '192.168.10.0/24',
    CHROMECAST_NETWORK: process.env.CHROMECAST_NETWORK || '192.168.20.0/24',
  },
}

module.exports = nextConfig
