-- 中文注释：日志主表，对应计划里的内容发布字段。
CREATE TABLE IF NOT EXISTS logs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt_en TEXT,
  published_at TEXT,
  is_pinned INTEGER NOT NULL DEFAULT 0,
  author_email TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 中文注释：论文表，按计划保留中英文标题、摘要与 PDF 元数据。
CREATE TABLE IF NOT EXISTS papers (
  id TEXT PRIMARY KEY,
  version INTEGER NOT NULL DEFAULT 1,
  title_zh TEXT NOT NULL,
  title_en TEXT,
  abstract_zh TEXT,
  abstract_en TEXT,
  pdf_key TEXT NOT NULL,
  pdf_filename TEXT NOT NULL,
  pdf_size INTEGER NOT NULL DEFAULT 0,
  publish_date TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  author_email TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 中文注释：审核条目表，支持标准问答与状态追踪。
CREATE TABLE IF NOT EXISTS review_items (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  item_type TEXT NOT NULL,
  title TEXT NOT NULL,
  reference TEXT,
  question_body TEXT NOT NULL,
  response_body TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  updated_by TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 中文注释：行为审计日志表，记录实体变更快照。
CREATE TABLE IF NOT EXISTS activity_logs (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL,
  operator_email TEXT NOT NULL,
  payload_snapshot TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
