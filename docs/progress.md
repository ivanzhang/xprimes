# XPrimes 项目进度与交接

更新日期：2026-04-14

本文档用于把 2026-04-12 至 2026-04-14 这几天已经完成、尚未完成、已验证、待补的内容一次性整理出来，方便下一位同学直接接手继续开发。

## 1. 项目背景与需求结论

这几天需求经历过一次明显收敛，最终结论如下：

- 站点技术路线采用 `Next.js + OpenNext + Cloudflare Worker` 一体化部署，不再回退到 Pages 纯静态方案。
- 目标域名是 `xprimes.cn`，优先使用 Cloudflare 免费方案上线。
- 首页内容结构最终确定为：
  1. 项目背景
  2. 论文版本
  3. 动态日志
  4. 反质疑页面
  5. 联系方式
- 联系邮箱以 `amy@xprimes.cn` 为主，`yiyi@xprimes.cn` 为辅。
- 后台未来需要保留“在线后台 / 表单入口”，支持直接维护内容，而不是继续手工改 Markdown。
- 首版后台目标明确为：
  - 登录后可发日志
  - 可增改论文版本
  - 可维护反质疑条目
  - 论文 PDF 需要支持直接上传
  - 日志保存后立即发布
  - 论文和反质疑支持“草稿 -> 发布”
- 后台白名单管理员邮箱固定为：
  - `amy@xprimes.cn`
  - `yiyi@xprimes.cn`
- UI 不是本阶段重点，先把基本功能和上线链路做通。

另外，项目中间有过“直接改 Markdown / JSON 最省事”的想法，但后续已经明确改为“方案 A：Worker + 后台 + D1 + R2”的正式路线，因此后续开发请以 `docs/superpowers/specs/2026-04-12-xprimes-site-design.md` 和 `docs/superpowers/plans/2026-04-12-xprimes-site.md` 为主。

## 2. 当前仓库与工作区信息

- 主仓库目录：`/opt/www/xprimes`
- 实际开发 worktree：`/opt/www/xprimes/.worktrees/xprimes-site`
- 当前分支：`feature/xprimes-site`
- 当前提交：`04c5c0e` `feat: add paper upload validation`
- 当前 worktree 状态：干净

本次交接文档写入的是：

- `docs/progress.md`

## 3. 这几天的工作时间线

### 2026-04-12

- 完成了站点设计规格与执行计划沉淀：
  - `docs/superpowers/specs/2026-04-12-xprimes-site-design.md`
  - `docs/superpowers/plans/2026-04-12-xprimes-site.md`
- 完成 Task 1 ~ Task 4 的主要工作：
  - 工程骨架、OpenNext Worker 方案
  - Cloudflare 运行时上下文封装
  - 后台邮箱白名单守卫
  - D1 初始化 schema
  - 前台四个公开页面
  - 后台基础 layout / shell / admin 首页

### 2026-04-13

- 完成 Task 5：日志后台能力
  - 日志新增 / 编辑 / 删除
  - 日志置顶
  - 前台首页和 `/log` 页面联动
  - 保存后立即发布
- 修复日志发布后的前台刷新问题：
  - 创建 / 更新 / 删除日志后会 `revalidatePath("/")` 和 `revalidatePath("/log")`
- 完成 Task 6 的前半段：
  - PDF 上传校验
  - R2 上传封装
  - `/api/admin/papers/upload` 接口
  - 论文 repository 的创建 / 更新基础能力
- 第一次尝试部署到 Cloudflare，但被 `/var/ops/bash/.env` 中的账号 token 权限卡住，无法调用 Workers 服务接口。

### 2026-04-14

