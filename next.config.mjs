/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  output: 'export',  // Changed from 'standalone' to 'export' for static site generation
  distDir: '.next',
  images: {
    unoptimized: true,
    domains: ['ryspfqoxnzdrhrqiiqht.supabase.co'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ryspfqoxnzdrhrqiiqht.supabase.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Disable server components for static export
  experimental: {
    appDir: true,
  },
}

export default nextConfig
