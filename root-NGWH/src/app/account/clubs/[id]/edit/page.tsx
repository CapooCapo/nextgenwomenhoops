import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getUserSession } from "@/server/auth/userAuth";
import { findClubById } from "@/server/repositories/clubsRepository";
import { Container } from "@/components/ui/Container/Container";
import { EditClubForm } from "./EditClubForm";
import styles from "./editClub.module.scss";

export const metadata = {
  title: "Chỉnh sửa CLB | NextGen Women Hoops",
  description: "Cập nhật thông tin câu lạc bộ của bạn",
};

export default async function EditClubPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getUserSession();
  if (!session.authenticated || !session.user) {
    redirect("/login");
  }

  const { id } = await params;
  const numId = parseInt(id, 10);
  if (isNaN(numId)) {
    notFound();
  }

  const club = await findClubById(numId);
  if (!club) {
    notFound();
  }

  // Authorization Enforcement: Server-side check
  if (club.user_id !== session.user.id) {
    return (
      <main className={styles.main}>
        <Container className={styles.container}>
          <div className={styles.accessDeniedCard}>
            <h2>Không có quyền truy cập</h2>
            <p>Bạn không phải là người sở hữu câu lạc bộ này và không có quyền chỉnh sửa.</p>
            <Link href="/account/clubs" className={styles.backBtn}>
              Quay lại danh sách CLB của tôi
            </Link>
          </div>
        </Container>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <Container className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Chỉnh sửa thông tin CLB</h1>
          <p className={styles.subtitle}>
            Cập nhật thông tin cho câu lạc bộ <strong>{club.name}</strong>
          </p>
        </div>

        <div className={styles.formCard}>
          <EditClubForm
            club={{
              id: club.id,
              name: club.name,
              province_region: club.province_region,
              representative_name: club.representative_name,
              founding_year: club.founding_year,
              logo: club.logo,
              capability_profile: club.capability_profile,
              u20_athlete_list: club.u20_athlete_list,
            }}
          />
        </div>
      </Container>
    </main>
  );
}
