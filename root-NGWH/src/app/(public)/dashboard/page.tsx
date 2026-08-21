import React from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getUserSession } from "@/server/auth/userAuth";
import { findClubByUserId, findUserById } from "@/server/repositories/userRepository";
import { findPlayersByClubId, findCoachStaffByClubId } from "@/server/repositories/clubsRepository";
import { normalizeMediaField } from "@/server/services/clubMediaService";
import styles from "./clubDashboard.module.scss";

export default async function ClubDashboardPage() {
  const session = await getUserSession();
  if (!session.authenticated || !session.user) {
    redirect("/login?redirectTo=/dashboard");
  }

  const user = await findUserById(session.user.id);
  if (!user) {
    redirect("/login");
  }

  const club = await findClubByUserId(user.id);
  const players = club ? await findPlayersByClubId(club.id) : [];
  const coachingStaff = club ? await findCoachStaffByClubId(club.id) : [];

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.dashboardHeader}>
        <div>
          <h1>Club Dashboard</h1>
          <p style={{ color: "#64748b", margin: "0.25rem 0 0" }}>
            Manage your club organization & personnel
          </p>
        </div>
        <div className={styles.userInfo}>
          <span className={styles.userEmail}>{user.email}</span>
          <form action="/api/auth/logout" method="POST">
            <button type="submit" className={styles.btnOutline}>
              Sign Out
            </button>
          </form>
        </div>
      </div>

      {!club ? (
        <div className={styles.card} style={{ textAlign: "center", padding: "3rem 2rem" }}>
          <h2 style={{ margin: "0 0 0.5rem" }}>No Registered Club Found</h2>
          <p style={{ color: "#64748b", marginBottom: "1.5rem" }}>
            You haven’t submitted a club registration yet. Submit your club details and documents to participate in NextGen Women Hoops tournaments.
          </p>
          <Link href="/club-registration" className={styles.btnPrimary}>
            Submit Club Registration
          </Link>
        </div>
      ) : (
        <>
          <div className={styles.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ margin: 0 }}>{club.name}</h2>
              {club.is_approved ? (
                <span className={styles.badgeApproved}>Status: Approved</span>
              ) : (
                <span className={styles.badgePending}>Status: Pending Admin Approval</span>
              )}
            </div>

            <div className={styles.grid}>
              <div className={styles.metaItem}>
                <span className={styles.label}>Province / Region</span>
                <span className={styles.value}>{club.province_region}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.label}>Representative Name</span>
                <span className={styles.value}>{club.representative_name || "-"}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.label}>Founding Year</span>
                <span className={styles.value}>{club.founding_year || "N/A"}</span>
              </div>
            </div>

            <div style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid #f1f5f9" }}>
              <h4 style={{ margin: "0 0 0.5rem", fontSize: "0.95rem" }}>Uploaded Documents</h4>
              <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
                {club.capability_profile ? (
                  <a
                    href={normalizeMediaField(club.capability_profile) ?? undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.docLink}
                  >
                    📄 Capability Profile
                  </a>
                ) : (
                  <span style={{ color: "#94a3b8" }}>No profile document uploaded</span>
                )}
                {club.u20_athlete_list ? (
                  <a
                    href={normalizeMediaField(club.u20_athlete_list) ?? undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.docLink}
                  >
                    📄 U20 Athlete Roster List
                  </a>
                ) : (
                  <span style={{ color: "#94a3b8" }}>No athlete list uploaded</span>
                )}
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <div>
                <h3 style={{ margin: 0 }}>Roster & Coaching Staff (REQ-REG-005)</h3>
                <p style={{ color: "#64748b", margin: "0.25rem 0 0", fontSize: "0.9rem" }}>
                  Pre-season personnel status
                </p>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
              <div>
                <h4 style={{ borderBottom: "1px solid #e2e8f0", paddingBottom: "0.5rem" }}>
                  Registered Players ({players.length})
                </h4>
                {players.length === 0 ? (
                  <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
                    No roster players currently listed.
                  </p>
                ) : (
                  <ul style={{ paddingLeft: "1.25rem", margin: 0 }}>
                    {players.map((p) => (
                      <li key={p.id} style={{ marginBottom: "0.25rem" }}>
                        {p.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <h4 style={{ borderBottom: "1px solid #e2e8f0", paddingBottom: "0.5rem" }}>
                  Coaching Staff ({coachingStaff.length})
                </h4>
                {coachingStaff.length === 0 ? (
                  <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
                    No coaching staff listed.
                  </p>
                ) : (
                  <ul style={{ paddingLeft: "1.25rem", margin: 0 }}>
                    {coachingStaff.map((c) => (
                      <li key={c.id} style={{ marginBottom: "0.25rem" }}>
                        {c.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
