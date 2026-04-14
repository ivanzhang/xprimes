"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminComment } from "@/app/admin/comments/page";

interface CommentTableProps {
  comments: AdminComment[];
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("zh-CN", {
      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function CommentTable({ comments }: CommentTableProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function toggleHidden(id: string, currentlyHidden: boolean) {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/comments/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ isHidden: !currentlyHidden }),
      });
      if (res.ok) {
        setFeedback(currentlyHidden ? "评论已显示。" : "评论已隐藏。");
        router.refresh();
      }
    } finally {
      setLoadingId(null);
    }
  }

  if (comments.length === 0) {
    return <p style={{ color: "var(--color-body)" }}>暂无评论。</p>;
  }

  return (
    <>
      {feedback ? <p role="status">{feedback}</p> : null}
      <table>
        <thead>
          <tr>
            <th>用户</th>
            <th>页面</th>
            <th>内容</th>
            <th>时间</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {comments.map((c) => (
            <tr key={c.id} style={{ opacity: c.isHidden ? 0.5 : 1 }}>
              <td>
                <strong>{c.userName ?? "匿名"}</strong>
                <p>{c.userProvider}</p>
              </td>
              <td><code style={{ fontSize: "0.75rem" }}>{c.pageKey}</code></td>
              <td style={{ maxWidth: 300 }}>
                <p style={{ fontSize: "0.8125rem", whiteSpace: "pre-wrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {c.content.length > 100 ? c.content.slice(0, 100) + "..." : c.content}
                </p>
              </td>
              <td><time>{formatDate(c.createdAt)}</time></td>
              <td>
                <span className={`badge ${c.isHidden ? "badge-draft" : "badge-success"}`}>
                  {c.isHidden ? "已隐藏" : "可见"}
                </span>
              </td>
              <td>
                <button
                  type="button"
                  onClick={() => toggleHidden(c.id, c.isHidden)}
                  disabled={loadingId === c.id}
                  style={{
                    background: c.isHidden ? "rgba(21,190,83,0.08)" : "rgba(234,34,97,0.06)",
                    color: c.isHidden ? "#108c3d" : "var(--color-ruby)",
                    border: `1px solid ${c.isHidden ? "rgba(21,190,83,0.3)" : "rgba(234,34,97,0.2)"}`,
                    padding: "4px 12px", borderRadius: "var(--radius-sm)", fontSize: "0.75rem",
                    cursor: "pointer", fontFamily: "var(--font-sans)",
                  }}
                >
                  {loadingId === c.id ? "..." : c.isHidden ? "显示" : "隐藏"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
