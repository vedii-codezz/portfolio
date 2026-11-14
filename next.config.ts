import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  turbopack: { root: process.cwd() },
  headers() {
    return [{
      source: "/certificates/:path*",
      headers: [{ key: "X-Robots-Tag", value: "noindex" }],
    }];
  },
};
export default nextConfig;
