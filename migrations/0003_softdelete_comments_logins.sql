-- 软删除：logs / papers / review_items 加 deleted_at
ALTER TABLE logs ADD COLUMN deleted_at TEXT;
ALTER TABLE papers ADD COLUMN deleted_at TEXT;
ALTER TABLE review_items ADD COLUMN deleted_at TEXT;

-- 评论隐藏
ALTER TABLE comments ADD COLUMN is_hidden INTEGER NOT NULL DEFAULT 0 CHECK (is_hidden IN (0, 1));

-- 后台登录日志
CREATE TABLE IF NOT EXISTS admin_logins (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  email TEXT NOT NULL,
  ip TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_admin_logins_created ON admin_logins(created_at);
