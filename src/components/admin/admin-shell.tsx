import { AdminNav } from "@/components/admin/admin-nav";

interface AdminShellProps {
  title: string;
  description: string;
  adminEmail: string;
  currentPath?: string;
  children: React.ReactNode;
}

/**
 * 中文注释：后台统一壳层，负责标题、身份信息、导航与主内容区编排。
 * 使用示例：
 * ```tsx
 * <AdminShell title="内容后台" description="维护站点内容。" adminEmail="amy@xprimes.cn">
 *   <section>页面主体</section>
 * </AdminShell>
 * ```
 */
export function AdminShell({
  title,
  description,
  adminEmail,
  currentPath,
  children,
}: AdminShellProps) {
  return (
    <div data-admin-shell="true">
      <header>
        <p>Admin Console</p>
        <h1>{title}</h1>
        <p>{description}</p>
        <p>当前管理员：{adminEmail}</p>
        <AdminNav currentPath={currentPath} />
      </header>
      <main>{children}</main>
    </div>
  );
}
