# XPrimes 官网与后台一体化设计文档

日期：2026-04-12

## 1. 项目目标

为 `xprimes.cn` 建设一个首版即可上线的官方网站，满足以下核心目标：

1. 对外提供严肃、克制、可持续更新的研究项目官网。
2. 对内提供受限登录的后台，供 `amy@xprimes.cn` 与 `yiyi@xprimes.cn` 维护内容。
3. 在 Cloudflare 免费优先的前提下，完成部署、绑定自定义域名，并保留后续扩展空间。

首版必须同时覆盖：

- 首页项目背景介绍
- 论文版本发布
- 动态日志发布
- 反质疑 / 结构化审查页面
- 联系方式展示
- 后台登录、日志发布、论文上传与发布、反质疑条目维护

## 2. 产品定位

网站定位不是营销站，也不是炫技型 Web3/AI 站点，而是：

> 一个中文主导、英文少量辅助、适合持续记录研究推进与正式发布材料的研究项目官网。

整体表达遵循以下原则：

- 语气克制，避免夸张宣称
- 强调“研究进行中”“逐步发布”“欢迎结构化审查”
- 公开内容以清晰、可追溯、可维护为主
- 后台以实用可靠优先，不追求复杂 CMS

## 3. 首版范围

### 3.1 对外页面

#### `/`

首页承担项目对外介绍职责，展示：

- 项目名称与中英副标题
- 项目背景与当前阶段说明
- 最新动态入口
- 论文版本入口
- 反质疑页面入口
- 联系方式

#### `/papers`

论文版本页用于展示已发布版本：

- 版本号
- 中文标题
- 英文标题
- 发布日期
- 中文摘要
- 英文摘要
- PDF 下载入口

仅展示状态为 `published` 的记录。

#### `/log`

动态日志页用于展示研究推进记录：

- 标题
- 发布时间
- 正文
- 可选英文摘要
- 置顶状态

日志提交后立即对外可见，不存在草稿状态。

#### `/review`

反质疑页面用于结构化展示审查与回应：

- 开放问题（`open`）
- 已回应问题（`resolved`）

每条记录包含编号、标题、引用位置、问题描述、回应内容、更新时间等。仅展示 `published` 状态。

### 3.2 后台页面

#### `/admin`

后台首页，展示内容总览与快捷入口。

#### `/admin/logs`

日志管理页，支持：

- 新建日志
- 编辑日志
- 删除日志
- 置顶日志
- 提交后立即发布

#### `/admin/papers`

论文管理页，支持：

- 新建论文版本
- 上传或替换 PDF
- 保存草稿
- 发布草稿
- 编辑已发布条目

#### `/admin/review`

反质疑管理页，支持：

- 新建条目
- 编辑条目
- 保存草稿
- 发布条目
- 区分 `open` 与 `resolved`

## 4. 用户与权限模型

首版后台不做公开注册，不做多角色体系，仅允许两个固定邮箱访问：

- `amy@xprimes.cn`
- `yiyi@xprimes.cn`

权限设计分两层：

1. **Cloudflare Access 层**
   - 保护 `/admin/*`
   - 通过邮箱一次性验证码（OTP）完成登录
2. **应用层白名单校验**
   - Worker 读取 Access 注入的身份信息
   - 二次校验邮箱是否在允许列表
   - 防止边界配置失误导致后台暴露

首版两位用户权限一致，不区分管理员和编辑者。

## 5. 内容模型

### 5.1 日志 `logs`

建议字段：

- `id`
- `title`
- `content`
- `excerpt_en`
- `published_at`
- `is_pinned`
- `author_email`
- `created_at`
- `updated_at`

日志规则：

- 无草稿状态
- 后台保存即发布
- 前台按 `is_pinned DESC, published_at DESC` 排序

### 5.2 论文版本 `papers`

建议字段：

- `id`
- `version`
- `title_zh`
- `title_en`
- `abstract_zh`
- `abstract_en`
- `pdf_key`
- `pdf_filename`
- `pdf_size`
- `publish_date`
- `status`
- `author_email`
- `created_at`
- `updated_at`

