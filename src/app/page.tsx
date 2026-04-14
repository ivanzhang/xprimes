import { LogList } from "@/components/site/log-list";
import { listPublicLogsFromRuntime } from "@/lib/repositories/log-repository";
import { STATIC_PAPERS } from "@/lib/static-papers";

export const revalidate = 60;

export default async function HomePage() {
  const latestLogs = (await listPublicLogsFromRuntime()).slice(0, 3);

  return (
    <main>
      {/* Hero */}
      <section className="hero">
        <p className="hero-eyebrow">Mathematics Research Archive</p>
        <h1>素数分布的结构原理</h1>
        <p className="hero-subtitle">
          一个围绕素数分布结构展开的独立研究项目。通过分布刚性原理、递归剥离动力系统与方阵几何斜线映射等方法，
          系统性地推进数论七大经典猜想的研究论证。
        </p>
        <div className="hero-actions">
          <a href="/papers" className="btn btn-primary">
            查看论文
          </a>
          <a
            href="https://github.com/ivanzhang/xprimes"
            className="btn btn-ghost"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub 仓库
          </a>
        </div>
      </section>

      {/* Stats */}
      <section className="section">
        <div className="stats-row">
          <div className="stat-item">
            <p className="stat-number">{STATIC_PAPERS.length}</p>
            <p className="stat-label">研究论文</p>
          </div>
          <div className="stat-item">
            <p className="stat-number">7</p>
            <p className="stat-label">经典猜想</p>
          </div>
          <div className="stat-item">
            <p className="stat-number">3</p>
            <p className="stat-label">核心方法</p>
          </div>
        </div>
      </section>

      {/* Core Methods */}
      <section className="section">
        <p className="section-eyebrow">METHODOLOGY</p>
        <h2 className="section-title">三大核心方法</h2>
        <p className="section-desc">
          从不同数学维度切入素数分布问题，形成相互印证的理论框架。
        </p>
        <div className="card-grid">
          <div className="card">
            <h3 className="card-title">分布刚性原理</h3>
            <p className="card-body">
              揭示素数分布的内在结构约束，建立统一的数学世界观，从哲学与数理双重视角阐释素数分布的本质规律。
            </p>
          </div>
          <div className="card">
            <h3 className="card-title">递归剥离动力系统</h3>
            <p className="card-body">
              通过动力系统方法逐层剥离合数结构，应用于 Cramér 猜想、考拉兹猜想与林尼克定理最小指数等问题的研究论证。
            </p>
          </div>
          <div className="card">
            <h3 className="card-title">方阵几何斜线映射</h3>
            <p className="card-body">
              利用方阵几何的斜线映射结构，从全新角度推进勒让德猜想、孪生素数猜想与哥德巴赫猜想的研究。
            </p>
          </div>
        </div>
      </section>

      {/* Papers Preview */}
      <section className="section">
        <p className="section-eyebrow">PAPERS</p>
        <h2 className="section-title">研究论文</h2>
        <p className="section-desc">
          以下论文为当前研究阶段的初稿，持续与 AI 协作推进严谨论证。
        </p>
        <div className="card-grid">
          {STATIC_PAPERS.slice(0, 6).map((paper) => (
            <div key={paper.filename} className="card paper-card">
              <span className="paper-version">初稿</span>
              <h3 className="card-title">{paper.title}</h3>
              <p className="paper-meta">{paper.category}</p>
              <div className="paper-actions">
                <a
                  href={`/papers/${encodeURIComponent(paper.filename)}`}
                  className="btn btn-primary"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  阅读 PDF
                </a>
                <a
                  href={`/papers/${encodeURIComponent(paper.filename)}`}
                  className="btn btn-ghost"
                  download
                >
                  下载
                </a>
              </div>
            </div>
          ))}
        </div>
        {STATIC_PAPERS.length > 6 ? (
          <p style={{ textAlign: "center", marginTop: "var(--space-lg)" }}>
            <a href="/papers" className="btn btn-ghost">
              查看全部 {STATIC_PAPERS.length} 篇论文
            </a>
          </p>
        ) : null}
      </section>

      {/* Activity / Research Timeline */}
      <section className="section section-dark">
        <p className="section-eyebrow">PROGRESS</p>
        <h2 className="section-title">研究动态</h2>
        <p className="section-desc" style={{ color: "rgba(255,255,255,0.7)" }}>
          项目持续推进中 — 以下为近期与 AI 协作研究数论七大经典猜想的工作截图。
        </p>
        <div className="activity-grid">
          {[
            { src: "/pics/数论突破.png", caption: "分布刚性原理核心突破" },
            { src: "/pics/微信图片_20260412073454_6_38.png", caption: "方阵几何研究讨论" },
            { src: "/pics/微信图片_20260412073457_7_38.png", caption: "递归剥离系统推导" },
            { src: "/pics/微信图片_20260412073458_8_38.png", caption: "猜想论证过程" },
            { src: "/pics/微信图片_20260412073500_9_38.png", caption: "数学结构分析" },
            { src: "/pics/微信图片_20260412112117_42_38.png", caption: "AI 协作数论研究" },
            { src: "/pics/微信图片_20260412130543_91_38.png", caption: "论文框架整理" },
            { src: "/pics/微信图片_20260412073502_10_38.jpg", caption: "跨猜想统一视角" },
          ].map((item) => (
            <div key={item.src} className="activity-item">
              <img src={item.src} alt={item.caption} loading="lazy" width={400} height={300} />
              <p className="activity-item-caption">{item.caption}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Latest Logs */}
      <section className="section">
        <p className="section-eyebrow">LATEST</p>
        <h2 className="section-title">最近动态</h2>
        <p className="section-desc">
          记录关键变更、版本准备与公开说明，保持研究过程的可追溯性。
        </p>
        <LogList logs={latestLogs} />
        <p style={{ marginTop: "var(--space-md)" }}>
          <a href="/log">查看全部动态 →</a>
        </p>
      </section>

      {/* Contact */}
      <section className="section">
        <p className="section-eyebrow">CONTACT</p>
        <h2 className="section-title">联系方式</h2>
        <div className="contact-card">
          <p>
            <strong>主联系邮箱：</strong>
            <a href="mailto:amy@xprimes.cn">amy@xprimes.cn</a>
          </p>
          <p style={{ marginTop: "var(--space-sm)" }}>
            <strong>辅助邮箱：</strong>
            <a href="mailto:yiyi@xprimes.cn">yiyi@xprimes.cn</a>
          </p>
          <p style={{ marginTop: "var(--space-md)", fontSize: "0.875rem" }}>
            欢迎提供结构化反馈、版本勘误与数学讨论。
          </p>
        </div>
      </section>
    </main>
  );
}
