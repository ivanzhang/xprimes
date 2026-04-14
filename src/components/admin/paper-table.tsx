"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminPaperItem } from "@/lib/db/mappers";
import { PaperForm } from "@/components/admin/paper-form";

interface PaperTableProps {
  papers: AdminPaperItem[];
}

interface ApiErrorPayload {
  error?: string;
}

function getDeleteErrorMessage(errorCode?: string): string {
  switch (errorCode) {
    case "UNAUTHORIZED_ADMIN":
      return "当前登录身份未通过后台白名单校验。";
    case "PAPER_NOT_FOUND":
      return "目标论文不存在，可能已被删除。";
    default:
      return "删除失败，请稍后重试。";
  }
}

export function PaperTable({ papers }: PaperTableProps) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    const shouldContinue =
      typeof window === "undefined" ? true : window.confirm("确认删除这篇论文吗？");

    if (!shouldContinue) return;

    setPendingDeleteId(id);
    setFeedback(null);

    try {
      const response = await fetch(`/api/admin/papers/${id}`, { method: "DELETE" });
      const payload = (await response.json().catch(() => null)) as ApiErrorPayload | null;

      if (!response.ok) {
        setFeedback(getDeleteErrorMessage(payload?.error));
        return;
      }

      setFeedback("论文已删除。");
      router.refresh();
    } finally {
      setPendingDeleteId(null);
    }
  }

  if (papers.length === 0) {
    return (
      <section aria-labelledby="admin-paper-table-title">
        <h3 id="admin-paper-table-title">论文列表</h3>
        <p>当前还没有论文记录，先通过上方表单创建第一个版本。</p>
      </section>
    );
  }

  return (
    <section aria-labelledby="admin-paper-table-title">
      <h3 id="admin-paper-table-title">论文列表</h3>
      {feedback ? <p role="status">{feedback}</p> : null}

      <table>
        <thead>
          <tr>
            <th scope="col">版本</th>
            <th scope="col">标题</th>
            <th scope="col">状态</th>
            <th scope="col">发布时间</th>
            <th scope="col">更新</th>
            <th scope="col">操作</th>
          </tr>
        </thead>
        <tbody>
          {papers.map((paper) => (
            <tr key={paper.id}>
              <td>{paper.version}</td>
              <td>
                <strong>{paper.title}</strong>
                {paper.subtitle ? <p>{paper.subtitle}</p> : null}
              </td>
              <td>{paper.status === "published" ? "已发布" : "草稿"}</td>
              <td>{paper.publishDateLabel}</td>
              <td>
                <time dateTime={paper.updatedAt}>{paper.updatedAtLabel}</time>
              </td>
              <td>
                <details>
                  <summary>编辑</summary>
                  <PaperForm
                    mode="edit"
                    paperId={paper.id}
                    submitLabel="保存更新"
                    initialValue={{
                      version: paper.version,
                      titleZh: paper.title,
                      titleEn: paper.subtitle,
                      abstractZh: paper.abstract,
                      abstractEn: paper.abstractEn ?? "",
                      status: paper.status,
                      pdfKey: paper.downloadUrl,
                      pdfFilename: paper.pdfFilename,
                      pdfSize: paper.pdfSize,
                    }}
                    onSuccess={() => {
                      setFeedback(`论文 ${paper.version} 已更新。`);
                    }}
                  />
                </details>
                <button
                  type="button"
                  disabled={pendingDeleteId === paper.id}
                  onClick={() => {
                    void handleDelete(paper.id);
                  }}
                >
                  {pendingDeleteId === paper.id ? "删除中..." : "删除"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