状态规则：

- `draft`
- `published`

论文规则：

- 可先保存草稿
- 草稿不对外展示
- 发布后在 `/papers` 可见
- 已发布条目允许继续编辑并再次保存

### 5.3 反质疑条目 `review_items`

建议字段：

- `id`
- `code`
- `item_type`
- `title`
- `reference`
- `question_body`
- `response_body`
- `status`
- `updated_by`
- `created_at`
- `updated_at`

字段语义：

- `item_type`: `open` 或 `resolved`
- `status`: `draft` 或 `published`

页面规则：

- `/review` 仅展示 `published`
- 前台分组为“开放问题”和“已回应问题”

### 5.4 操作审计 `activity_logs`

建议字段：

- `id`
- `entity_type`
- `entity_id`
- `action`
- `operator_email`
- `payload_snapshot`
- `created_at`

该表用于记录：

- 新建
- 编辑
- 发布
- 删除
- 文件上传替换

首版不做复杂回滚，但保留审计痕迹。

## 6. 技术架构

### 6.1 总体方案

采用 `Cloudflare Workers 全栈一体化` 方案：

- 同一个 Worker 项目承担前台站点、后台页面、后台 API、文件上传接口
- 自定义域名直接绑定到 Worker
- 前台与后台使用同一套部署流程，减少环境碎片

### 6.2 前端

前端采用 `Next.js`，并通过适配 Cloudflare Worker 的方式部署。

选择该方案的原因：

- 页面路由与后台页面组织清晰
- 前后端同项目管理成本更低
- 本地开发和预览方便
- 后续新增页面、表单、权限判断更自然

视觉方向参考已有 `DESIGN.md` 的“干净、专业、层次分明”原则，但首版重点不放在复杂 UI，而是放在：

- 信息清晰
- 后台稳定
- 内容维护顺手

### 6.3 数据库

使用 `Cloudflare D1` 存储结构化内容：

- `logs`
- `papers`
- `review_items`
- `activity_logs`

数据库作为首版唯一内容源，前台页面直接从 D1 读取已发布数据，不再以本地 Markdown / JSON 作为正式数据源。

### 6.4 文件存储

使用 `Cloudflare R2` 存储论文 PDF 文件。

设计原则：

- 数据库存储文件元数据
- R2 存储实际文件
- Worker 统一处理上传、替换与下载路径

这样可以保持：

- 文件路径可控
- 后续下载权限或统计逻辑可扩展
- 不依赖构建时打包本地文件

### 6.5 认证与访问控制

后台访问链路如下：

1. 用户访问 `/admin/*`
2. Cloudflare Access 验证邮箱 OTP
3. Access 将用户身份传递给 Worker
4. Worker 校验邮箱白名单
5. 校验通过后允许访问后台页面与后台 API

后台 API 不接受匿名请求。

## 7. 信息流与交互流程

### 7.1 日志发布流程

1. 登录后台
2. 进入 `/admin/logs`
3. 填写标题、日期、正文、英文摘要、置顶状态
4. 点击保存
5. 数据写入 D1
6. 记录一条审计日志
7. 前台 `/log` 立即可见

### 7.2 论文发布流程

1. 登录后台
2. 进入 `/admin/papers`
3. 填写版本信息与摘要
4. 上传 PDF 到 R2
5. 保存为草稿或直接发布
6. 若保存草稿，则前台不可见
7. 若发布，则 `/papers` 立即展示该版本

### 7.3 反质疑条目发布流程

1. 登录后台
2. 进入 `/admin/review`
3. 填写编号、类型、引用位置、问题描述、回应内容
4. 保存草稿或发布
5. 仅发布状态会出现在 `/review`

## 8. 页面与组件边界

为了保持结构清晰，建议按以下边界拆分：

