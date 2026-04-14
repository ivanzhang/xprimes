"use client";

import { useState, useEffect, type FormEvent } from "react";

interface CommentUser {
  name: string | null;
  avatar: string | null;
  provider: string;
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: CommentUser;
}

interface SessionUser {
  id: string;
  provider: string;
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
}

interface CommentsProps {
  pageKey: string;
}

function providerLabel(provider: string): string {
  switch (provider) {
    case "github": return "GitHub";
    case "google": return "Google";
    case "email": return "邮箱";
    default: return provider;
  }
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function LoginPanel() {
  const [showEmail, setShowEmail] = useState(false);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSendCode(e: FormEvent) {
    e.preventDefault();
    setSending(true);
    setMessage("");

    try {
      const res = await fetch("/api/auth/email/send", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json()) as { ok: boolean; message?: string; devCode?: string };

      if (data.ok) {
        setStep("code");
        setMessage(data.devCode ? `开发模式验证码：${data.devCode}` : (data.message ?? "验证码已发送"));
      } else {
        setMessage("发送失败，请检查邮箱格式。");
      }
    } finally {
      setSending(false);
    }
  }

  async function handleVerifyCode(e: FormEvent) {
    e.preventDefault();
    setSending(true);
    setMessage("");

    try {
      const res = await fetch("/api/auth/email/verify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = (await res.json()) as { ok: boolean; message?: string };

      if (data.ok) {
        window.location.reload();
      } else {
        setMessage(data.message ?? "验证码无效或已过期。");
      }
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="card" style={{ textAlign: "center" }}>
      <p style={{ marginBottom: "var(--space-md)", color: "var(--color-heading)" }}>
        <strong>登录后即可评论</strong>
      </p>

      <div style={{ display: "flex", gap: "var(--space-sm)", justifyContent: "center", flexWrap: "wrap", marginBottom: "var(--space-md)" }}>
        <a href="/api/auth/github" className="btn btn-ghost" style={{ gap: 6 }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
          GitHub 登录
        </a>
        <a href="/api/auth/google" className="btn btn-ghost" style={{ gap: 6 }}>
          <svg width="16" height="16" viewBox="0 0 16 16"><path fill="#4285F4" d="M15.68 8.18c0-.57-.05-1.11-.15-1.64H8v3.1h4.3a3.68 3.68 0 01-1.6 2.41v2h2.59c1.51-1.4 2.39-3.45 2.39-5.87z"/><path fill="#34A853" d="M8 16c2.16 0 3.97-.72 5.29-1.94l-2.59-2a5.07 5.07 0 01-7.56-2.65H.55v2.06A8 8 0 008 16z"/><path fill="#FBBC05" d="M3.14 9.41a4.8 4.8 0 010-2.82V4.53H.55a8 8 0 000 6.94l2.59-2.06z"/><path fill="#EA4335" d="M8 3.18c1.22 0 2.31.42 3.17 1.24l2.38-2.38A8 8 0 00.55 4.53l2.59 2.06A4.77 4.77 0 018 3.18z"/></svg>
          Google 登录
        </a>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => setShowEmail((v) => !v)}
        >
          ✉ 邮箱登录
        </button>
      </div>

      {showEmail ? (
        <div style={{ maxWidth: 360, margin: "0 auto" }}>
          {step === "email" ? (
            <form onSubmit={handleSendCode} style={{ display: "flex", gap: "var(--space-sm)" }}>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.currentTarget.value)}
                required
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "0.875rem",
                }}
              />
              <button type="submit" className="btn btn-primary" disabled={sending}>
                {sending ? "发送中..." : "发送验证码"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode} style={{ display: "flex", gap: "var(--space-sm)" }}>
              <input
                type="text"
                placeholder="6 位验证码"
                value={code}
                onChange={(e) => setCode(e.currentTarget.value)}
                maxLength={6}
                required
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "0.875rem",
                  textAlign: "center",
                  letterSpacing: "4px",
                }}
              />
              <button type="submit" className="btn btn-primary" disabled={sending}>
                {sending ? "验证中..." : "验证登录"}
              </button>
            </form>
          )}
          {message ? (
            <p style={{ fontSize: "0.8125rem", marginTop: "var(--space-sm)", color: "var(--color-purple)" }}>
              {message}
            </p>
          ) : null}
        </div>
      ) : null}

      <p style={{ fontSize: "0.75rem", color: "var(--color-body)", marginTop: "var(--space-md)" }}>
        也可以通过 <a href="mailto:amy@xprimes.cn">邮件</a> 提交反馈
      </p>
    </div>
  );
}

