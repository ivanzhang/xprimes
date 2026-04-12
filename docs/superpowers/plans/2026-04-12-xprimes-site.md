# XPrimes Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个部署到 Cloudflare Workers 的 XPrimes 官网与私有后台，支持后台登录、日志即时发布、论文 PDF 上传与草稿发布、反质疑条目草稿发布。

**Architecture:** 使用 Next.js App Router 构建前台与后台页面，借助 `@opennextjs/cloudflare` 部署到单个 Cloudflare Worker。公开内容与后台元数据存于 D1，论文 PDF 存于 R2，`/admin/*` 通过 Cloudflare Access 和应用内邮箱白名单双重保护。

**Tech Stack:** Next.js、React、TypeScript、`@opennextjs/cloudflare`、Cloudflare Workers / D1 / R2、Zod、React Markdown、Vitest、Testing Library、Playwright、Wrangler。

---

## File Structure

- `package.json`：项目脚本、依赖与本地/部署命令
- `tsconfig.json`：TypeScript 配置
- `next.config.ts`：Next.js 配置
- `open-next.config.ts`：Cloudflare OpenNext 适配配置
- `wrangler.jsonc`：Worker、D1、R2、自定义域名绑定配置
- `cloudflare-env.d.ts`：Cloudflare 绑定类型声明
- `.gitignore`：忽略构建产物、环境文件、Playwright 输出
- `src/app/layout.tsx`：全局布局
- `src/app/globals.css`：全局样式
- `src/app/page.tsx`：首页
- `src/app/papers/page.tsx`：论文版本页
- `src/app/log/page.tsx`：动态日志页
- `src/app/review/page.tsx`：反质疑页
- `src/app/admin/layout.tsx`：后台布局与登录保护
- `src/app/admin/page.tsx`：后台首页
- `src/app/admin/logs/page.tsx`：日志管理页
- `src/app/admin/papers/page.tsx`：论文管理页
- `src/app/admin/review/page.tsx`：反质疑管理页
- `src/app/api/admin/logs/route.ts`：日志新增接口
- `src/app/api/admin/logs/[id]/route.ts`：日志更新/删除接口
- `src/app/api/admin/papers/route.ts`：论文新增接口
- `src/app/api/admin/papers/[id]/route.ts`：论文更新/发布接口
- `src/app/api/admin/papers/upload/route.ts`：论文 PDF 上传接口
- `src/app/api/admin/review/route.ts`：反质疑新增接口
- `src/app/api/admin/review/[id]/route.ts`：反质疑更新/发布接口
- `src/components/site/`：前台页面组件
- `src/components/admin/`：后台页面组件
- `src/lib/auth/admin-access.ts`：Cloudflare Access 身份解析与白名单校验
- `src/lib/cloudflare/context.ts`：D1 / R2 / 环境变量读取入口
- `src/lib/db/schema.ts`：表结构常量与类型
- `src/lib/db/mappers.ts`：数据库记录与视图模型转换
- `src/lib/markdown.ts`：Markdown 渲染与安全过滤
- `src/lib/repositories/log-repository.ts`：日志数据访问
- `src/lib/repositories/paper-repository.ts`：论文数据访问
- `src/lib/repositories/review-repository.ts`：反质疑数据访问
- `src/lib/repositories/activity-repository.ts`：审计日志写入
- `src/lib/r2/paper-storage.ts`：PDF 上传与删除封装
- `src/lib/validators/log.ts`：日志表单校验
- `src/lib/validators/paper.ts`：论文表单校验
- `src/lib/validators/review.ts`：反质疑表单校验
- `migrations/0001_initial.sql`：D1 初始化 SQL
- `scripts/seed-local.ts`：本地种子数据脚本
- `tests/unit/`：单元测试
- `tests/integration/`：集成测试
- `tests/e2e/`：端到端测试
- `tests/setup.ts`：Vitest 与 Testing Library 初始化
- `vitest.config.ts`：Vitest 配置
- `playwright.config.ts`：Playwright 配置
- `README.md`：开发、预览、部署说明
- `docs/cloudflare-deploy.md`：Cloudflare 配置与上线步骤

> 约定：生成型脚手架与纯配置文件允许先创建骨架，再对自定义逻辑执行 TDD；所有自写生产代码必须遵守 `@test-driven-development`。

