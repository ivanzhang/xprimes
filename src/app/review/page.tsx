import { ReviewList } from "@/components/site/review-list";
import { Comments } from "@/components/site/comments";
import { listPublishedReviewSections } from "@/lib/repositories/review-repository";

export const revalidate = 60;

export default function ReviewPage() {
  const sections = listPublishedReviewSections();

  return (
    <main>
      <section className="hero" style={{ paddingBottom: "var(--space-xl)" }}>
        <p className="hero-eyebrow">Review &amp; Discussion</p>
        <h1>审读与反馈</h1>
        <p className="hero-subtitle">
          本页用于结构化记录问题、质疑与回应。目标是降低讨论成本，推动严谨验证。
        </p>
      </section>

      <section className="section">
        <p className="section-eyebrow">PROTOCOL</p>
        <h2 className="section-title">审读协议</h2>
        <div className="card-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
          <div className="card">
            <h3 className="card-title">引用定位</h3>
            <p className="card-body">
              每条质疑应引用具体的定义、引理或定理，确保讨论可追溯。
            </p>
          </div>
          <div className="card">
            <h3 className="card-title">具体明确</h3>
            <p className="card-body">
              模糊或非特定的反对意见不会被追踪，请提供可验证的数学论据。
            </p>
          </div>
          <div className="card">
            <h3 className="card-title">结构化回应</h3>
            <p className="card-body">
              所有回应将指向具体章节或修订版本，确保讨论的持续性。
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <ReviewList sections={sections} />
      </section>

      <section className="section">
        <p className="section-eyebrow">SUBMIT</p>
        <h2 className="section-title">提交反馈</h2>
        <div className="contact-card">
          <p>如需提交结构化反馈，请通过邮件提供引用位置、问题描述与必要上下文。</p>
          <pre style={{
            background: "rgba(83, 58, 253, 0.05)",
            padding: "var(--space-md)",
            borderRadius: "var(--radius-md)",
            fontSize: "0.8125rem",
            marginTop: "var(--space-md)",
            overflow: "auto",
            fontFamily: "var(--font-mono)",
          }}>{`Subject: XPrimes Review - [简短标题]

Reference: 定义 / 引理 / 定理编号
Comment: 具体且清晰的数学论述

发送至: amy@xprimes.cn`}</pre>
        </div>
      </section>

      <Comments term="review" />
    </main>
  );
}
