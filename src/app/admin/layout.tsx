import type { Metadata } from "next";
import { headers } from "next/headers";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminEmptyState } from "@/components/admin/empty-state";
import { requireAdminIdentity } from "@/lib/auth/admin-access";

export const metadata: Metadata = {
  title: "XPrimes Admin",
  description: "XPrimes 内容后台",
};

/**
 * 中文注释：后台布局在服务端读取请求头并执行严格守卫，未通过时只返回受控提示。
 * 使用示例：
 * ```tsx
 * <AdminLayout>
 *   <AdminHomePage />
 * </AdminLayout>
 * ```
 */
export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  try {
    const admin = requireAdminIdentity(await headers());

    return (
      <AdminShell
        title="内容后台"
        description="集中管理动态日志、论文版本与反质疑条目。"
        adminEmail={admin.email}
      >
        {children}
      </AdminShell>
    );
  } catch (error) {
    if (!(error instanceof Error) || error.message !== "UNAUTHORIZED_ADMIN") {
      throw error;
    }

    return (
      <main>
        <AdminEmptyState
          title="后台访问受限"
          description="需要使用管理员邮箱完成 Access 登录后才能进入后台。"
        />
      </main>
    );
  }
}
