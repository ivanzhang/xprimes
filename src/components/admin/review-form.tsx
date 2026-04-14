"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export interface ReviewFormValue {
  code: string;
  itemType: "open" | "resolved";
  title: string;
  reference: string;
  questionBody: string;
  responseBody: string;
  status: "draft" | "published";
}

interface ReviewFormProps {
  mode?: "create" | "edit";
  reviewId?: string;
  initialValue?: Partial<ReviewFormValue>;
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

const DEFAULT_REVIEW_FORM_VALUE: ReviewFormValue = {
  code: "",
  itemType: "open",
  title: "",
  reference: "",
  questionBody: "",
  responseBody: "",
  status: "draft",
};

function buildInitialValue(initialValue?: Partial<ReviewFormValue>): ReviewFormValue {
  return { ...DEFAULT_REVIEW_FORM_VALUE, ...initialValue };
}

function getErrorMessage(errorCode?: string): string {
  switch (errorCode) {
    case "INVALID_REVIEW_INPUT":
      return "请补全编号、标题、引用来源和质疑内容。";
    case "UNAUTHORIZED_ADMIN":
      return "当前登录身份未通过后台白名单校验。";
    case "CLOUDFLARE_DB_UNAVAILABLE":
    case "CLOUDFLARE_RUNTIME_UNAVAILABLE":
      return "当前未连接 Cloudflare D1，暂时无法保存。";
    default:
      return "保存失败，请稍后重试。";
  }
}

export function ReviewForm({
  mode = "create",
  reviewId,
  initialValue,
  submitLabel,
  onSuccess,
}: ReviewFormProps) {
  const router = useRouter();
  const [formValue, setFormValue] = useState<ReviewFormValue>(() =>
    buildInitialValue(initialValue),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<FormFeedback | null>(null);

  const endpoint =
    mode === "edit" && reviewId ? `/api/admin/review/${reviewId}` : "/api/admin/review";
  const method = mode === "edit" ? "PATCH" : "POST";
  const resolvedSubmitLabel = submitLabel ?? (mode === "edit" ? "保存更新" : "保存条目");

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
        message: mode === "edit" ? "条目已更新。" : "条目已保存。",
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
        <legend>{mode === "edit" ? "编辑条目" : "新增反质疑条目"}</legend>

        <label>
          编号
          <input
            name="code"
            type="text"
            placeholder="例如 Q-001"
            value={formValue.code}
            onChange={(e) => {
              const { value } = e.currentTarget;
              setFormValue((c) => ({ ...c, code: value }));
            }}
          />
        </label>

        <label>
          类型
          <select
            name="itemType"
            value={formValue.itemType}
            onChange={(e) => {
              const value = e.currentTarget.value as "open" | "resolved";
              setFormValue((c) => ({ ...c, itemType: value }));
            }}
          >
            <option value="open">待解答</option>
            <option value="resolved">已回应</option>
          </select>
        </label>

        <label>
          标题
          <input
            name="title"
            type="text"
            value={formValue.title}
            onChange={(e) => {
              const { value } = e.currentTarget;
              setFormValue((c) => ({ ...c, title: value }));
            }}
          />
        </label>

        <label>
          引用来源
          <input
            name="reference"
            type="text"
            placeholder="论文章节、文献引用等"
            value={formValue.reference}
            onChange={(e) => {
              const { value } = e.currentTarget;
              setFormValue((c) => ({ ...c, reference: value }));
            }}
          />
        </label>

        <label>
          质疑内容
          <textarea
            name="questionBody"
            rows={4}
            value={formValue.questionBody}
            onChange={(e) => {
              const { value } = e.currentTarget;
              setFormValue((c) => ({ ...c, questionBody: value }));
            }}
          />
        </label>

        <label>
          回应内容（可选）
          <textarea
            name="responseBody"
            rows={4}
            value={formValue.responseBody}
            onChange={(e) => {
              const { value } = e.currentTarget;
              setFormValue((c) => ({ ...c, responseBody: value }));
            }}
          />
        </label>

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
