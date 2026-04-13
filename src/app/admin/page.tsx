import { ADMIN_NAV_ITEMS } from "@/components/admin/admin-nav";

const ADMIN_ENTRY_ITEMS = ADMIN_NAV_ITEMS.filter((item) => item.href !== "/admin");

/**
 * 中文注释：后台首页只提供三个核心管理入口，为后续具体表单页预留落点。
 * 使用示例：
 * ```tsx
 * <AdminHomePage />
 * ```
 */
export default function AdminHomePage() {
  return (
    <section aria-labelledby="admin-home-title">
      <h2 id="admin-home-title">管理首页</h2>
      <p>先通过统一后台壳层进入各模块，后续表单与数据操作会在独立任务中补齐。</p>
      <div>
        {ADMIN_ENTRY_ITEMS.map((item) => (
          <article key={item.href}>
            <h3>{item.label}</h3>
            <p>{item.description}</p>
            <a href={item.href}>进入{item.label}</a>
          </article>
        ))}
      </div>
    </section>
  );
}