- 重新处理 Cloudflare 登录与发布链路。
- 发现 `wrangler login` 在本机存在 `localhost:8976` OAuth 回调不稳定的问题，导致浏览器授权后本地回调经常失败或 state 不匹配。
- 采用“手动 OAuth 交换 code -> access token -> 写入 `~/.wrangler/config/default.toml`”的方式恢复 Wrangler OAuth 登录。
- 使用当前 OAuth 登录成功发布 Worker，并把 `xprimes.cn` 绑定为自定义域名。
- 完成线上 DNS / HTTP / 浏览器三层验证。
- 重新跑了测试与类型检查，确认当前代码基线可继续开发。

## 4. 当前已完成的功能

### 4.1 前台公开站点

已完成以下页面：

- `/`
- `/papers`
- `/log`
- `/review`

当前首页已经按需求落成这几块内容：

- 项目背景
- 论文版本入口
- 动态日志入口与最近动态
- 反质疑入口
- 联系方式

关键文件：

- `src/app/page.tsx`
- `src/app/papers/page.tsx`
- `src/app/log/page.tsx`
- `src/app/review/page.tsx`
- `src/components/site/log-list.tsx`
- `src/components/site/paper-list.tsx`
- `src/components/site/review-list.tsx`

说明：

- 公开页当前支持在没有 D1 运行时绑定时自动回退到内置 fallback 内容。
- 这也是为什么当前线上站点能正常展示，但并不是后台驱动的“正式生产内容源”。

### 4.2 Cloudflare 运行时封装

已完成：

- Worker 运行时上下文统一读取
- D1 / R2 / ASSETS 绑定的统一入口
- 当运行时缺失时，公开页可以回退，后台 API 会抛出受控错误

关键文件：

- `src/lib/cloudflare/context.ts`

代码目前约定的绑定名是：

- `DB`
- `R2`
- `ASSETS`

### 4.3 管理员身份识别

已完成后台白名单身份解析逻辑：

- 从请求头 `cf-access-authenticated-user-email` 提取登录邮箱
- 仅允许：
  - `amy@xprimes.cn`
  - `yiyi@xprimes.cn`

关键文件：

- `src/lib/auth/admin-access.ts`

说明：

- 代码侧白名单已经就位。
- 但 Cloudflare Access 的线上策略是否已经完整配置，不在本次代码交付中。
- 如果 Cloudflare Access 没有把上述 header 正常注入，后台仍然会被判定为未授权。

### 4.4 后台基础页面

已完成：

- `/admin`
- `/admin/layout`
- 后台导航与壳层

关键文件：

- `src/app/admin/layout.tsx`
- `src/app/admin/page.tsx`
- `src/components/admin/admin-shell.tsx`
- `src/components/admin/admin-nav.tsx`
- `src/components/admin/empty-state.tsx`

### 4.5 日志后台能力

这部分是目前完成度最高的后台模块，已经具备最小可用能力。

已完成：

- 后台日志管理页
- 日志创建
- 日志更新
- 日志删除
- 日志置顶
- 操作审计日志记录
- 前台首页和 `/log` 自动刷新
- “日志无草稿态，保存即发布”已落实

关键文件：

- `src/app/admin/logs/page.tsx`
- `src/app/api/admin/logs/route.ts`
- `src/app/api/admin/logs/[id]/route.ts`
- `src/components/admin/log-form.tsx`
- `src/components/admin/log-table.tsx`
- `src/lib/validators/log.ts`
- `src/lib/repositories/log-repository.ts`
- `src/lib/repositories/activity-repository.ts`

当前状态说明：

- 如果 D1 没有绑定，后台日志页会显示“尚未连接内容数据库”的空状态。
- 也就是说：代码已经完成，但生产环境还没有把 D1 真正接上。

### 4.6 D1 schema 与 repository 基础层

已完成：

- 初始迁移 SQL
- `logs`
- `papers`
- `review_items`
- `activity_logs`

关键文件：

- `migrations/0001_initial.sql`
- `src/lib/db/schema.ts`
- `src/lib/db/mappers.ts`
- `src/lib/repositories/log-repository.ts`
- `src/lib/repositories/paper-repository.ts`
- `src/lib/repositories/review-repository.ts`
- `src/lib/repositories/fallback-content.ts`

