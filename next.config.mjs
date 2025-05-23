/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  output: 'standalone', // Use standalone for Railway deployment
  images: {
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
  // Experimental features can be added here if needed
  experimental: {
    // Add experimental features here
  },
}

export default nextConfig
