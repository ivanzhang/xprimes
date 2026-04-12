import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import type { NextConfig } from "next";

// 中文注释：开发时初始化 Cloudflare 绑定上下文，保证 next dev 与 Worker 适配器一致。
initOpenNextCloudflareForDev();

const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default nextConfig;
