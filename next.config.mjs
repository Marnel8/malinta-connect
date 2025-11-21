/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // Increased from default 1mb to handle larger image uploads
    },
  },
  // Ensure email templates are included in production build
  outputFileTracingIncludes: {
    '/**': [
      'mails/templates/**/*.ejs',
    ],
  },
}

export default nextConfig
