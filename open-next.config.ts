import { defineCloudflareConfig, type OpenNextConfig } from "@opennextjs/cloudflare";

// 中文注释：先取 Cloudflare 默认适配配置，再在顶层补上 OpenNext 的真实 Next 构建命令。
const cloudflareConfig = defineCloudflareConfig();

// 中文注释：`build` 脚本将作为 Worker 构建入口，因此这里必须显式避开 `npm run build` 的递归调用。
const openNextConfig: OpenNextConfig = {
  ...cloudflareConfig,
  buildCommand: "npm run build:next",
};

export default openNextConfig;
