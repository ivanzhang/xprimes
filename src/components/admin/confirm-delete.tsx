"use client";

import { useState, type FormEvent } from "react";

interface ConfirmDeleteProps {
  itemName: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

const CONFIRM_TEXT = "确定删除";

export function ConfirmDelete({ itemName, onConfirm, onCancel, loading }: ConfirmDeleteProps) {
  const [input, setInput] = useState("");
  const isMatch = input === CONFIRM_TEXT;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (isMatch) onConfirm();
  }

  return (
    <div>
      <p style={{ fontSize: "0.875rem", color: "var(--color-heading)", marginBottom: "var(--space-sm)" }}>
        即将移入回收站：<strong>{itemName}</strong>
      </p>
      <p style={{ fontSize: "0.8125rem", color: "var(--color-body)", marginBottom: "var(--space-md)" }}>
        内容不会真正删除，可以在回收站恢复。请输入 <strong style={{ color: "var(--color-ruby)" }}>{CONFIRM_TEXT}</strong> 以确认。
      </p>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.currentTarget.value)}
          placeholder={CONFIRM_TEXT}
          autoFocus
          style={{
            width: "100%", padding: "8px 12px",
            border: `1px solid ${isMatch ? "var(--color-success)" : "var(--color-border)"}`,
            borderRadius: "var(--radius-sm)", fontSize: "0.9375rem",
            marginBottom: "var(--space-md)", fontFamily: "var(--font-sans)",
          }}
        />
        <div style={{ display: "flex", gap: "var(--space-sm)", justifyContent: "flex-end" }}>
          <button type="button" onClick={onCancel} className="btn btn-ghost" style={{ fontSize: "0.8125rem" }}>
            取消
          </button>
          <button
            type="submit"
            disabled={!isMatch || loading}
            style={{
              padding: "8px 20px", border: "none", borderRadius: "var(--radius-sm)",
              fontSize: "0.8125rem", cursor: isMatch ? "pointer" : "not-allowed",
              background: isMatch ? "var(--color-ruby)" : "var(--color-border)",
              color: isMatch ? "#fff" : "var(--color-body)",
              fontFamily: "var(--font-sans)",
            }}
          >
            {loading ? "处理中..." : "移入回收站"}
          </button>
        </div>
      </form>
    </div>
  );
}
