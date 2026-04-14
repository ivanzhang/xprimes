"use client";

import { useState, type FormEvent } from "react";

export function AdminLogin() {
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
        setMessage(data.devCode ? `开发模式验证码：${data.devCode}` : "验证码已发送到邮箱，请查收。");
      } else {
        setMessage("发送失败，请检查邮箱地址。");
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
    <div style={{ maxWidth: 420, margin: "80px auto", padding: "0 24px" }}>
      <div className="card" style={{ padding: "var(--space-xl)" }}>
        <h1 style={{ fontSize: "1.5rem", marginBottom: "var(--space-sm)", color: "var(--color-heading)" }}>
          后台登录
        </h1>
        <p style={{ fontSize: "0.875rem", color: "var(--color-body)", marginBottom: "var(--space-lg)" }}>
          使用管理员邮箱（amy@ 或 yiyi@xprimes.cn）接收验证码登录。
        </p>

        {step === "email" ? (
          <form onSubmit={handleSendCode}>
            <label style={{ display: "block", fontSize: "0.8125rem", color: "var(--color-label)", marginBottom: "var(--space-xs)" }}>
              管理员邮箱
            </label>
            <input
              type="email"
              placeholder="amy@xprimes.cn"
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              required
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-sm)",
                fontSize: "0.9375rem",
                marginBottom: "var(--space-md)",
              }}
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={sending}
              style={{ width: "100%" }}
            >
              {sending ? "发送中..." : "发送验证码"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode}>
            <p style={{ fontSize: "0.8125rem", color: "var(--color-body)", marginBottom: "var(--space-md)" }}>
              验证码已发送至 <strong style={{ color: "var(--color-heading)" }}>{email}</strong>
              <button
                type="button"
                onClick={() => { setStep("email"); setCode(""); setMessage(""); }}
                style={{ background: "none", border: "none", color: "var(--color-purple)", cursor: "pointer", marginLeft: 8, fontSize: "0.8125rem" }}
              >
                换个邮箱
              </button>
            </p>
            <label style={{ display: "block", fontSize: "0.8125rem", color: "var(--color-label)", marginBottom: "var(--space-xs)" }}>
              6 位验证码
            </label>
            <input
              type="text"
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.currentTarget.value)}
              maxLength={6}
              required
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-sm)",
                fontSize: "1.25rem",
                textAlign: "center",
                letterSpacing: "6px",
                fontFamily: "var(--font-mono)",
                marginBottom: "var(--space-md)",
              }}
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={sending}
              style={{ width: "100%" }}
            >
              {sending ? "验证中..." : "验证并登录"}
            </button>
          </form>
        )}

        {message ? (
          <p style={{
            fontSize: "0.8125rem",
            marginTop: "var(--space-md)",
            padding: "var(--space-sm) var(--space-md)",
            background: "var(--color-purple-surface)",
            borderRadius: "var(--radius-sm)",
            color: "var(--color-purple)",
          }}>
            {message}
          </p>
        ) : null}
      </div>
    </div>
  );
}
