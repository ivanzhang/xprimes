"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminPaperItem } from "@/lib/db/mappers";
import { PaperForm } from "@/components/admin/paper-form";
import { Modal } from "@/components/admin/modal";
import { ConfirmDelete } from "@/components/admin/confirm-delete";

interface PaperTableProps {
  papers: AdminPaperItem[];
}

export function PaperTable({ papers }: PaperTableProps) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [editingPaper, setEditingPaper] = useState<AdminPaperItem | null>(null);
  const [deletingPaper, setDeletingPaper] = useState<AdminPaperItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  async function handleToggleStatus(paper: AdminPaperItem) {
    setTogglingId(paper.id);
    const newStatus = paper.status === "published" ? "draft" : "published";
    try {
      const res = await fetch(`/api/admin/papers/${paper.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          version: paper.version,
          titleZh: paper.title,
          titleEn: paper.subtitle,
          abstractZh: paper.abstract,
          abstractEn: paper.abstractEn ?? "",
          status: newStatus,
          pdfKey: paper.downloadUrl,
          pdfFilename: paper.pdfFilename,
          pdfSize: paper.pdfSize,
        }),
      });
      if (res.ok) {
        setFeedback(`${paper.title} 已${newStatus === "published" ? "上架" : "下架"}。`);
        router.refresh();
      }
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete() {
    if (!deletingPaper) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/admin/papers/${deletingPaper.id}`, { method: "DELETE" });
      if (res.ok) {
        setFeedback(`论文已移入回收站。`);
        setDeletingPaper(null);
        router.refresh();
      }
    } finally {
      setDeleteLoading(false);
    }
  }

  if (papers.length === 0) {
    return (
      <section>
        <h3>论文列表</h3>
        <p style={{ color: "var(--color-body)" }}>当前还没有论文记录。</p>
      </section>
    );
  }

  return (
    <section>
      <h3>论文列表（{papers.length}）</h3>
      {feedback ? <p role="status">{feedback}</p> : null}

      <table>
        <thead>
          <tr>
            <th>版本</th>
            <th>标题</th>
            <th>状态</th>
            <th>发布时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {papers.map((paper) => (
            <tr key={paper.id}>
              <td><code style={{ fontSize: "0.75rem" }}>{paper.version}</code></td>
              <td><strong>{paper.title}</strong></td>
              <td>
                <span className={`badge ${paper.status === "published" ? "badge-success" : "badge-draft"}`}>
                  {paper.status === "published" ? "已上架" : "已下架"}
                </span>
              </td>
              <td>{paper.publishDateLabel}</td>
              <td style={{ whiteSpace: "nowrap" }}>
                <button
                  type="button"
                  onClick={() => handleToggleStatus(paper)}
                  disabled={togglingId === paper.id}
                  style={{
                    background: paper.status === "published" ? "rgba(234,34,97,0.06)" : "rgba(21,190,83,0.08)",
                    color: paper.status === "published" ? "var(--color-ruby)" : "#108c3d",
                    border: `1px solid ${paper.status === "published" ? "rgba(234,34,97,0.2)" : "rgba(21,190,83,0.3)"}`,
                    padding: "4px 12px", borderRadius: "var(--radius-sm)", fontSize: "0.75rem",
                    cursor: "pointer", fontFamily: "var(--font-sans)",
                  }}
                >
                  {togglingId === paper.id ? "..." : paper.status === "published" ? "下架" : "上架"}
                </button>
                <button type="button" onClick={() => setEditingPaper(paper)}
                  style={{ marginLeft: 6, background: "var(--color-purple-surface)", color: "var(--color-purple)", border: "1px solid var(--color-border-purple)", padding: "4px 12px", borderRadius: "var(--radius-sm)", fontSize: "0.75rem", cursor: "pointer", fontFamily: "var(--font-sans)" }}>
                  编辑
                </button>
                <button type="button" onClick={() => setDeletingPaper(paper)}
                  style={{ marginLeft: 6, background: "transparent", color: "var(--color-ruby)", border: "1px solid rgba(234,34,97,0.2)", padding: "4px 12px", borderRadius: "var(--radius-sm)", fontSize: "0.75rem", cursor: "pointer", fontFamily: "var(--font-sans)" }}>
                  删除
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal open={!!editingPaper} onClose={() => setEditingPaper(null)} title="编辑论文">
        {editingPaper ? (
          <PaperForm
            mode="edit"
            paperId={editingPaper.id}
            submitLabel="保存更新"
            initialValue={{
              version: editingPaper.version,
              titleZh: editingPaper.title,
              titleEn: editingPaper.subtitle,
              abstractZh: editingPaper.abstract,
              abstractEn: editingPaper.abstractEn ?? "",
              status: editingPaper.status,
              pdfKey: editingPaper.downloadUrl,
              pdfFilename: editingPaper.pdfFilename,
              pdfSize: editingPaper.pdfSize,
            }}
            onSuccess={() => { setEditingPaper(null); setFeedback("论文已更新。"); }}
          />
        ) : null}
      </Modal>

      <Modal open={!!deletingPaper} onClose={() => setDeletingPaper(null)} title="确认删除">
        {deletingPaper ? (
          <ConfirmDelete
            itemName={deletingPaper.title}
            onConfirm={handleDelete}
            onCancel={() => setDeletingPaper(null)}
            loading={deleteLoading}
          />
        ) : null}
      </Modal>
    </section>
  );
}