### Task 1: 初始化 Next.js + Cloudflare Worker 工程骨架

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `open-next.config.ts`
- Create: `wrangler.jsonc`
- Create: `cloudflare-env.d.ts`
- Create: `.gitignore`
- Create: `vitest.config.ts`
- Create: `tests/setup.ts`
- Create: `src/app/layout.tsx`
- Create: `src/app/globals.css`
- Create: `src/app/page.tsx`
- Test: `tests/unit/home-page.test.tsx`

- [ ] **Step 1: 创建基础工程骨架并安装依赖**

```bash
npm init -y
npm install next react react-dom zod react-markdown remark-gfm rehype-sanitize remark remark-html
npm install @opennextjs/cloudflare wrangler
npm install -D typescript @types/node @types/react @types/react-dom vitest jsdom @testing-library/react @testing-library/jest-dom playwright @playwright/test eslint eslint-config-next
mkdir -p src/app tests/unit
```

说明：这一小步只创建框架与配置骨架，属于生成/配置准备，不计入业务代码 TDD 例外之外的实现。

- [ ] **Step 2: 写首页最小烟雾测试**

```tsx
// tests/unit/home-page.test.tsx
import { render, screen } from '@testing-library/react'
import HomePage from '@/app/page'

describe('HomePage', () => {
  it('展示项目主标题与主邮箱', () => {
    render(<HomePage />)

    expect(screen.getByRole('heading', { name: /XPrimes/i })).toBeInTheDocument()
    expect(screen.getByText('amy@xprimes.cn')).toBeInTheDocument()
  })
})
```

- [ ] **Step 3: 运行测试并确认失败原因正确**

Run: `npx vitest run tests/unit/home-page.test.tsx`
Expected: FAIL，提示 `Cannot find module '@/app/page'` 或组件不存在。

- [ ] **Step 4: 实现最小首页与全局配置**

```tsx
// src/app/page.tsx
export default function HomePage() {
  return (
    <main>
      {/* 中文注释：首版首页先提供最小可验证内容，后续任务再补完整模块 */}
      <h1>XPrimes</h1>
      <p>结构化素数研究项目官网</p>
      <p>主联系邮箱：amy@xprimes.cn</p>
    </main>
  )
}
```

```ts
// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
}

export default nextConfig
```

```ts
// open-next.config.ts
import { defineCloudflareConfig } from '@opennextjs/cloudflare'

export default defineCloudflareConfig()
```

```jsonc
// wrangler.jsonc
{
  "name": "xprimes-site",
  "main": ".open-next/worker.js",
  "compatibility_date": "2026-04-12",
  "compatibility_flags": ["nodejs_compat"]
}
```

使用示例：

```bash
npm run dev
npm run preview
```

- [ ] **Step 5: 运行测试确认通过，并提交骨架**

Run: `npx vitest run tests/unit/home-page.test.tsx`
Expected: PASS

Run: `git add package.json tsconfig.json next.config.ts open-next.config.ts wrangler.jsonc cloudflare-env.d.ts .gitignore vitest.config.ts tests/setup.ts src/app/layout.tsx src/app/globals.css src/app/page.tsx tests/unit/home-page.test.tsx && git commit -m "chore: bootstrap next worker app"`

### Task 2: 建立环境绑定、认证守卫与数据库初始结构

**Files:**
- Create: `src/lib/cloudflare/context.ts`
- Create: `src/lib/auth/admin-access.ts`
- Create: `src/lib/db/schema.ts`
- Create: `migrations/0001_initial.sql`
- Create: `tests/unit/admin-access.test.ts`
- Create: `tests/unit/schema.test.ts`

- [ ] **Step 1: 先写认证白名单测试**

```ts
// tests/unit/admin-access.test.ts
import { describe, expect, it } from 'vitest'
import { getAdminIdentity, isAllowedAdminEmail } from '@/lib/auth/admin-access'

describe('admin access', () => {
  it('允许白名单邮箱进入后台', () => {
    expect(isAllowedAdminEmail('amy@xprimes.cn')).toBe(true)
    expect(isAllowedAdminEmail('yiyi@xprimes.cn')).toBe(true)
  })

  it('拒绝非白名单邮箱', () => {
    expect(isAllowedAdminEmail('other@example.com')).toBe(false)
  })

  it('从请求头解析 Access 邮箱', () => {
    const request = new Request('https://xprimes.cn/admin', {
      headers: { 'cf-access-authenticated-user-email': 'amy@xprimes.cn' },
    })

    expect(getAdminIdentity(request)?.email).toBe('amy@xprimes.cn')
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npx vitest run tests/unit/admin-access.test.ts`
Expected: FAIL，提示 `admin-access.ts` 不存在。

