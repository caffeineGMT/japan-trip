/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  typescript: {
    // Skip type checking during build (we have separate type check command)
    ignoreBuildErrors: true,
  },
  eslint: {
    // Skip ESLint during build (we have separate lint command)
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
