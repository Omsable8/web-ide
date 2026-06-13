/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5000/api/:path*',
      },
      {
        source: '/token/:path*',
        destination: 'http://localhost:5000/token/:path*',
      },
      {
        source: '/service/execute/:path*',
        destination: 'http://localhost:5001/service/execute/:path*',
      },
      {
        source: '/service/ai/:path*',
        destination: 'http://localhost:5002/service/ai/:path*',
      },
    ];
  },
}

export default nextConfig