说明：

- `paper-repository` 已经具备“创建 / 更新 / 前台列表 / 后台列表”的基础方法。
- `review-repository` 目前还只是公开 fallback 映射，尚未真正接 D1 读写。

### 4.7 论文 PDF 上传能力（半完成）

这部分完成的是“上传链路”，不是“完整论文后台”。

已完成：

- PDF 文件类型校验
- 20MB 大小校验
- R2 上传封装
- 论文上传接口 `POST /api/admin/papers/upload`

关键文件：

- `src/lib/validators/paper.ts`
- `src/lib/r2/paper-storage.ts`
- `src/app/api/admin/papers/upload/route.ts`
- `src/lib/repositories/paper-repository.ts`

当前状态说明：

- 只能上传 PDF 到 R2，并返回文件元数据。
- 还没有完整的论文后台页面。
- 还没有论文 create / update / publish 的 API 路由。
- 还没有验证“上传后的 PDF 在前台是否能通过最终下载地址访问”。

## 5. 当前明确未完成 / 半成品 / 风险点

下面这些是下一位同学最需要接着做的内容。

### 5.1 Cloudflare 基础设施绑定尚未补齐

`wrangler.jsonc` 目前仍然是最小配置，只包含：

- Worker 名称
- `main`
- `compatibility_date`
- `compatibility_flags`
- `assets`

还没有这些关键绑定：

- `d1_databases`
- `r2_buckets`
- 其他正式生产 `vars`

直接结果：

- 当前线上公开站点能访问，但依赖 D1 / R2 的后台正式能力还没真正打通。
- 日志后台在生产如果没有 D1，会停留在空状态提示。
- 论文上传接口在生产如果没有 R2，会返回受控错误。

### 5.2 D1 迁移还没有真正落到生产环境

虽然迁移文件已经写好：

- `migrations/0001_initial.sql`

但本次没有完成：

- 创建 D1 数据库
- 在 `wrangler.jsonc` 里绑定 `DB`
- 执行 D1 migration

所以当前线上内容不是从 D1 来的，而是 fallback 内容。

### 5.3 R2 还没有完成正式接入

虽然代码已约定绑定名 `R2`，但当前仍缺：

- 创建 R2 bucket
- 在 `wrangler.jsonc` 里绑定 `R2`
- 论文 PDF 的正式公开访问策略

补充说明：

- `src/lib/db/mappers.ts` 当前把论文下载地址映射成 `/${row.pdf_key}`。
- 但这不等于 R2 文件已经能被前台直接访问。
- 后续需要明确一条正式文件访问方案，例如：
  - 通过 Worker route 代理 R2 文件
  - 或绑定自定义公开 bucket 域名
  - 或单独实现文件下载 API

### 5.4 论文后台没有完成

当前不存在这些关键文件：

- `src/app/admin/papers/page.tsx`
- `src/app/api/admin/papers/route.ts`
- `src/app/api/admin/papers/[id]/route.ts`

所以目前“论文后台”只完成了上传接口和 repository 基础方法，没有完整管理体验。

### 5.5 反质疑后台没有开始实现

当前不存在这些关键文件：

- `src/app/admin/review/page.tsx`
- `src/app/api/admin/review/route.ts`
- `src/app/api/admin/review/[id]/route.ts`
- `src/lib/validators/review.ts`

并且：

- `src/lib/repositories/review-repository.ts` 现在还是 fallback-only
- 没有 D1 读写
- 没有草稿 / 发布管理

### 5.6 Cloudflare Access 线上策略未在代码层完成闭环

代码只做了：

- 解析 `cf-access-authenticated-user-email`
- 做白名单校验

但未在仓库里固化这些 Cloudflare 侧配置：

- `/admin/*` 的 Access 保护策略
- 允许的邮箱规则
- 任何 Access 应用配置文档

