export interface AdminNavItem {
  href: string;
  label: string;
  description: string;
}

// 中文注释：后台导航项集中定义，方便后续 Task 5/6/7 直接复用同一套路由。
export const ADMIN_NAV_ITEMS: readonly AdminNavItem[] = [
  {
    href: "/admin",
    label: "管理首页",
    description: "查看后台概览与快捷入口。",
  },
  {
    href: "/admin/logs",
    label: "动态日志管理",
    description: "维护研究动态、发布记录与时间线。",
  },
  {
    href: "/admin/papers",
    label: "论文版本管理",
    description: "维护论文版本、PDF 与发布状态。",
  },
  {
    href: "/admin/review",
    label: "反质疑条目管理",
    description: "维护结构化回应条目与状态。",
  },
] as const;

interface AdminNavProps {
  currentPath?: string;
}

/**
 * 中文注释：统一后台导航，避免后续每个后台页重复维护入口链接。
 * 使用示例：
 * ```tsx
 * <AdminNav currentPath="/admin/papers" />
 * ```
 */
export function AdminNav({ currentPath }: AdminNavProps) {
  return (
    <nav aria-label="后台导航">
      <ul>
        {ADMIN_NAV_ITEMS.map((item) => {
          const isCurrent = currentPath === item.href;

          return (
            <li key={item.href}>
              <a aria-current={isCurrent ? "page" : undefined} href={item.href}>
                {item.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
