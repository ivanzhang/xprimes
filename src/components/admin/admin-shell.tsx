import { AdminNav } from "@/components/admin/admin-nav";

interface AdminShellProps {
  title: string;
  description: string;
  adminEmail: string;
  currentPath?: string;
  children: React.ReactNode;
}

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
        <div className="admin-logout">
          <a href="/api/auth/logout">退出登录</a>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