因此下一位同学接手时，需要确认 Cloudflare 仪表盘里是否已经把 `/admin/*` 真正保护好。

### 5.7 线上当前展示的是 fallback 内容，不是正式 CMS 数据

这是当前状态里最容易被误解的一点。

当前线上 `https://xprimes.cn` 能访问，但：

- 日志内容来自 fallback / 内置内容
- 论文计数和反质疑计数不是后台驱动结果
- 不是“管理员发布后就会立刻映射到线上”的最终状态

换句话说：

- 站点“上线了”
- 但“后台驱动内容生产”还没真正上线

### 5.8 小问题

- `favicon.ico` 当前缺失，浏览器控制台会有一个 404
- 不影响主流程，但后续可以顺手补掉

## 6. Cloudflare 部署与凭据注意事项

### 6.1 当前线上状态

2026-04-14 已成功部署到：

- `https://xprimes.cn`

本次部署输出关键信息：

- Worker 名称：`xprimes-site`
- 自定义域名：`xprimes.cn`
- 当前部署版本 ID：`f644c8eb-fcc7-4908-b71d-edfcaff8117d`

### 6.2 重要：`/var/ops/bash/.env` 里的 token 不能直接用于发布 Worker

当前在 `/var/ops/bash/.env` 中能找到：

- `CLOUDFLARE_EMAIL`
- `CLOUDFLARE_KEY`
- `CLOUDFLARE_ACCOUNT`

但是实际验证结果是：

- 这个 `CLOUDFLARE_KEY` 可以让 `wrangler whoami` 识别账号
- 也可以查询 zone
- 但调用 Workers 服务接口会报 403 / `Authentication error [code: 10000]`
- 因此它不能直接完成 Worker 发布

这也是为什么前一天部署一直失败。

### 6.3 这次成功部署依赖的是本机 Wrangler OAuth 登录

本次实际处理方式：

- 手动完成 Cloudflare OAuth 授权
- 手动交换 access token / refresh token
- 写入 `~/.wrangler/config/default.toml`

所以后续如果要继续发布，建议优先使用本机 Wrangler OAuth 登录，而不是直接依赖 `.env` 里的旧 token。

### 6.4 下次部署建议命令

为了避免 `.env` 里的旧 token 覆盖本机 OAuth，建议用下面这种方式部署：

```bash
cd /opt/www/xprimes/.worktrees/xprimes-site

env -u CLOUDFLARE_API_TOKEN \
    -u CLOUDFLARE_ACCOUNT_ID \
    -u CLOUDFLARE_EMAIL \
    -u CLOUDFLARE_KEY \
    -u CLOUDFLARE_API_KEY \
    -u CF_API_TOKEN \
    -u CF_API_KEY \
    -u CF_EMAIL \
    npm run build:worker

env -u CLOUDFLARE_API_TOKEN \
    -u CLOUDFLARE_ACCOUNT_ID \
    -u CLOUDFLARE_EMAIL \
    -u CLOUDFLARE_KEY \
    -u CLOUDFLARE_API_KEY \
    -u CF_API_TOKEN \
    -u CF_API_KEY \
    -u CF_EMAIL \
    npx wrangler deploy --config wrangler.jsonc --domains xprimes.cn --keep-vars
```

本地预览命令：

```bash
cd /opt/www/xprimes/.worktrees/xprimes-site
npm run preview
```

## 7. 当前可直接参考的关键文件

### 7.1 需求 / 设计 / 计划

- `design.md`
- `docs/superpowers/specs/2026-04-12-xprimes-site-design.md`
- `docs/superpowers/plans/2026-04-12-xprimes-site.md`

### 7.2 部署与运行

- `package.json`
- `wrangler.jsonc`
- `next.config.ts`
- `src/lib/cloudflare/context.ts`

### 7.3 后台鉴权

- `src/lib/auth/admin-access.ts`