- [ ] **Step 3: 写最小认证与表结构实现**

```ts
// src/lib/auth/admin-access.ts
const ALLOWED_EMAILS = ['amy@xprimes.cn', 'yiyi@xprimes.cn'] as const

export function isAllowedAdminEmail(email: string) {
  return ALLOWED_EMAILS.includes(email as (typeof ALLOWED_EMAILS)[number])
}

export function getAdminIdentity(request: Request) {
  const email = request.headers.get('cf-access-authenticated-user-email')

  if (!email || !isAllowedAdminEmail(email)) {
    return null
  }

  return { email }
}
```

```sql
-- migrations/0001_initial.sql
CREATE TABLE logs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt_en TEXT,
  published_at TEXT NOT NULL,
  is_pinned INTEGER NOT NULL DEFAULT 0,
  author_email TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE papers (
  id TEXT PRIMARY KEY,
  version TEXT NOT NULL UNIQUE,
  title_zh TEXT NOT NULL,
  title_en TEXT NOT NULL,
  abstract_zh TEXT NOT NULL,
  abstract_en TEXT,
  pdf_key TEXT NOT NULL,
  pdf_filename TEXT NOT NULL,
  pdf_size INTEGER NOT NULL,
  publish_date TEXT,
  status TEXT NOT NULL CHECK (status IN ('draft', 'published')),
  author_email TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE review_items (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  item_type TEXT NOT NULL CHECK (item_type IN ('open', 'resolved')),
  title TEXT NOT NULL,
  reference TEXT NOT NULL,
  question_body TEXT NOT NULL,
  response_body TEXT,
  status TEXT NOT NULL CHECK (status IN ('draft', 'published')),
  updated_by TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE activity_logs (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL,
  operator_email TEXT NOT NULL,
  payload_snapshot TEXT NOT NULL,
  created_at TEXT NOT NULL
);
```

使用示例：

```ts
const identity = getAdminIdentity(request)
if (!identity) {
  return new Response('Unauthorized', { status: 401 })
}
```

- [ ] **Step 4: 为 schema 增加最小测试并跑通**

```ts
// tests/unit/schema.test.ts
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('initial schema', () => {
  it('包含 4 张核心表', () => {
    const sql = readFileSync('migrations/0001_initial.sql', 'utf8')
    expect(sql).toContain('CREATE TABLE logs')
    expect(sql).toContain('CREATE TABLE papers')
    expect(sql).toContain('CREATE TABLE review_items')
    expect(sql).toContain('CREATE TABLE activity_logs')
  })
})
```

Run: `npx vitest run tests/unit/admin-access.test.ts tests/unit/schema.test.ts`
Expected: PASS

- [ ] **Step 5: 提交认证与数据库基础设施**

Run: `git add src/lib/cloudflare/context.ts src/lib/auth/admin-access.ts src/lib/db/schema.ts migrations/0001_initial.sql tests/unit/admin-access.test.ts tests/unit/schema.test.ts && git commit -m "feat: add admin access and d1 schema"`

### Task 3: 构建公共内容仓储与前台四个页面

**Files:**
- Create: `src/lib/db/mappers.ts`
- Create: `src/lib/repositories/log-repository.ts`
- Create: `src/lib/repositories/paper-repository.ts`
- Create: `src/lib/repositories/review-repository.ts`
- Create: `src/components/site/section-heading.tsx`
- Create: `src/components/site/contact-card.tsx`
- Create: `src/components/site/log-list.tsx`
- Create: `src/components/site/paper-list.tsx`
- Create: `src/components/site/review-list.tsx`
- Modify: `src/app/page.tsx`
- Create: `src/app/papers/page.tsx`
- Create: `src/app/log/page.tsx`
- Create: `src/app/review/page.tsx`
- Test: `tests/unit/public-content.test.ts`

- [ ] **Step 1: 先写公共内容视图模型测试**

