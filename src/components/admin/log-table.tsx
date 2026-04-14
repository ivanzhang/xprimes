"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminLogItem } from "@/lib/db/mappers";
import { LogForm } from "@/components/admin/log-form";
import { Modal } from "@/components/admin/modal";
import { ConfirmDelete } from "@/components/admin/confirm-delete";

interface LogTableProps {
  logs: AdminLogItem[];
}

export function LogTable({ logs }: LogTableProps) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [editingLog, setEditingLog] = useState<AdminLogItem | null>(null);
  const [deletingLog, setDeletingLog] = useState<AdminLogItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  async function handleDelete() {
    if (!deletingLog) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/admin/logs/${deletingLog.id}`, { method: "DELETE" });
      if (res.ok) {
        setFeedback(`日志《${deletingLog.title}》已移入回收站。`);
        setDeletingLog(null);
        router.refresh();
      } else {
        setFeedback("操作失败，请重试。");
      }
    } finally {
      setDeleteLoading(false);
    }
  }

  if (logs.length === 0) {
    return (
      <section>
        <h3>已发布日志</h3>
        <p style={{ color: "var(--color-body)" }}>当前还没有日志，先通过上方表单创建第一条。</p>
      </section>
    );
  }

  return (
    <section>
      <h3>已发布日志（{logs.length}）</h3>
      {feedback ? <p role="status">{feedback}</p> : null}

      <table>
        <thead>
          <tr>
            <th>标题</th>
            <th>发布时间</th>
            <th>置顶</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id}>
              <td><strong>{log.title}</strong></td>
              <td><time dateTime={log.publishedAt}>{log.publishedAtLabel}</time></td>
              <td>{log.isPinned ? "是" : "—"}</td>
              <td>
                <button type="button" onClick={() => setEditingLog(log)}
                  style={{ background: "var(--color-purple-surface)", color: "var(--color-purple)", border: "1px solid var(--color-border-purple)", padding: "4px 12px", borderRadius: "var(--radius-sm)", fontSize: "0.75rem", cursor: "pointer", fontFamily: "var(--font-sans)" }}>
                  编辑
                </button>
                <button type="button" onClick={() => setDeletingLog(log)}
                  style={{ marginLeft: 8, background: "transparent", color: "var(--color-ruby)", border: "1px solid rgba(234,34,97,0.2)", padding: "4px 12px", borderRadius: "var(--radius-sm)", fontSize: "0.75rem", cursor: "pointer", fontFamily: "var(--font-sans)" }}>
                  删除
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal open={!!editingLog} onClose={() => setEditingLog(null)} title="编辑日志">
        {editingLog ? (
          <LogForm
            mode="edit"
            logId={editingLog.id}
            submitLabel="保存更新"
            initialValue={{
              title: editingLog.title,
              content: editingLog.content,
              excerptEn: editingLog.excerptEn ?? "",
              publishedAt: editingLog.publishedAt,
              isPinned: editingLog.isPinned,
            }}
            onSuccess={() => { setEditingLog(null); setFeedback(`日志已更新。`); }}
          />
        ) : null}
      </Modal>

      <Modal open={!!deletingLog} onClose={() => setDeletingLog(null)} title="确认删除">
        {deletingLog ? (
          <ConfirmDelete
            itemName={deletingLog.title}
            onConfirm={handleDelete}
            onCancel={() => setDeletingLog(null)}
            loading={deleteLoading}
          />
        ) : null}
      </Modal>
    </section>
  );
}
