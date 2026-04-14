"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export interface PaperFormValue {
  version: string;
  titleZh: string;
  titleEn: string;
  abstractZh: string;
  abstractEn: string;
  status: "draft" | "published";
  pdfKey: string;
  pdfFilename: string;
  pdfSize: number;
}

interface PaperFormProps {
  mode?: "create" | "edit";
  paperId?: string;
  initialValue?: Partial<PaperFormValue>;
  submitLabel?: string;
  onSuccess?: () => void;
}

interface FormFeedback {
  tone: "success" | "error";
  message: string;
}

interface ApiErrorPayload {
  error?: string;
}

const DEFAULT_PAPER_FORM_VALUE: PaperFormValue = {
  version: "",
  titleZh: "",
  titleEn: "",
  abstractZh: "",
  abstractEn: "",
  status: "draft",
  pdfKey: "",
  pdfFilename: "",
  pdfSize: 0,
};

function buildInitialValue(initialValue?: Partial<PaperFormValue>): PaperFormValue {
  return { ...DEFAULT_PAPER_FORM_VALUE, ...initialValue };
}

function getErrorMessage(errorCode?: string): string {
  switch (errorCode) {
    case "INVALID_PAPER_INPUT":
      return "请补全版本号、标题、摘要，并上传 PDF 文件。";
    case "UNAUTHORIZED_ADMIN":
      return "当前登录身份未通过后台白名单校验。";
    case "CLOUDFLARE_DB_UNAVAILABLE":
    case "CLOUDFLARE_RUNTIME_UNAVAILABLE":
      return "当前未连接 Cloudflare D1，暂时无法保存。";
    case "CLOUDFLARE_R2_UNAVAILABLE":
      return "当前未连接 Cloudflare R2，无法上传 PDF。";
    case "INVALID_PDF_UPLOAD":
      return "只能上传 PDF 文件，且大小不超过 20MB。";
    default:
      return "保存失败，请稍后重试。";
  }
}

export function PaperForm({
  mode = "create",
  paperId,
  initialValue,
  submitLabel,
  onSuccess,
}: PaperFormProps) {
  const router = useRouter();
  const [formValue, setFormValue] = useState<PaperFormValue>(() => buildInitialValue(initialValue));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [feedback, setFeedback] = useState<FormFeedback | null>(null);

  const endpoint =
    mode === "edit" && paperId ? `/api/admin/papers/${paperId}` : "/api/admin/papers";
  const method = mode === "edit" ? "PATCH" : "POST";
  const resolvedSubmitLabel = submitLabel ?? (mode === "edit" ? "保存更新" : "保存论文");

  async function handlePdfUpload(file: File) {
    setIsUploading(true);
    setFeedback(null);

    try {
      const body = new FormData();
      body.append("file", file);

      const response = await fetch("/api/admin/papers/upload", {
        method: "POST",
        body,
      });
      const payload = (await response.json().catch(() => null)) as {
        error?: string;
        file?: { key: string; filename: string; size: number };
      } | null;

      if (!response.ok) {
        setFeedback({
          tone: "error",
          message: getErrorMessage(payload?.error),
        });
        return;
      }

      const uploaded = payload?.file;
      if (!uploaded) {
        setFeedback({ tone: "error", message: "上传响应格式异常。" });
        return;
      }
      setFormValue((current) => ({
        ...current,
        pdfKey: uploaded.key,
        pdfFilename: uploaded.filename,
        pdfSize: uploaded.size,
      }));
      setFeedback({ tone: "success", message: `PDF 已上传：${uploaded.filename}` });
    } finally {
      setIsUploading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(formValue),
      });
      const payload = (await response.json().catch(() => null)) as ApiErrorPayload | null;

      if (!response.ok) {
        setFeedback({ tone: "error", message: getErrorMessage(payload?.error) });
        return;
      }

      if (mode === "create") {
        setFormValue(buildInitialValue(undefined));
      }

      setFeedback({
        tone: "success",
        message: mode === "edit" ? "论文已更新。" : "论文已保存。",
      });
      onSuccess?.();
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <fieldset disabled={isSubmitting}>
        <legend>{mode === "edit" ? "编辑论文" : "新增论文版本"}</legend>

        <label>
          版本号
          <input
            name="version"
            type="text"
            placeholder="例如 v0.1"
            value={formValue.version}
            onChange={(e) => {
              const { value } = e.currentTarget;
              setFormValue((c) => ({ ...c, version: value }));
            }}
          />
        </label>

        <label>
          中文标题
          <input
            name="titleZh"
            type="text"
            value={formValue.titleZh}
            onChange={(e) => {
              const { value } = e.currentTarget;
              setFormValue((c) => ({ ...c, titleZh: value }));
            }}
          />
        </label>

        <label>
          英文标题
          <input
            name="titleEn"
            type="text"
            value={formValue.titleEn}
            onChange={(e) => {
              const { value } = e.currentTarget;
              setFormValue((c) => ({ ...c, titleEn: value }));
            }}
          />
        </label>

        <label>
          中文摘要
          <textarea
            name="abstractZh"
            rows={4}
            value={formValue.abstractZh}
            onChange={(e) => {
              const { value } = e.currentTarget;
              setFormValue((c) => ({ ...c, abstractZh: value }));
            }}
          />
        </label>

        <label>
          英文摘要（可选）
          <textarea
            name="abstractEn"
            rows={3}
            value={formValue.abstractEn}
            onChange={(e) => {
              const { value } = e.currentTarget;
              setFormValue((c) => ({ ...c, abstractEn: value }));
            }}
          />
        </label>

        <label>
          上传 PDF
          <input
            name="pdfFile"
            type="file"
            accept=".pdf"
            disabled={isUploading}
            onChange={(e) => {
              const file = e.currentTarget.files?.[0];
              if (file) {
                void handlePdfUpload(file);
              }
            }}
          />
        </label>
        {formValue.pdfFilename ? (
          <p>
            当前文件：{formValue.pdfFilename}（{Math.round(formValue.pdfSize / 1024)} KB）
          </p>
        ) : null}

        <label>
          发布状态
          <select
            name="status"
            value={formValue.status}
            onChange={(e) => {
              const value = e.currentTarget.value as "draft" | "published";
              setFormValue((c) => ({ ...c, status: value }));
            }}
          >
            <option value="draft">草稿</option>
            <option value="published">发布</option>
          </select>
        </label>

        <button type="submit">
          {isSubmitting ? "保存中..." : resolvedSubmitLabel}
        </button>
      </fieldset>

      {feedback ? (
        <p role="status" data-tone={feedback.tone}>
          {feedback.message}
        </p>
      ) : null}
    </form>
  );
}
