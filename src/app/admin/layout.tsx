import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminLogin } from "@/components/admin/admin-login";
import { getAdminFromSession } from "@/lib/auth/admin-access";
import "./admin.css";

export const metadata: Metadata = {
  title: "XPrimes Admin",
  description: "XPrimes 内容后台",
};

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const admin = await getAdminFromSession();

  if (!admin) {
    return (
      <main>
        <AdminLogin />
      </main>
    );
  }

  return (
    <AdminShell
      title="内容后台"
      description="集中管理动态日志、论文版本与反质疑条目。"
      adminEmail={admin.email}
    >
      {children}
    </AdminShell>
  );
}
