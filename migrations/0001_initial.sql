-- 中文注释：系统日志表，记录系统运行与异常信息。
CREATE TABLE IF NOT EXISTS logs (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  level TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata_json TEXT
);

-- 中文注释：论文/资料主表。
CREATE TABLE IF NOT EXISTS papers (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  title TEXT NOT NULL,
  source_url TEXT,
  summary TEXT,
  status TEXT NOT NULL DEFAULT 'draft'
);

-- 中文注释：审核项表，挂载在 papers 下。
CREATE TABLE IF NOT EXISTS review_items (
  id TEXT PRIMARY KEY,
  paper_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reviewer_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  note TEXT,
  FOREIGN KEY (paper_id) REFERENCES papers(id)
);

-- 中文注释：行为日志表，用于记录后台操作审计轨迹。
CREATE TABLE IF NOT EXISTS activity_logs (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actor_email TEXT NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  payload_json TEXT
);