### 7.4 日志后台

- `src/app/admin/logs/page.tsx`
- `src/app/api/admin/logs/route.ts`
- `src/app/api/admin/logs/[id]/route.ts`
- `src/components/admin/log-form.tsx`
- `src/components/admin/log-table.tsx`
- `src/lib/validators/log.ts`
- `src/lib/repositories/log-repository.ts`

### 7.5 论文相关

- `src/app/api/admin/papers/upload/route.ts`
- `src/lib/validators/paper.ts`
- `src/lib/r2/paper-storage.ts`
- `src/lib/repositories/paper-repository.ts`
- `src/lib/db/mappers.ts`

### 7.6 反质疑相关

- `src/lib/repositories/review-repository.ts`

### 7.7 数据结构

- `migrations/0001_initial.sql`
- `src/lib/db/schema.ts`
- `src/lib/db/mappers.ts`

## 8. 已完成验证

以下验证都是这次交接前重新执行过的，不是旧记录：

### 8.1 测试

执行：

```bash
cd /opt/www/xprimes/.worktrees/xprimes-site
npx vitest run
```

结果：

- `9` 个测试文件通过
- `41` 个测试通过

### 8.2 类型检查

执行：

```bash
cd /opt/www/xprimes/.worktrees/xprimes-site
npx tsc --noEmit
```

结果：

- 通过

### 8.3 Worker 构建

执行：

```bash
cd /opt/www/xprimes/.worktrees/xprimes-site
npm run build:worker
```

结果：

- 构建通过
- 该构建也已用于本次实际线上部署

### 8.4 线上访问

执行：

```bash
curl -I https://xprimes.cn
curl https://xprimes.cn
```

验证结果：

- 返回 `HTTP/2 200`
- 响应头包含 `server: cloudflare`
- 响应头包含 `x-opennext: 1`
- HTML 中包含 `<title>XPrimes</title>`

### 8.5 浏览器验证

使用 Playwright 实际打开：

- `https://xprimes.cn`

验证结果：

- 页面可打开
- 标题为 `XPrimes`

## 9. 建议下一位同学按这个顺序继续

### P0：把生产数据链路补齐

1. 创建并绑定 D1 数据库
2. 创建并绑定 R2 bucket
3. 更新 `wrangler.jsonc`
4. 执行 `migrations/0001_initial.sql`
5. 确认生产环境下 `/admin/logs` 能真正读写 D1

### P1：补齐论文后台

1. 新建 `src/app/admin/papers/page.tsx`
2. 新建 `src/app/api/admin/papers/route.ts`
3. 新建 `src/app/api/admin/papers/[id]/route.ts`
4. 打通草稿 / 发布流程
5. 打通上传后 PDF 的前台访问链路

### P2：补齐反质疑后台

1. 新建 `src/lib/validators/review.ts`
2. 新建 `src/app/admin/review/page.tsx`
3. 新建 `src/app/api/admin/review/route.ts`
4. 新建 `src/app/api/admin/review/[id]/route.ts`
5. 把 `src/lib/repositories/review-repository.ts` 改成真正的 D1 驱动

### P3：补强生产配置

1. 明确 Cloudflare Access 的 `/admin/*` 保护方案
2. 把部署流程整理成正式文档
3. 视情况增加 `docs/cloudflare-deploy.md`
4. 补 favicon 等小问题

## 10. 最后一句话总结当前真实状态

当前项目已经完成：

- 公开官网骨架
- 后台基础壳层
- 日志模块的主要功能
- 论文 PDF 上传链路前半段
- Cloudflare Worker 上线与域名绑定

但还没有完成：

- D1 / R2 正式生产绑定
- 论文后台完整闭环
- 反质疑后台完整闭环
- 真正可用的生产内容后台

所以最准确的描述是：

`xprimes.cn` 已经上线可访问，但当前仍是“站点已发布、CMS 后台未完工”的阶段。
