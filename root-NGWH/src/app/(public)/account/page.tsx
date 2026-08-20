import { redirect } from "next/navigation";
import Link from "next/link";
import { getUserSession } from "@/server/auth/userAuth";
import { Container } from "@/components/ui/Container/Container";
import styles from "./account.module.scss";

export const metadata = {
  title: "Tài khoản | NextGen Women Hoops",
  description: "Thông tin tài khoản người dùng",
};

export default async function AccountPage() {
  const session = await getUserSession();

  if (!session.authenticated || !session.user) {
    redirect("/login");
  }

  return (
    <main className={styles.main}>
      <Container className={styles.container}>
        <div className={styles.card}>
          <div className={styles.header}>
            <div className={styles.avatar}>
              {session.user.email.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className={styles.title}>Thông tin tài khoản</h1>
              <p className={styles.subtitle}>{session.user.email}</p>
            </div>
          </div>

          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.label}>Mã người dùng (User ID)</span>
              <span className={styles.value}>#{session.user.id}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Email liên hệ</span>
              <span className={styles.value}>{session.user.email}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Loại tài khoản</span>
              <span className={styles.valueBadge}>
                {session.user.role === "admin" ? "Quản trị viên (Admin)" : "Đại diện Câu lạc bộ"}
              </span>
            </div>
          </div>

          <div className={styles.actions}>
            <Link href="/account/clubs" className={styles.primaryBtn}>
              Xem CLB của tôi
            </Link>
            <Link href="/club-registration" className={styles.secondaryBtn}>
              Đăng ký CLB mới
            </Link>
          </div>
        </div>
      </Container>
    </main>
  );
}
