import { LogList } from "@/components/site/log-list";
import { Comments } from "@/components/site/comments";
import { listPublicLogsFromRuntime } from "@/lib/repositories/log-repository";

export const revalidate = 60;

export default async function LogPage() {
  const logs = await listPublicLogsFromRuntime();

  return (
    <main>
      <section className="hero" style={{ paddingBottom: "var(--space-xl)" }}>
        <p className="hero-eyebrow">Timeline</p>
        <h1>动态日志</h1>
        <p className="hero-subtitle">
          按时间记录研究推进、版本准备与公开说明，保持研究过程的完整可追溯性。
        </p>
      </section>

      <section className="section">
        <LogList logs={logs} />
      </section>

      <Comments term="log" />
    </main>
  );
}
