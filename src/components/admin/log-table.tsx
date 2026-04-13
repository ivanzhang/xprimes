"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminLogItem } from "@/lib/db/mappers";
import { LogForm } from "@/components/admin/log-form";

interface LogTableProps {
  logs: AdminLogItem[];
}

interface ApiErrorPayload {
  error?: string;
}

function getDeleteErrorMessage(errorCode?: string): string {
  switch (errorCode) {
    case "UNAUTHORIZED_ADMIN":
      return "当前登录身份未通过后台白名单校验。";
    case "LOG_NOT_FOUND":
      return "目标日志不存在，可能已被删除。";
    default:
      return "删除失败，请稍后重试。";
  }
}

/**
 * 中文注释：后台日志表格负责展示已发布内容，并提供就地编辑与删除入口。
 * 使用示例：
 * ```tsx
 * <LogTable logs={logs} />
 * ```
 */
export function LogTable({ logs }: LogTableProps) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    const shouldContinue =
      typeof window === "undefined" ? true : window.confirm("确认删除这条日志吗？");

    if (!shouldContinue) {
      return;
    }

    setPendingDeleteId(id);
    setFeedback(null);

    try {
      const response = await fetch(`/api/admin/logs/${id}`, {
        method: "DELETE",
      });
      const payload = (await response.json().catch(() => null)) as ApiErrorPayload | null;

      if (!response.ok) {
        setFeedback(getDeleteErrorMessage(payload?.error));
        return;
      }

      setFeedback("日志已删除。");
      router.refresh();
    } finally {
      setPendingDeleteId(null);
    }
  }

  if (logs.length === 0) {
    return (
      <section aria-labelledby="admin-log-table-title">
        <h3 id="admin-log-table-title">已发布日志</h3>
        <p>当前还没有已发布日志，先通过上方表单创建第一条公开记录。</p>
      </section>
    );
  }

  return (
    <section aria-labelledby="admin-log-table-title">
      <h3 id="admin-log-table-title">已发布日志</h3>
      <p>列表按置顶和发布时间排序，便于确认前台的实际展示顺序。</p>
      {feedback ? <p role="status">{feedback}</p> : null}

      <table>
        <thead>
          <tr>
            <th scope="col">标题</th>
            <th scope="col">发布时间</th>
            <th scope="col">置顶</th>
            <th scope="col">更新</th>
            <th scope="col">操作</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id}>
              <td>
                <strong>{log.title}</strong>
                <p>{log.content}</p>
                {log.excerptEn ? <p>{log.excerptEn}</p> : null}
              </td>
              <td>
                <time dateTime={log.publishedAt}>{log.publishedAtLabel}</time>
              </td>
              <td>{log.isPinned ? "是" : "否"}</td>
              <td>
                <time dateTime={log.updatedAt}>{log.updatedAtLabel}</time>
              </td>
              <td>
                <details>
                  <summary>编辑</summary>
                  <LogForm
                    mode="edit"
                    logId={log.id}
                    submitLabel="保存更新"
                    initialValue={{
                      title: log.title,
                      content: log.content,
                      excerptEn: log.excerptEn ?? "",
                      publishedAt: log.publishedAt,
                      isPinned: log.isPinned,
                    }}
                    onSuccess={() => {
                      setFeedback(`日志《${log.title}》已更新。`);
                    }}
                  />
                </details>
                <button
                  type="button"
                  disabled={pendingDeleteId === log.id}
                  onClick={() => {
                    void handleDelete(log.id);
                  }}
                >
                  {pendingDeleteId === log.id ? "删除中..." : "删除"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
