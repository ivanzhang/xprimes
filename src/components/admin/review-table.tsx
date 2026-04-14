"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminReviewItem } from "@/lib/repositories/review-repository";
import { ReviewForm } from "@/components/admin/review-form";
import { Modal } from "@/components/admin/modal";
import { ConfirmDelete } from "@/components/admin/confirm-delete";

interface ReviewTableProps {
  items: AdminReviewItem[];
}

export function ReviewTable({ items }: ReviewTableProps) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<AdminReviewItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<AdminReviewItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  async function handleDelete() {
    if (!deletingItem) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/admin/review/${deletingItem.id}`, { method: "DELETE" });
      if (res.ok) {
        setFeedback(`条目 ${deletingItem.code} 已移入回收站。`);
        setDeletingItem(null);
        router.refresh();
      }
    } finally {
      setDeleteLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <section>
        <h3>条目列表</h3>
        <p style={{ color: "var(--color-body)" }}>当前还没有反质疑条目。</p>
      </section>
    );
  }

  return (
    <section>
      <h3>条目列表（{items.length}）</h3>
      {feedback ? <p role="status">{feedback}</p> : null}

      <table>
        <thead>
          <tr>
            <th>编号</th>
            <th>标题</th>
            <th>类型</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td><code style={{ fontSize: "0.75rem" }}>{item.code}</code></td>
              <td><strong>{item.title}</strong></td>
              <td>{item.itemType === "open" ? "待解答" : "已回应"}</td>
              <td>
                <span className={`badge ${item.status === "published" ? "badge-success" : "badge-draft"}`}>
                  {item.status === "published" ? "已发布" : "草稿"}
                </span>
              </td>
              <td>
                <button type="button" onClick={() => setEditingItem(item)}
                  style={{ background: "var(--color-purple-surface)", color: "var(--color-purple)", border: "1px solid var(--color-border-purple)", padding: "4px 12px", borderRadius: "var(--radius-sm)", fontSize: "0.75rem", cursor: "pointer", fontFamily: "var(--font-sans)" }}>
                  编辑
                </button>
                <button type="button" onClick={() => setDeletingItem(item)}
                  style={{ marginLeft: 8, background: "transparent", color: "var(--color-ruby)", border: "1px solid rgba(234,34,97,0.2)", padding: "4px 12px", borderRadius: "var(--radius-sm)", fontSize: "0.75rem", cursor: "pointer", fontFamily: "var(--font-sans)" }}>
                  删除
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal open={!!editingItem} onClose={() => setEditingItem(null)} title="编辑条目">
        {editingItem ? (
          <ReviewForm
            mode="edit"
            reviewId={editingItem.id}
            submitLabel="保存更新"
            initialValue={{
              code: editingItem.code,
              itemType: editingItem.itemType,
              title: editingItem.title,
              reference: editingItem.reference,
              questionBody: editingItem.questionBody,
              responseBody: editingItem.responseBody ?? "",
              status: editingItem.status,
            }}
            onSuccess={() => { setEditingItem(null); setFeedback(`条目已更新。`); }}
          />
        ) : null}
      </Modal>

      <Modal open={!!deletingItem} onClose={() => setDeletingItem(null)} title="确认删除">
        {deletingItem ? (
          <ConfirmDelete
            itemName={`${deletingItem.code} - ${deletingItem.title}`}
            onConfirm={handleDelete}
            onCancel={() => setDeletingItem(null)}
            loading={deleteLoading}
          />
        ) : null}
      </Modal>
    </section>
  );
}
