import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // 실기기(폰) 테스트용 — 같은 네트워크 IP에서 dev 리소스(/_next/*) 접근 허용
  allowedDevOrigins: ['192.168.1.117'],
  turbopack: {
    root: process.cwd(),
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
}

export default nextConfig