function CommentItem({ comment }: { comment: Comment }) {
  return (
    <div style={{
      display: "flex",
      gap: "var(--space-md)",
      padding: "var(--space-md) 0",
      borderBottom: "1px solid var(--color-border)",
    }}>
      <div style={{ flexShrink: 0 }}>
        {comment.user.avatar ? (
          <img
            src={comment.user.avatar}
            alt=""
            width={36}
            height={36}
            style={{ borderRadius: "50%", border: "1px solid var(--color-border)" }}
          />
        ) : (
          <div style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "var(--color-purple-surface)",
            border: "1px solid var(--color-border-purple)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.875rem",
            color: "var(--color-purple)",
          }}>
            {(comment.user.name ?? "?")[0]}
          </div>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: "0.8125rem", marginBottom: 4 }}>
          <strong style={{ color: "var(--color-heading)" }}>
            {comment.user.name ?? "匿名"}
          </strong>
          <span className="badge" style={{
            marginLeft: 6,
            background: "var(--color-purple-surface)",
            color: "var(--color-purple)",
            border: "1px solid var(--color-border-purple)",
          }}>
            {providerLabel(comment.user.provider)}
          </span>
          <span style={{ color: "var(--color-body)", marginLeft: 8 }}>
            {formatDate(comment.createdAt)}
          </span>
        </p>
        <p style={{ fontSize: "0.9375rem", color: "var(--color-heading)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
          {comment.content}
        </p>
      </div>
    </div>
  );
}

export function Comments({ pageKey }: CommentsProps) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me")
        .then((r) => r.json() as Promise<{ user: SessionUser | null }>)
        .then((d) => setUser(d.user)),
      fetch(`/api/comments?page=${encodeURIComponent(pageKey)}`)
        .then((r) => r.json() as Promise<{ comments: Comment[] }>)
        .then((d) => setComments(d.comments ?? [])),
    ]).finally(() => setLoaded(true));
  }, [pageKey]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ pageKey, content }),
      });
      const data = (await res.json()) as { ok: boolean; comment?: Comment };

      if (data.ok && data.comment) {
        setComments((prev) => [...prev, data.comment!]);
        setContent("");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (!loaded) return null;

  return (
    <section className="section">
      <p className="section-eyebrow">DISCUSSION</p>
      <h2 className="section-title">评论与讨论</h2>
      <p className="section-desc">
        支持 GitHub、Google 或邮箱登录。欢迎数学讨论、勘误建议与结构化反馈。
      </p>

      {/* Comment list */}
      {comments.length > 0 ? (
        <div style={{ marginBottom: "var(--space-lg)" }}>
          {comments.map((c) => (
            <CommentItem key={c.id} comment={c} />
          ))}
        </div>
      ) : (
        <p style={{ color: "var(--color-body)", fontSize: "0.875rem", marginBottom: "var(--space-lg)" }}>
          暂无评论，成为第一个留言的人。
        </p>
      )}

      {/* Auth + compose */}
      {user ? (
        <div>
          <p style={{ fontSize: "0.8125rem", marginBottom: "var(--space-sm)", color: "var(--color-body)" }}>
            已登录：<strong style={{ color: "var(--color-heading)" }}>{user.name ?? user.email}</strong>
            （{providerLabel(user.provider)}）
            <a href="/api/auth/logout" style={{ marginLeft: 8, fontSize: "0.75rem" }}>退出</a>
          </p>
          <form onSubmit={handleSubmit}>
            <textarea
              value={content}
              onChange={(e) => setContent(e.currentTarget.value)}
              placeholder="写下你的评论..."
              rows={3}
              maxLength={2000}
              style={{
                width: "100%",
                padding: "var(--space-sm) var(--space-md)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                fontSize: "0.9375rem",
                fontFamily: "var(--font-sans)",
                resize: "vertical",
              }}
            />
            <div style={{ marginTop: "var(--space-sm)", display: "flex", justifyContent: "flex-end" }}>
              <button type="submit" className="btn btn-primary" disabled={submitting || !content.trim()}>
                {submitting ? "发送中..." : "发表评论"}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <LoginPanel />
      )}
    </section>
  );
}
