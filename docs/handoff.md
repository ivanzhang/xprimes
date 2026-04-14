# XPrimes 快速交接

更新日期：2026-04-14

这是一份给下一位开发同学的 5 分钟上手版交接。完整版本见：

- `docs/progress.md`

## 1. 一句话现状

`xprimes.cn` 已经上线可访问，但当前仍处于“公开站点已发布、后台 CMS 还没完工”的阶段。

## 2. 当前仓库信息

- 仓库根目录：`/opt/www/xprimes`
- 实际开发 worktree：`/opt/www/xprimes/.worktrees/xprimes-site`
- 当前分支：`feature/xprimes-site`
- 当前提交：`04c5c0e`

## 3. 已经完成的部分

### 已上线的公开页面

- `/`
- `/papers`
- `/log`
- `/review`

### 已完成的后台基础能力

- `/admin` 基础壳层
- 管理员邮箱白名单
- 日志后台：
  - 创建
  - 编辑
  - 删除
  - 置顶
  - 保存后立即发布

### 已完成的底层能力

- D1 schema 初稿
- Cloudflare 运行时封装
- 论文 repository 基础方法
- PDF 上传校验
- R2 上传封装
- `POST /api/admin/papers/upload`

## 4. 还没完成的重点

### 必做

1. 在 `wrangler.jsonc` 里补 D1 / R2 正式绑定
2. 创建并迁移 D1
3. 创建并绑定 R2
4. 完成论文后台：
   - `src/app/admin/papers/page.tsx`
   - `src/app/api/admin/papers/route.ts`
   - `src/app/api/admin/papers/[id]/route.ts`
5. 完成反质疑后台：
   - `src/app/admin/review/page.tsx`
   - `src/app/api/admin/review/route.ts`
   - `src/app/api/admin/review/[id]/route.ts`
   - `src/lib/validators/review.ts`

### 当前最大误区

不要误以为“站点上线 = 后台已经打通”。

当前真实情况是：

- 公开站点能访问
- 但线上内容主要还是 fallback 内容
- 生产 D1 / R2 还没接上
- 后台还不是最终可运营状态

## 5. 关键文件先看这些

### 需求与计划

- `design.md`
- `docs/progress.md`
- `docs/superpowers/specs/2026-04-12-xprimes-site-design.md`
- `docs/superpowers/plans/2026-04-12-xprimes-site.md`

### 部署与运行

- `package.json`
- `wrangler.jsonc`
- `src/lib/cloudflare/context.ts`

### 后台相关

- `src/lib/auth/admin-access.ts`
- `src/app/admin/layout.tsx`
- `src/app/admin/page.tsx`
- `src/app/admin/logs/page.tsx`
- `src/app/api/admin/logs/route.ts`
- `src/app/api/admin/logs/[id]/route.ts`
- `src/app/api/admin/papers/upload/route.ts`

### 数据层

- `migrations/0001_initial.sql`
- `src/lib/db/schema.ts`
- `src/lib/db/mappers.ts`
- `src/lib/repositories/log-repository.ts`
- `src/lib/repositories/paper-repository.ts`
- `src/lib/repositories/review-repository.ts`

## 6. 本地常用命令

### 本地开发

```bash
cd /opt/www/xprimes/.worktrees/xprimes-site
npm run dev
```

### Worker 预览

```bash
cd /opt/www/xprimes/.worktrees/xprimes-site
npm run preview
```

### 测试

```bash
cd /opt/www/xprimes/.worktrees/xprimes-site
npx vitest run
```

### 类型检查

```bash
cd /opt/www/xprimes/.worktrees/xprimes-site
npx tsc --noEmit
```

## 7. 部署注意事项

不要直接依赖 `/var/ops/bash/.env` 里的旧 Cloudflare token 去发 Worker。

原因：

- 它能识别账号
- 但不能正常调用 Workers 服务接口发布

这次成功上线依赖的是本机 Wrangler OAuth 登录态。

部署时建议显式去掉环境里的旧 Cloudflare 变量：

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
    npx wrangler deploy --config wrangler.jsonc --domains xprimes.cn --keep-vars
```

## 8. 当前线上状态

- 线上域名：`https://xprimes.cn`
- 当前 Worker 已部署
- 自定义域名已绑定
- 浏览器可正常打开首页

## 9. 推荐接手顺序

1. 先补 D1 / R2 生产绑定
2. 再把日志后台在生产环境真正跑通
3. 然后完成论文后台
4. 最后完成反质疑后台

如果只看一份文档就开工，请先看：

- `docs/progress.md`
