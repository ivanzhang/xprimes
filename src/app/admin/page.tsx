import { ADMIN_NAV_ITEMS } from "@/components/admin/admin-nav";
import { tryGetCloudflareRuntimeContext } from "@/lib/cloudflare/context";
import { getAdminDashboardStats, type AdminDashboardStats } from "@/lib/repositories/admin-stats";

const ADMIN_ENTRY_ITEMS = ADMIN_NAV_ITEMS.filter((item) => item.href !== "/admin");

function StatCard({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <div style={{
      background: "var(--color-bg)", border: "1px solid var(--color-border)",
      borderRadius: "var(--radius-lg)", padding: "var(--space-lg)", textAlign: "center",
    }}>
      <p style={{ fontSize: "2rem", fontWeight: 300, color: "var(--color-heading)", lineHeight: 1, margin: 0 }}>
        {value}
      </p>
      <p style={{ fontSize: "0.8125rem", color: "var(--color-body)", margin: "4px 0 0" }}>{label}</p>
      {sub ? <p style={{ fontSize: "0.6875rem", color: "var(--color-purple)", margin: "2px 0 0" }}>{sub}</p> : null}
    </div>
  );
}

function Dashboard({ stats }: { stats: AdminDashboardStats }) {
  return (
    <div style={{ marginBottom: "var(--space-xl)" }}>
      <h3 style={{ fontSize: "1rem", fontWeight: 500, color: "var(--color-label)", marginBottom: "var(--space-md)" }}>
        数据概览
      </h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "var(--space-md)" }}>
        <StatCard label="动态日志" value={stats.logs.total} sub={`近 7 天 +${stats.logs.recent7d}`} />
        <StatCard label="论文总数" value={stats.papers.total} sub={`上架 ${stats.papers.published} / 下架 ${stats.papers.draft}`} />
        <StatCard label="反质疑条目" value={stats.reviews.total} sub={`近 7 天 +${stats.reviews.recent7d}`} />
        <StatCard label="评论" value={stats.comments.total} sub={`已隐藏 ${stats.comments.hidden} / 近 7 天 +${stats.comments.recent7d}`} />
        <StatCard label="后台登录" value={stats.logins.total} sub={`近 7 天 ${stats.logins.recent7d} 次 / ${stats.logins.uniqueEmails} 人`} />
      </div>
    </div>
  );
}

export default async function AdminHomePage() {
  let stats: AdminDashboardStats | null = null;

  try {
    const runtime = await tryGetCloudflareRuntimeContext();
    if (runtime?.db) {
      stats = await getAdminDashboardStats(runtime.db);
    }
  } catch {
    // fallback: no stats
  }

  return (
    <section>
      <h2>管理首页</h2>
      <p>内容管理与数据概览。</p>

      {stats ? <Dashboard stats={stats} /> : null}

      <h3 style={{ fontSize: "1rem", fontWeight: 500, color: "var(--color-label)", marginBottom: "var(--space-md)" }}>
        快捷入口
      </h3>
      <div aria-label="后台功能入口">
        {ADMIN_ENTRY_ITEMS.map((item) => (
          <article key={item.href}>
            <h3>{item.label}</h3>
            <p>{item.description}</p>
            <a href={item.href}>进入 →</a>
          </article>
        ))}
      </div>
    </section>
  );
}
