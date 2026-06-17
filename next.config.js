/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.amazonaws.com' },
      { protocol: 'https', hostname: '*.r2.dev' },
      { protocol: 'https', hostname: '*.cloudflare.com' },
    ],
  },
  experimental: {
    serverActions: { allowedOrigins: ['localhost:3000'], bodySizeLimit: '150mb' },
  },
  // Increase API body limit to 150MB for large file uploads
  api: {
    bodyParser: false,
    responseLimit: '150mb',
  },
}

module.exports = nextConfig
