import React from "react";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { requireAdminRole } from "@/server/auth/adminAuth";
import { getAdminUsersList } from "@/server/services/adminUsersServerService";
import { AdminUserManagementClient } from "./AdminUserManagementClient";
import styles from "../adminTables.module.scss";

export default async function AdminUsersPage() {
  const auth = await requireAdminRole("admin");
  if (!auth.authenticated) {
    redirect("/admin/login");
  }
  if (!auth.allowed) {
    redirect("/admin");
  }

  const t = await getTranslations("admin.users");
  const users = await getAdminUsersList();

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1>{t("title")}</h1>
          <p style={{ color: "#64748b", margin: "0.25rem 0 0 0", fontSize: "0.9rem" }}>
            {t("subtitle")}
          </p>
        </div>
      </div>

      <AdminUserManagementClient initialUsers={users} />
    </div>
  );
}