```ts
// tests/unit/public-content.test.ts
import { describe, expect, it } from 'vitest'
import { mapPaperRowToPublicItem, mapReviewRowToSections } from '@/lib/db/mappers'

describe('public content mappers', () => {
  it('仅把已发布论文映射到前台卡片', () => {
    const item = mapPaperRowToPublicItem({
      id: 'p1',
      version: 'v0.1',
      title_zh: '结构初稿',
      title_en: 'Initial Structure',
      abstract_zh: '摘要',
      abstract_en: 'Abstract',
      pdf_key: 'papers/v0.1.pdf',
      pdf_filename: 'v0.1.pdf',
      pdf_size: 100,
      publish_date: '2026-04-12',
      status: 'published',
      author_email: 'amy@xprimes.cn',
      created_at: '2026-04-12T00:00:00.000Z',
      updated_at: '2026-04-12T00:00:00.000Z',
    })

    expect(item.version).toBe('v0.1')
    expect(item.downloadLabel).toContain('PDF')
  })

  it('按 open 和 resolved 分组已发布质疑条目', () => {
    const result = mapReviewRowToSections([
      { id: '1', code: 'Q-001', item_type: 'open', title: '问题', reference: '定义 2.1', question_body: '描述', response_body: '', status: 'published', updated_by: 'amy@xprimes.cn', created_at: '', updated_at: '' },
      { id: '2', code: 'R-001', item_type: 'resolved', title: '回应', reference: '定理 1', question_body: '旧问题', response_body: '已修正', status: 'published', updated_by: 'amy@xprimes.cn', created_at: '', updated_at: '' },
    ])

    expect(result.openItems).toHaveLength(1)
    expect(result.resolvedItems).toHaveLength(1)
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npx vitest run tests/unit/public-content.test.ts`
Expected: FAIL，提示 `mappers.ts` 中函数不存在。

- [ ] **Step 3: 实现前台仓储、映射与页面**

```ts
// src/lib/db/mappers.ts
export function mapPaperRowToPublicItem(row: PaperRow) {
  return {
    id: row.id,
    version: row.version,
    title: row.title_zh,
    subtitle: row.title_en,
    publishDate: row.publish_date,
    abstract: row.abstract_zh,
    abstractEn: row.abstract_en,
    downloadLabel: `下载 PDF（${row.pdf_filename}）`,
  }
}
```

```tsx
// src/app/papers/page.tsx
export default async function PapersPage() {
  const papers = await listPublishedPapers()

  return (
    <main>
      {/* 中文注释：仅渲染已发布论文，草稿留在后台 */}
      <h1>论文版本</h1>
      <PaperList papers={papers} />
    </main>
  )
}
```

使用示例：

```tsx
<PaperList
  papers={[
    {
      id: 'p1',
      version: 'v0.1',
      title: '结构初稿',
      subtitle: 'Initial Structure',
      publishDate: '2026-04-12',
      abstract: '这是首版摘要。',
      abstractEn: 'This is the first abstract.',
      downloadLabel: '下载 PDF（v0.1.pdf）',
      downloadUrl: '/api/files/papers/v0.1.pdf',
    },
  ]}
/>
```

- [ ] **Step 4: 运行前台测试并补足页面渲染断言**

在 `tests/unit/public-content.test.ts` 追加对首页快速入口和联系邮箱的断言，然后运行：

Run: `npx vitest run tests/unit/home-page.test.tsx tests/unit/public-content.test.ts`
Expected: PASS

- [ ] **Step 5: 提交前台页面与仓储层**

Run: `git add src/lib/db/mappers.ts src/lib/repositories/log-repository.ts src/lib/repositories/paper-repository.ts src/lib/repositories/review-repository.ts src/components/site src/app/page.tsx src/app/papers/page.tsx src/app/log/page.tsx src/app/review/page.tsx tests/unit/public-content.test.ts && git commit -m "feat: add public site pages"`

### Task 4: 建立后台布局、身份守卫与管理首页

**Files:**
- Create: `src/components/admin/admin-shell.tsx`
- Create: `src/components/admin/admin-nav.tsx`
- Create: `src/components/admin/empty-state.tsx`
- Create: `src/app/admin/layout.tsx`
- Create: `src/app/admin/page.tsx`
- Create: `tests/integration/admin-layout.test.tsx`

- [ ] **Step 1: 先写后台守卫测试**

```tsx
// tests/integration/admin-layout.test.tsx
import { describe, expect, it } from 'vitest'
import { requireAdminIdentity } from '@/lib/auth/admin-access'

describe('requireAdminIdentity', () => {
  it('在缺少 Access 邮箱时抛出未授权错误', () => {
    const request = new Request('https://xprimes.cn/admin')
    expect(() => requireAdminIdentity(request)).toThrow(/Unauthorized/)
  })

  it('允许白名单邮箱通过', () => {
    const request = new Request('https://xprimes.cn/admin', {
      headers: { 'cf-access-authenticated-user-email': 'amy@xprimes.cn' },
    })

    expect(requireAdminIdentity(request).email).toBe('amy@xprimes.cn')
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npx vitest run tests/integration/admin-layout.test.tsx`
Expected: FAIL，提示 `requireAdminIdentity` 未实现。

