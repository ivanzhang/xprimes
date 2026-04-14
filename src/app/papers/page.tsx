import { STATIC_PAPERS } from "@/lib/static-papers";
import { Comments } from "@/components/site/comments";

export const revalidate = 60;

export default function PapersPage() {
  const grouped = {
    "分布刚性原理": STATIC_PAPERS.filter((p) => p.method === "分布刚性原理"),
    "递归剥离动力系统": STATIC_PAPERS.filter((p) => p.method === "递归剥离动力系统"),
    "方阵几何斜线映射": STATIC_PAPERS.filter((p) => p.method === "方阵几何斜线映射"),
  };

  return (
    <main>
      <section className="hero" style={{ paddingBottom: "var(--space-xl)" }}>
        <p className="hero-eyebrow">Research Papers</p>
        <h1>研究论文</h1>
        <p className="hero-subtitle">
          共 {STATIC_PAPERS.length} 篇初稿论文，覆盖数论七大经典猜想。
          所有论文可在线阅读或下载 PDF。
        </p>
      </section>

      {Object.entries(grouped).map(([method, papers]) => (
        <section key={method} className="section">
          <p className="section-eyebrow">{method.toUpperCase()}</p>
          <h2 className="section-title">{method}</h2>
          <div className="card-grid">
            {papers.map((paper) => (
              <div key={paper.filename} className="card paper-card">
                <span className="paper-version">{paper.category}</span>
                <h3 className="card-title">{paper.title}</h3>
                <div className="paper-actions">
                  <a
                    href={`/papers/${encodeURIComponent(paper.filename)}`}
                    className="btn btn-primary"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    在线阅读
                  </a>
                  <a
                    href={`/papers/${encodeURIComponent(paper.filename)}`}
                    className="btn btn-ghost"
                    download
                  >
                    下载 PDF
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      <Comments term="papers" />
    </main>
  );
}
