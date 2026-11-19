import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["macbook-air-dmitrii.tail566708.ts.net"],
  async rewrites() {
    const backend = process.env.BACKEND_PROXY_URL;
    return backend
      ? [{ source: "/api/:path*", destination: `${backend}/api/:path*` }]
      : [];
  },
};

export default nextConfig;