- [ ] **Step 3: 实现后台守卫与首页**

```ts
// src/lib/auth/admin-access.ts
export function requireAdminIdentity(request: Request) {
  const identity = getAdminIdentity(request)

  if (!identity) {
    throw new Error('Unauthorized admin access')
  }

  return identity
}
```

```tsx
// src/app/admin/page.tsx
export default function AdminHomePage() {
  return (
    <section>
      {/* 中文注释：后台首页只给出最核心的三个管理入口 */}
      <h1>内容后台</h1>
      <ul>
        <li>动态日志管理</li>
        <li>论文版本管理</li>
        <li>反质疑条目管理</li>
      </ul>
    </section>
  )
}
```

- [ ] **Step 4: 运行测试并补一条后台页面渲染断言**

Run: `npx vitest run tests/integration/admin-layout.test.tsx`
Expected: PASS

- [ ] **Step 5: 提交后台基础布局**

Run: `git add src/components/admin src/app/admin/layout.tsx src/app/admin/page.tsx src/lib/auth/admin-access.ts tests/integration/admin-layout.test.tsx && git commit -m "feat: add admin shell and auth guard"`

### Task 5: 实现日志即时发布功能（校验、接口、后台页）

**Files:**
- Create: `src/lib/validators/log.ts`
- Create: `src/app/api/admin/logs/route.ts`
- Create: `src/app/api/admin/logs/[id]/route.ts`
- Create: `src/components/admin/log-form.tsx`
- Create: `src/components/admin/log-table.tsx`
- Modify: `src/app/admin/logs/page.tsx`
- Test: `tests/unit/log-validator.test.ts`
- Test: `tests/integration/log-route.test.ts`

- [ ] **Step 1: 先写日志校验测试**

```ts
// tests/unit/log-validator.test.ts
import { describe, expect, it } from 'vitest'
import { logInputSchema } from '@/lib/validators/log'

describe('logInputSchema', () => {
  it('要求标题、正文和发布时间必填', () => {
    const result = logInputSchema.safeParse({
      title: '',
      content: '',
      publishedAt: '',
      isPinned: false,
    })

    expect(result.success).toBe(false)
  })

  it('接受合法日志并默认立即发布', () => {
    const result = logInputSchema.safeParse({
      title: '发布首条日志',
      content: '今天开始建立官方网站。',
      publishedAt: '2026-04-12',
      isPinned: true,
    })

    expect(result.success).toBe(true)
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npx vitest run tests/unit/log-validator.test.ts`
Expected: FAIL，提示 `log.ts` 不存在。

- [ ] **Step 3: 实现日志校验、接口与后台页**

```ts
// src/lib/validators/log.ts
import { z } from 'zod'

export const logInputSchema = z.object({
  title: z.string().trim().min(1, '标题不能为空'),
  content: z.string().trim().min(1, '正文不能为空'),
  publishedAt: z.string().trim().min(1, '发布时间不能为空'),
  excerptEn: z.string().trim().optional().default(''),
  isPinned: z.boolean().default(false),
})
```

```ts
// src/app/api/admin/logs/route.ts
export async function POST(request: Request) {
  const identity = requireAdminIdentity(request)
  const json = await request.json()
  const input = logInputSchema.parse(json)

  // 中文注释：日志没有草稿态，写入后立即可在前台展示
  const created = await createLog(input, identity.email)
  await recordActivity('log', created.id, 'create', identity.email, created)

  return Response.json({ ok: true, item: created }, { status: 201 })
}
```

使用示例：

```bash
curl -X POST http://localhost:3000/api/admin/logs \
  -H 'content-type: application/json' \
  -H 'cf-access-authenticated-user-email: amy@xprimes.cn' \
  -d '{"title":"首条日志","content":"今天开始发布官网动态。","publishedAt":"2026-04-12","isPinned":true}'
```

- [ ] **Step 4: 为路由补集成测试并跑通**

```ts
// tests/integration/log-route.test.ts
import { describe, expect, it } from 'vitest'
import { POST } from '@/app/api/admin/logs/route'

describe('POST /api/admin/logs', () => {
  it('允许白名单用户发布日志', async () => {
    const request = new Request('https://xprimes.cn/api/admin/logs', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'cf-access-authenticated-user-email': 'amy@xprimes.cn',
      },
      body: JSON.stringify({
        title: '首条日志',
        content: '今天开始发布官网动态。',
        publishedAt: '2026-04-12',
        isPinned: false,
      }),
    })

    const response = await POST(request)
    expect(response.status).toBe(201)
  })
})
```

