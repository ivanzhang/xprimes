import type { NextConfig } from "next";

// 中文注释：OpenNext 官方建议在开发环境初始化 Cloudflare 上下文，便于 next dev 使用绑定。
import("@opennextjs/cloudflare").then((mod) => mod.initOpenNextCloudflareForDev());

const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default nextConfig;
