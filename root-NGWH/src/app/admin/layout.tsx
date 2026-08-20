import React from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/server/auth/adminAuth";
import { AdminSidebar } from "@/components/admin/AdminSidebar/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader/AdminHeader";
import styles from "./adminLayout.module.scss";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headerList = await headers();
  const pathname = headerList.get("x-pathname") || "";

  // Allow login page to render without layout or auth check
  if (pathname === "/admin/login" || pathname.startsWith("/admin/login")) {
    return <>{children}</>;
  }

  const session = await getAdminSession();
  if (!session.authenticated) {
    redirect("/admin/login");
  }

  return (
    <div className={styles.adminContainer}>
      <AdminSidebar />
      <div className={styles.mainWrapper}>
        <AdminHeader />
        <main className={styles.contentCanvas}>{children}</main>
      </div>
    </div>
  );
}