Run: `npx vitest run tests/unit/log-validator.test.ts tests/integration/log-route.test.ts`
Expected: PASS

- [ ] **Step 5: 提交日志功能**

Run: `git add src/lib/validators/log.ts src/app/api/admin/logs/route.ts src/app/api/admin/logs/[id]/route.ts src/components/admin/log-form.tsx src/components/admin/log-table.tsx src/app/admin/logs/page.tsx tests/unit/log-validator.test.ts tests/integration/log-route.test.ts && git commit -m "feat: add admin log publishing"`

### Task 6: 实现论文版本草稿/发布与 PDF 上传

**Files:**
- Create: `src/lib/validators/paper.ts`
- Create: `src/lib/r2/paper-storage.ts`
- Create: `src/app/api/admin/papers/route.ts`
- Create: `src/app/api/admin/papers/[id]/route.ts`
- Create: `src/app/api/admin/papers/upload/route.ts`
- Create: `src/components/admin/paper-form.tsx`
- Create: `src/components/admin/paper-table.tsx`
- Modify: `src/app/admin/papers/page.tsx`
- Test: `tests/unit/paper-validator.test.ts`
- Test: `tests/integration/paper-upload-route.test.ts`

- [ ] **Step 1: 先写论文校验与上传限制测试**

```ts
// tests/unit/paper-validator.test.ts
import { describe, expect, it } from 'vitest'
import { paperInputSchema, validatePdfUpload } from '@/lib/validators/paper'

describe('paper validation', () => {
  it('要求版本号、中英文标题和中文摘要必填', () => {
    const result = paperInputSchema.safeParse({
      version: '',
      titleZh: '',
      titleEn: '',
      abstractZh: '',
      abstractEn: '',
      status: 'draft',
    })

    expect(result.success).toBe(false)
  })

  it('只允许上传 pdf', () => {
    expect(() => validatePdfUpload({ type: 'image/png', size: 12 })).toThrow(/PDF/)
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npx vitest run tests/unit/paper-validator.test.ts`
Expected: FAIL，提示 `paper.ts` 不存在。

- [ ] **Step 3: 实现论文校验、R2 上传与后台接口**

```ts
// src/lib/validators/paper.ts
import { z } from 'zod'

export const paperInputSchema = z.object({
  version: z.string().trim().min(1, '版本号不能为空'),
  titleZh: z.string().trim().min(1, '中文标题不能为空'),
  titleEn: z.string().trim().min(1, '英文标题不能为空'),
  abstractZh: z.string().trim().min(1, '中文摘要不能为空'),
  abstractEn: z.string().trim().optional().default(''),
  status: z.enum(['draft', 'published']),
})

export function validatePdfUpload(file: { type: string; size: number }) {
  if (file.type !== 'application/pdf') {
    throw new Error('只能上传 PDF 文件')
  }

  if (file.size > 20 * 1024 * 1024) {
    throw new Error('PDF 文件不能超过 20MB')
  }
}
```

```ts
// src/app/api/admin/papers/upload/route.ts
export async function POST(request: Request) {
  const identity = requireAdminIdentity(request)
  const formData = await request.formData()
  const file = formData.get('file')

  if (!(file instanceof File)) {
    return Response.json({ ok: false, error: '缺少文件' }, { status: 400 })
  }

  validatePdfUpload(file)
  const uploaded = await uploadPaperPdf(file, identity.email)

  return Response.json({ ok: true, file: uploaded }, { status: 201 })
}
```

使用示例：

```bash
curl -X POST http://localhost:3000/api/admin/papers/upload \
  -H 'cf-access-authenticated-user-email: amy@xprimes.cn' \
  -F 'file=@./sample-paper.pdf'
```

- [ ] **Step 4: 为上传接口写集成测试并跑通**

```ts
// tests/integration/paper-upload-route.test.ts
import { describe, expect, it } from 'vitest'
import { POST } from '@/app/api/admin/papers/upload/route'

describe('POST /api/admin/papers/upload', () => {
  it('接受合法 pdf 上传', async () => {
    const formData = new FormData()
    formData.set('file', new File(['%PDF-1.4'], 'paper.pdf', { type: 'application/pdf' }))

    const request = new Request('https://xprimes.cn/api/admin/papers/upload', {
      method: 'POST',
      headers: {
        'cf-access-authenticated-user-email': 'amy@xprimes.cn',
      },
      body: formData,
    })

    const response = await POST(request)
    expect(response.status).toBe(201)
  })
})
```

