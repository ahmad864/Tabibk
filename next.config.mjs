/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'api.dicebear.com' },
      { protocol: 'https', hostname: 'nnjhkpsnmezcfdgzpjqa.supabase.co' },
    ],
  },
}
export default nextConfig