- 公共布局：站点头部、页脚、导航、联系信息
- 首页模块：项目背景、状态说明、快速入口、最近动态
- 日志模块：日志列表、日志卡片、置顶标识
- 论文模块：论文列表、版本卡片、下载按钮
- 反质疑模块：分组列表、条目卡片、状态说明
- 后台模块：表单、列表、状态切换、上传组件
- API 模块：日志、论文、反质疑、文件上传、鉴权辅助

这样拆分的目标是：

- 页面职责明确
- 后续扩展时不需要推翻结构
- 单个文件不过度膨胀

## 9. 错误处理与安全控制

### 9.1 表单校验

后台所有内容提交都需要基础校验：

- 标题必填
- 日期必填
- 论文版本号必填
- PDF 文件仅允许 `application/pdf`
- 反质疑条目编号不能为空

### 9.2 文件上传限制

PDF 上传需限制：

- MIME 类型必须为 PDF
- 文件大小设置合理上限
- 替换上传时保留元数据同步更新

### 9.3 内容渲染安全

后台使用 Markdown 录入时，需要控制渲染能力，避免危险脚本注入。

首版应限制：

- 直接注入 HTML
- 任意脚本
- 未经过滤的危险链接协议

### 9.4 鉴权失败处理

如果用户：

- 未登录
- Access 身份缺失
- 邮箱不在白名单

则后台应返回清晰的未授权提示，不暴露内部数据。

## 10. 首版明确不做

为了保证首版尽快上线，下列能力暂不纳入：

- 多角色权限管理
- 多人同时编辑冲突合并
- 评论系统
- 公开反馈表单
- 站内搜索
- 标签分类体系
- 邮件发送能力
- 在线 PDF 批注
- 复杂富文本编辑器
- 自动 DOI 同步

这些能力均可在后续版本追加，但不作为首版阻塞项。

## 11. 测试与验收思路

首版至少覆盖以下验证：

### 11.1 前台验证

- 首页可以正确展示项目背景与联系方式
- `/papers` 仅展示已发布论文
- `/log` 可展示最新日志且排序正确
- `/review` 可按开放问题 / 已回应问题分组展示

### 11.2 后台验证

- 白名单邮箱可进入后台
- 非白名单用户无法访问后台
- 日志保存后立即出现在前台
- 论文支持上传 PDF、保存草稿、发布后前台可见
- 反质疑条目支持草稿与发布切换

### 11.3 部署验证

- 本地开发环境可运行
- Worker 可成功部署
- D1 / R2 绑定正常
- `xprimes.cn` 自定义域名可正常访问

## 12. 上线成功标准

当以下条件全部满足，即可认为首版达到上线标准：

1. 本地可预览前台与后台
2. 后台登录链路可用
3. 日志可发布并实时显示
4. 论文 PDF 可上传、保存草稿、发布
5. 反质疑条目可保存草稿、发布
6. Cloudflare Worker 成功部署
7. `xprimes.cn` 成功绑定并对外访问

## 13. 参考资料

以下技术判断基于 Cloudflare 官方文档：

- Workers Static Assets  
  `https://developers.cloudflare.com/workers/static-assets/`
- Workers Custom Domains  
  `https://developers.cloudflare.com/workers/configuration/routing/custom-domains/`
- Cloudflare Access One-time PIN  
  `https://developers.cloudflare.com/cloudflare-one/integrations/identity-providers/one-time-pin/`
- D1 Get Started  
  `https://developers.cloudflare.com/d1/get-started/`
- R2 Upload Objects  
  `https://developers.cloudflare.com/r2/objects/upload-objects/`
- Pages Functions Get Started  
  `https://developers.cloudflare.com/pages/functions/get-started/`

## 14. 当前已确认决策

本设计文档基于以下已确认内容：

- 中文为主，英文少量辅助
- 核心页面包括：首页、论文版本、动态日志、反质疑、联系方式
- 联系方式使用 `amy@xprimes.cn` 为主、`yiyi@xprimes.cn` 为辅
- 首版即需要后台
- 后台仅允许两个指定邮箱登录
- 后台支持直接上传 PDF
- 日志立即发布
- 论文与反质疑条目支持草稿后发布
- 技术路线采用 `Workers 全栈一体化`