Run: `npx vitest run tests/unit/paper-validator.test.ts tests/integration/paper-upload-route.test.ts`
Expected: PASS

- [ ] **Step 5: 提交论文功能**

Run: `git add src/lib/validators/paper.ts src/lib/r2/paper-storage.ts src/app/api/admin/papers/route.ts src/app/api/admin/papers/[id]/route.ts src/app/api/admin/papers/upload/route.ts src/components/admin/paper-form.tsx src/components/admin/paper-table.tsx src/app/admin/papers/page.tsx tests/unit/paper-validator.test.ts tests/integration/paper-upload-route.test.ts && git commit -m "feat: add paper draft publishing and upload"`

### Task 7: 实现反质疑条目草稿/发布与前后台联动

**Files:**
- Create: `src/lib/validators/review.ts`
- Create: `src/app/api/admin/review/route.ts`
- Create: `src/app/api/admin/review/[id]/route.ts`
- Create: `src/components/admin/review-form.tsx`
- Create: `src/components/admin/review-table.tsx`
- Modify: `src/app/admin/review/page.tsx`
- Modify: `src/app/review/page.tsx`
- Test: `tests/unit/review-validator.test.ts`
- Test: `tests/integration/review-route.test.ts`

- [ ] **Step 1: 先写反质疑校验测试**

```ts
// tests/unit/review-validator.test.ts
import { describe, expect, it } from 'vitest'
import { reviewInputSchema } from '@/lib/validators/review'

describe('reviewInputSchema', () => {
  it('要求编号、类型、引用位置和问题描述必填', () => {
    const result = reviewInputSchema.safeParse({
      code: '',
      itemType: 'open',
      title: '',
      reference: '',
      questionBody: '',
      responseBody: '',
      status: 'draft',
    })

    expect(result.success).toBe(false)
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npx vitest run tests/unit/review-validator.test.ts`
Expected: FAIL，提示 `review.ts` 不存在。

- [ ] **Step 3: 实现校验、接口与后台页**

```ts
// src/lib/validators/review.ts
import { z } from 'zod'

export const reviewInputSchema = z.object({
  code: z.string().trim().min(1, '编号不能为空'),
  itemType: z.enum(['open', 'resolved']),
  title: z.string().trim().min(1, '标题不能为空'),
  reference: z.string().trim().min(1, '引用位置不能为空'),
  questionBody: z.string().trim().min(1, '问题描述不能为空'),
  responseBody: z.string().trim().optional().default(''),
  status: z.enum(['draft', 'published']),
})
```

```ts
// src/app/api/admin/review/route.ts
export async function POST(request: Request) {
  const identity = requireAdminIdentity(request)
  const json = await request.json()
  const input = reviewInputSchema.parse(json)

  const created = await createReviewItem(input, identity.email)
  await recordActivity('review', created.id, 'create', identity.email, created)

  return Response.json({ ok: true, item: created }, { status: 201 })
}
```

使用示例：

```bash
curl -X POST http://localhost:3000/api/admin/review \
  -H 'content-type: application/json' \
  -H 'cf-access-authenticated-user-email: yiyi@xprimes.cn' \
  -d '{"code":"Q-001","itemType":"open","title":"关于定义 2.1 的问题","reference":"Definition 2.1","questionBody":"请说明大 n 情况下的收敛性。","responseBody":"","status":"draft"}'
```

- [ ] **Step 4: 写路由测试并跑通**

```ts
// tests/integration/review-route.test.ts
import { describe, expect, it } from 'vitest'
import { POST } from '@/app/api/admin/review/route'

describe('POST /api/admin/review', () => {
  it('允许白名单用户创建草稿质疑条目', async () => {
    const request = new Request('https://xprimes.cn/api/admin/review', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'cf-access-authenticated-user-email': 'yiyi@xprimes.cn',
      },
      body: JSON.stringify({
        code: 'Q-001',
        itemType: 'open',
        title: '关于定义 2.1 的问题',
        reference: 'Definition 2.1',
        questionBody: '请说明大 n 情况下的收敛性。',
        responseBody: '',
        status: 'draft',
      }),
    })

    const response = await POST(request)
    expect(response.status).toBe(201)
  })
})
```

