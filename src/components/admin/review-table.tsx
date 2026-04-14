"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminReviewItem } from "@/lib/repositories/review-repository";
import { ReviewForm } from "@/components/admin/review-form";

interface ReviewTableProps {
  items: AdminReviewItem[];
}

interface ApiErrorPayload {
  error?: string;
}

function getDeleteErrorMessage(errorCode?: string): string {
  switch (errorCode) {
    case "UNAUTHORIZED_ADMIN":
      return "当前登录身份未通过后台白名单校验。";
    case "REVIEW_ITEM_NOT_FOUND":
      return "目标条目不存在，可能已被删除。";
    default:
      return "删除失败，请稍后重试。";
  }
}

export function ReviewTable({ items }: ReviewTableProps) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    const shouldContinue =
      typeof window === "undefined" ? true : window.confirm("确认删除这条反质疑条目吗？");

    if (!shouldContinue) return;

    setPendingDeleteId(id);
    setFeedback(null);

    try {
      const response = await fetch(`/api/admin/review/${id}`, { method: "DELETE" });
      const payload = (await response.json().catch(() => null)) as ApiErrorPayload | null;

      if (!response.ok) {
        setFeedback(getDeleteErrorMessage(payload?.error));
        return;
      }

      setFeedback("条目已删除。");
      router.refresh();
    } finally {
      setPendingDeleteId(null);
    }
  }

  if (items.length === 0) {
    return (
      <section aria-labelledby="admin-review-table-title">
        <h3 id="admin-review-table-title">条目列表</h3>
        <p>当前还没有反质疑条目，先通过上方表单创建第一条。</p>
      </section>
    );
  }

  return (
    <section aria-labelledby="admin-review-table-title">
      <h3 id="admin-review-table-title">条目列表</h3>
      {feedback ? <p role="status">{feedback}</p> : null}

      <table>
        <thead>
          <tr>
            <th scope="col">编号</th>
            <th scope="col">标题</th>
            <th scope="col">类型</th>
            <th scope="col">状态</th>
            <th scope="col">更新</th>
            <th scope="col">操作</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.code}</td>
              <td>
                <strong>{item.title}</strong>
                <p>{item.reference}</p>
              </td>
              <td>{item.itemType === "open" ? "待解答" : "已回应"}</td>
              <td>{item.status === "published" ? "已发布" : "草稿"}</td>
              <td>
                <time dateTime={item.updatedAt}>{item.updatedAtLabel}</time>
              </td>
              <td>
                <details>
                  <summary>编辑</summary>
                  <ReviewForm
                    mode="edit"
                    reviewId={item.id}
                    submitLabel="保存更新"
                    initialValue={{
                      code: item.code,
                      itemType: item.itemType,
                      title: item.title,
                      reference: item.reference,
                      questionBody: item.questionBody,
                      responseBody: item.responseBody ?? "",
                      status: item.status,
                    }}
                    onSuccess={() => {
                      setFeedback(`条目 ${item.code} 已更新。`);
                    }}
                  />
                </details>
                <button
                  type="button"
                  disabled={pendingDeleteId === item.id}
                  onClick={() => {
                    void handleDelete(item.id);
                  }}
                >
                  {pendingDeleteId === item.id ? "删除中..." : "删除"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
