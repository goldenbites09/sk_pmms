/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  output: 'standalone',
  images: {
    unoptimized: true,
    domains: ['ryspfqoxnzdrhrqiiqht.supabase.co'],
  },
}

export default nextConfig