Run: `npx vitest run tests/unit/review-validator.test.ts tests/integration/review-route.test.ts`
Expected: PASS

- [ ] **Step 5: 提交反质疑功能**

Run: `git add src/lib/validators/review.ts src/app/api/admin/review/route.ts src/app/api/admin/review/[id]/route.ts src/components/admin/review-form.tsx src/components/admin/review-table.tsx src/app/admin/review/page.tsx src/app/review/page.tsx tests/unit/review-validator.test.ts tests/integration/review-route.test.ts && git commit -m "feat: add review item draft publishing"`

### Task 8: 补全 Markdown 安全渲染、种子数据、端到端预览与部署文档

**Files:**
- Create: `src/lib/markdown.ts`
- Create: `scripts/seed-local.ts`
- Create: `tests/unit/markdown.test.ts`
- Create: `tests/e2e/public-site.spec.ts`
- Create: `tests/e2e/admin-workflow.spec.ts`
- Create: `playwright.config.ts`
- Create: `README.md`
- Create: `docs/cloudflare-deploy.md`

- [ ] **Step 1: 先写 Markdown 渲染测试**

```ts
// tests/unit/markdown.test.ts
import { describe, expect, it } from 'vitest'
import { sanitizeMarkdown } from '@/lib/markdown'

describe('sanitizeMarkdown', () => {
  it('移除危险 script 标签并保留普通文本', async () => {
    const html = await sanitizeMarkdown('hello<script>alert(1)</script>world')
    expect(html).toContain('hello')
    expect(html).toContain('world')
    expect(html).not.toContain('<script>')
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npx vitest run tests/unit/markdown.test.ts`
Expected: FAIL，提示 `markdown.ts` 不存在。

- [ ] **Step 3: 实现 Markdown 安全渲染、种子脚本与文档**

```ts
// src/lib/markdown.ts
import remarkGfm from 'remark-gfm'
import { remark } from 'remark'
import remarkHtml from 'remark-html'

export async function sanitizeMarkdown(markdown: string) {
  // 中文注释：先移除危险脚本，再把 Markdown 转成 HTML；后续页面渲染仍会再做一次白名单限制
  const safeMarkdown = markdown.replace(/<script[\\s\\S]*?>[\\s\\S]*?<\\/script>/gi, '')
  const file = await remark().use(remarkGfm).use(remarkHtml).process(safeMarkdown)
  return String(file)
}
```

```ts
// scripts/seed-local.ts
async function seed() {
  console.log('Seeding local D1 data...')
}

seed().catch((error) => {
  console.error(error)
  process.exit(1)
})
```

使用示例：

```bash
npm run preview
npm run test:e2e
npx wrangler d1 migrations apply xprimes-db --local
node scripts/seed-local.ts
```

- [ ] **Step 4: 增加 E2E 关键流程测试并全部跑通**

```ts
// tests/e2e/public-site.spec.ts
import { expect, test } from '@playwright/test'

test('public pages render key navigation', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('link', { name: '论文版本' })).toBeVisible()
  await expect(page.getByText('amy@xprimes.cn')).toBeVisible()
})
```

```ts
// tests/e2e/admin-workflow.spec.ts
import { expect, test } from '@playwright/test'

test('admin shell renders with dev header override', async ({ page }) => {
  await page.goto('/admin')
  await expect(page.getByRole('heading', { name: '内容后台' })).toBeVisible()
})
```

Run: `npx vitest run && npx playwright test`
Expected: PASS

- [ ] **Step 5: 提交测试、文档与部署说明**

Run: `git add src/lib/markdown.ts scripts/seed-local.ts tests/unit/markdown.test.ts tests/e2e/public-site.spec.ts tests/e2e/admin-workflow.spec.ts playwright.config.ts README.md docs/cloudflare-deploy.md && git commit -m "docs: add preview, testing, and deploy guides"`

## Execution Notes

- 执行任务时始终遵守 `@test-driven-development`：先写测试、确认失败、再写最小实现。
- 涉及 Cloudflare Access 的真实登录联调，不要在本地强依赖 Access；实现一个仅限开发环境使用的请求头/环境变量注入方案，方便本地预览后台。
- PDF 上传与 D1/R2 写入属于集成点，优先将校验和路径生成逻辑拆成可单测的纯函数。
- 每个任务完成后都要跑对应测试，再执行提交，避免把多个功能揉进同一个 commit。
- 在最终对外声称“可部署/可上线”前，必须执行一次完整的 `npm run preview`、`npx vitest run`、`npx playwright test`。
