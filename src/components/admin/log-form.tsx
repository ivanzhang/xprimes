"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export interface LogFormValue {
  title: string;
  content: string;
  excerptEn: string;
  publishedAt: string;
  isPinned: boolean;
}

interface LogFormProps {
  mode?: "create" | "edit";
  logId?: string;
  initialValue?: Partial<LogFormValue>;
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

const DEFAULT_LOG_FORM_VALUE: LogFormValue = {
  title: "",
  content: "",
  excerptEn: "",
  publishedAt: new Date().toISOString().slice(0, 10),
  isPinned: false,
};

function buildInitialValue(initialValue?: Partial<LogFormValue>): LogFormValue {
  return {
    ...DEFAULT_LOG_FORM_VALUE,
    ...initialValue,
  };
}

function getErrorMessage(errorCode?: string): string {
  switch (errorCode) {
    case "INVALID_LOG_INPUT":
      return "请补全标题、正文与发布时间，并使用 YYYY-MM-DD 日期格式。";
    case "UNAUTHORIZED_ADMIN":
      return "当前登录身份未通过后台白名单校验。";
    case "CLOUDFLARE_DB_UNAVAILABLE":
    case "CLOUDFLARE_RUNTIME_UNAVAILABLE":
      return "当前未连接 Cloudflare D1，暂时无法保存日志。";
    default:
      return "保存失败，请稍后重试。";
  }
}

/**
 * 中文注释：日志表单同时支持新建与编辑，两种模式都走同一套后台 API。
 * 使用示例：
 * ```tsx
 * <LogForm mode="create" submitLabel="立即发布" />
 * <LogForm mode="edit" logId="log-1" initialValue={value} submitLabel="保存更新" />
 * ```
 */
export function LogForm({
  mode = "create",
  logId,
  initialValue,
  submitLabel,
  onSuccess,
}: LogFormProps) {
  const router = useRouter();
  const [formValue, setFormValue] = useState<LogFormValue>(() => buildInitialValue(initialValue));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<FormFeedback | null>(null);

  const endpoint = mode === "edit" && logId ? `/api/admin/logs/${logId}` : "/api/admin/logs";
  const method = mode === "edit" ? "PATCH" : "POST";
  const resolvedSubmitLabel = submitLabel ?? (mode === "edit" ? "保存更新" : "立即发布");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(formValue),
      });
      const payload = (await response.json().catch(() => null)) as ApiErrorPayload | null;

      if (!response.ok) {
        setFeedback({
          tone: "error",
          message: getErrorMessage(payload?.error),
        });
        return;
      }

      if (mode === "create") {
        setFormValue(buildInitialValue(undefined));
      }

      setFeedback({
        tone: "success",
        message: mode === "edit" ? "日志已更新。" : "日志已发布。",
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
        <legend>{mode === "edit" ? "编辑日志" : "发布新日志"}</legend>
        <p>日志保存后会立即出现在前台 `/log` 与首页“最近动态”。</p>

        <label>
          标题
          <input
            name="title"
            type="text"
            value={formValue.title}
            onChange={(event) => {
              const { value } = event.currentTarget;
              setFormValue((current) => ({ ...current, title: value }));
            }}
          />
        </label>

        <label>
          发布时间
          <input
            name="publishedAt"
            type="date"
            value={formValue.publishedAt}
            onChange={(event) => {
              const { value } = event.currentTarget;
              setFormValue((current) => ({ ...current, publishedAt: value }));
            }}
          />
        </label>

        <label>
          英文摘要（可选）
          <input
            name="excerptEn"
            type="text"
            value={formValue.excerptEn}
            onChange={(event) => {
              const { value } = event.currentTarget;
              setFormValue((current) => ({ ...current, excerptEn: value }));
            }}
          />
        </label>

        <label>
          正文
          <textarea
            name="content"
            rows={8}
            value={formValue.content}
            onChange={(event) => {
              const { value } = event.currentTarget;
              setFormValue((current) => ({ ...current, content: value }));
            }}
          />
        </label>

        <label>
          <input
            name="isPinned"
            type="checkbox"
            checked={formValue.isPinned}
            onChange={(event) => {
              const { checked } = event.currentTarget;
              setFormValue((current) => ({ ...current, isPinned: checked }));
            }}
          />
          置顶展示
        </label>

        <button type="submit">{isSubmitting ? "保存中..." : resolvedSubmitLabel}</button>
      </fieldset>

      {feedback ? (
        <p role="status" data-tone={feedback.tone}>
          {feedback.message}
        </p>
      ) : null}
    </form>
  );
}
