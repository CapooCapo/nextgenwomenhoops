import { redirect } from "next/navigation";
import Link from "next/link";
import { getUserSession } from "@/server/auth/userAuth";
import { getUserClubsList } from "@/server/services/clubsServerService";
import { Container } from "@/components/ui/Container/Container";
import styles from "./myClubs.module.scss";

export const metadata = {
  title: "CLB của tôi | NextGen Women Hoops",
  description: "Quản lý câu lạc bộ do bạn sở hữu",
};

export default async function MyClubsPage() {
  const session = await getUserSession();

  if (!session.authenticated || !session.user) {
    redirect("/login");
  }

  const clubs = await getUserClubsList(session.user.id);

  return (
    <main className={styles.main}>
      <Container className={styles.container}>
        <div className={styles.headerRow}>
          <div>
            <h1 className={styles.title}>CLB của tôi</h1>
            <p className={styles.subtitle}>
              Quản lý các câu lạc bộ bóng rổ nữ do tài khoản của bạn đăng ký.
            </p>
          </div>
          <Link href="/club-registration" className={styles.registerBtn}>
            + Đăng ký CLB mới
          </Link>
        </div>

        {clubs.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🏀</div>
            <h2 className={styles.emptyTitle}>Bạn chưa đăng ký CLB nào.</h2>
            <p className={styles.emptyText}>
              Đăng ký câu lạc bộ của bạn ngay hôm nay để tham gia giải đấu NextGen Women Hoops!
            </p>
            <Link href="/club-registration" className={styles.ctaBtn}>
              Đăng ký CLB ngay
            </Link>
          </div>
        ) : (
          <div className={styles.clubsGrid}>
            {clubs.map((club) => (
              <div key={club.id} className={styles.clubCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.logoWrapper}>
                    {club.logo ? (
                      <img
                        src={club.logo}
                        alt={club.name}
                        className={styles.clubLogo}
                      />
                    ) : (
                      <div className={styles.logoPlaceholder}>🏀</div>
                    )}
                  </div>
                  <div className={styles.cardHeaderInfo}>
                    <h3 className={styles.clubName}>{club.name}</h3>
                    <span className={styles.region}>{club.province_region}</span>
                  </div>
                  <span
                    className={`${styles.statusBadge} ${
                      club.is_approved ? styles.approved : styles.pending
                    }`}
                  >
                    {club.is_approved ? "Đã phê duyệt" : "Chờ duyệt"}
                  </span>
                </div>

                <div className={styles.cardBody}>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Người đại diện:</span>
                    <span className={styles.infoValue}>
                      {club.representative_name}
                    </span>
                  </div>
                  {club.founding_year && (
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Năm thành lập:</span>
                      <span className={styles.infoValue}>
                        {club.founding_year}
                      </span>
                    </div>
                  )}

                  <div className={styles.docsSection}>
                    <span className={styles.docsTitle}>Hồ sơ đính kèm:</span>
                    <div className={styles.docsLinks}>
                      {club.capability_profile ? (
                        <a
                          href={club.capability_profile}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.docLink}
                        >
                          📄 Hồ sơ năng lực
                        </a>
                      ) : (
                        <span className={styles.noDoc}>Chưa gửi hồ sơ NL</span>
                      )}
                      {club.u20_athlete_list ? (
                        <a
                          href={club.u20_athlete_list}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.docLink}
                        >
                          📋 Danh sách VĐV U20
                        </a>
                      ) : (
                        <span className={styles.noDoc}>Chưa gửi DS VĐV</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className={styles.cardFooter}>
                  <Link
                    href={`/clubs/${club.id}`}
                    className={styles.viewBtn}
                  >
                    Xem hồ sơ
                  </Link>
                  <Link
                    href={`/account/clubs/${club.id}/edit`}
                    className={styles.editBtn}
                  >
                    Chỉnh sửa CLB
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </Container>
    </main>
  );
}
