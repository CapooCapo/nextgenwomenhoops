"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { MultiImageUploadField } from "@/components/features/registration/MultiImageUploadField/MultiImageUploadField";
import {
  AchievementItem,
  ClubRosterMember,
  ClubCoachingStaffMember,
  ClubContactInfo,
  ClubSocialLinks,
} from "@/types/club";
import {
  formatAchievements,
  formatContactInfo,
  formatSocialLinks,
} from "@/utils/clubFields";
import styles from "./editClub.module.scss";

interface ClubData {
  id: number;
  name: string;
  province_region: string;
  representative_name?: string | null;
  founding_year?: number | null;
  logo?: string | null;
  capability_profile?: string | null;
  u20_athlete_list?: string | null;
  u20_athlete_images?: string[];
  achievements?: unknown;
  contact_info?: unknown;
  social_links?: unknown;
  players?: ClubRosterMember[];
  coach_staff?: ClubCoachingStaffMember[];
}

export function EditClubForm({ club }: { club: ClubData }) {
  const router = useRouter();
  const t = useTranslations("clubs.edit");

  const [name, setName] = useState(club.name);
  const [provinceRegion, setProvinceRegion] = useState(club.province_region);
  const [representativeName, setRepresentativeName] = useState(
    club.representative_name || ""
  );
  const [foundingYear, setFoundingYear] = useState<string>(
    club.founding_year ? String(club.founding_year) : ""
  );

  // 1. Achievements
  const [achievements, setAchievements] = useState<AchievementItem[]>(
    formatAchievements(club.achievements)
  );

  // 2. Roster (Compact List + Inline Editor State)
  const [players, setPlayers] = useState<ClubRosterMember[]>(
    club.players || []
  );
  const [editingPlayerIndex, setEditingPlayerIndex] = useState<number | null>(null);
  const [isAddingPlayer, setIsAddingPlayer] = useState<boolean>(false);
  const [activePlayerData, setActivePlayerData] = useState<ClubRosterMember>({
    name: "",
    jersey_number: "",
    position: "",
    date_of_birth: "",
  });

  // 3. Coaching Staff
  const [coachStaff, setCoachStaff] = useState<ClubCoachingStaffMember[]>(
    club.coach_staff || []
  );

  // 4. Contact Information
  const initialContact = formatContactInfo(club.contact_info);
  const [contactInfo, setContactInfo] = useState<ClubContactInfo>({
    email: initialContact.email || "",
    phone: initialContact.phone || "",
    website: initialContact.website || "",
    address: initialContact.address || "",
  });

  // 5. Social Links
  const initialSocial = formatSocialLinks(club.social_links);
  const [socialLinks, setSocialLinks] = useState<ClubSocialLinks>({
    facebook: initialSocial.facebook || "",
    instagram: initialSocial.instagram || "",
    tiktok: initialSocial.tiktok || "",
    youtube: initialSocial.youtube || "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const existingImages = club.u20_athlete_images || [];

  // Achievement handlers
  const handleAddAchievement = () => {
    setAchievements([...achievements, { title: "", year: "", description: "" }]);
  };

  const handleUpdateAchievement = (
    index: number,
    field: keyof AchievementItem,
    value: string
  ) => {
    const next = [...achievements];
    next[index] = { ...next[index], [field]: value };
    setAchievements(next);
  };

  const handleRemoveAchievement = (index: number) => {
    setAchievements(achievements.filter((_, i) => i !== index));
  };

  // Compact Roster Handlers
  const handleStartAddPlayer = () => {
    setEditingPlayerIndex(null);
    setActivePlayerData({
      name: "",
      jersey_number: "",
      position: "",
      date_of_birth: "",
    });
    setIsAddingPlayer(true);
  };

  const handleStartEditPlayer = (index: number) => {
    setIsAddingPlayer(false);
    setEditingPlayerIndex(index);
    setActivePlayerData({ ...players[index] });
  };

  const handleSavePlayerEditor = () => {
    if (!activePlayerData.name.trim()) return;

    if (isAddingPlayer) {
      setPlayers([...players, activePlayerData]);
      setIsAddingPlayer(false);
    } else if (editingPlayerIndex !== null) {
      const next = [...players];
      next[editingPlayerIndex] = activePlayerData;
      setPlayers(next);
      setEditingPlayerIndex(null);
    }
  };

  const handleCancelPlayerEditor = () => {
    setIsAddingPlayer(false);
    setEditingPlayerIndex(null);
  };

  const handleRemovePlayer = (index: number) => {
    if (editingPlayerIndex === index) {
      setEditingPlayerIndex(null);
    }
    setPlayers(players.filter((_, i) => i !== index));
  };

  // Coaching Staff handlers
  const handleAddCoach = () => {
    setCoachStaff([...coachStaff, { name: "", role: "", description: "" }]);
  };

  const handleUpdateCoach = (
    index: number,
    field: keyof ClubCoachingStaffMember,
    value: string
  ) => {
    const next = [...coachStaff];
    next[index] = { ...next[index], [field]: value };
    setCoachStaff(next);
  };

  const handleRemoveCoach = (index: number) => {
    setCoachStaff(coachStaff.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    try {
      const formElement = e.currentTarget;
      const formData = new FormData(formElement);

      // Serialize dynamic state collections to FormData
      formData.set("achievements", JSON.stringify(achievements.filter((a) => a.title.trim())));
      formData.set("players", JSON.stringify(players.filter((p) => p.name.trim())));
      formData.set("coach_staff", JSON.stringify(coachStaff.filter((c) => c.name.trim())));
      formData.set("contact_info", JSON.stringify(contactInfo));
      formData.set("social_links", JSON.stringify(socialLinks));

      const res = await fetch(`/api/clubs/${club.id}`, {
        method: "PATCH",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.detail || t("messages.error"));
      } else {
        setSuccessMsg(t("messages.success"));
        router.refresh();
      }
    } catch {
      setErrorMsg(t("messages.genericError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {errorMsg && <div className={styles.errorAlert}>{errorMsg}</div>}
      {successMsg && <div className={styles.successAlert}>{successMsg}</div>}

      {/* SECTION 1: BASIC INFORMATION */}
      <div className={styles.sectionCard}>
        <h3 className={styles.sectionTitle}>{t("sections.basicInfo")}</h3>
        <div className={styles.formGroup}>
          <label htmlFor="name" className={styles.label}>
            {t("fields.name")} <span className={styles.required}>*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("placeholders.name")}
            required
            className={styles.input}
          />
        </div>

        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label htmlFor="province_region" className={styles.label}>
              {t("fields.region")} <span className={styles.required}>*</span>
            </label>
            <input
              id="province_region"
              name="province_region"
              type="text"
              value={provinceRegion}
              onChange={(e) => setProvinceRegion(e.target.value)}
              placeholder={t("placeholders.region")}
              required
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="representative_name" className={styles.label}>
              {t("fields.representative")} <span className={styles.required}>*</span>
            </label>
            <input
              id="representative_name"
              name="representative_name"
              type="text"
              value={representativeName}
              onChange={(e) => setRepresentativeName(e.target.value)}
              placeholder={t("placeholders.representative")}
              required
              className={styles.input}
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="founding_year" className={styles.label}>
            {t("fields.foundingYear")}
          </label>
          <input
            id="founding_year"
            name="founding_year"
            type="number"
            min="1900"
            max="2030"
            value={foundingYear}
            onChange={(e) => setFoundingYear(e.target.value)}
            placeholder={t("placeholders.foundingYear")}
            className={styles.input}
          />
        </div>
      </div>

      {/* SECTION 2: MEDIA & DOCUMENTS */}
      <div className={styles.sectionCard}>
        <h3 className={styles.sectionTitle}>{t("sections.media")}</h3>

        <div className={styles.formGroup}>
          <label htmlFor="logo" className={styles.label}>
            {t("fields.logo")}
          </label>
          {club.logo && (
            <p className={styles.currentFile}>
              {t("fields.currentFile")}{" "}
              <a href={club.logo} target="_blank" rel="noreferrer">
                {t("fields.viewFile")}
              </a>
            </p>
          )}
          <input
            id="logo"
            name="logo"
            type="file"
            accept="image/*"
            className={styles.fileInput}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="capability_profile" className={styles.label}>
            {t("fields.capabilityProfile")}
          </label>
          {club.capability_profile && (
            <p className={styles.currentFile}>
              {t("fields.currentFile")}{" "}
              <a href={club.capability_profile} target="_blank" rel="noreferrer">
                {t("fields.viewFile")}
              </a>
            </p>
          )}
          <input
            id="capability_profile"
            name="capability_profile"
            type="file"
            accept=".pdf,.doc,.docx"
            className={styles.fileInput}
          />
        </div>

        <MultiImageUploadField
          id="u20_athlete_images"
          name="u20_athlete_images"
          label={t("fields.u20AthleteImages")}
          hint={t("fields.u20ImagesHint")}
          maxFiles={12}
          existingImages={existingImages}
        />
      </div>

      {/* SECTION 3: ACHIEVEMENTS */}
      <div className={styles.sectionCard}>
        <div className={styles.sectionHeaderFlex}>
          <h3 className={styles.sectionTitle}>{t("sections.achievements")}</h3>
          <button
            type="button"
            onClick={handleAddAchievement}
            className={styles.addItemBtn}
          >
            {t("actions.addAchievement")}
          </button>
        </div>

        {achievements.length === 0 ? (
          <p className={styles.emptyNotice}>{t("items.emptyAchievements")}</p>
        ) : (
          achievements.map((item, index) => (
            <div key={index} className={styles.repeatableItem}>
              <div className={styles.itemHeader}>
                <span className={styles.itemIndex}>
                  {t("items.achievementHeader", { index: index + 1 })}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveAchievement(index)}
                  className={styles.removeItemBtn}
                >
                  {t("actions.remove")}
                </button>
              </div>
              <div className={styles.itemGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>{t("labels.achievementTitle")}</label>
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) =>
                      handleUpdateAchievement(index, "title", e.target.value)
                    }
                    placeholder={t("placeholders.achievementTitle")}
                    className={styles.input}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>{t("labels.achievementYear")}</label>
                  <input
                    type="text"
                    value={item.year || ""}
                    onChange={(e) =>
                      handleUpdateAchievement(index, "year", e.target.value)
                    }
                    placeholder={t("placeholders.achievementYear")}
                    className={styles.input}
                  />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>{t("labels.achievementDescription")}</label>
                <textarea
                  value={item.description || ""}
                  onChange={(e) =>
                    handleUpdateAchievement(index, "description", e.target.value)
                  }
                  placeholder={t("placeholders.achievementDescription")}
                  rows={2}
                  className={styles.textarea}
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* SECTION 4: ROSTER (COMPACT TABLE/CARDS + BOUNDED HEIGHT SCROLL + INLINE EDITOR) */}
      <div className={styles.sectionCard}>
        <div className={styles.sectionHeaderFlex}>
          <h3 className={styles.sectionTitle}>{t("sections.roster")}</h3>
          <button
            type="button"
            onClick={handleStartAddPlayer}
            className={styles.addItemBtn}
          >
            {t("actions.addPlayer")}
          </button>
        </div>

        {players.length === 0 && !isAddingPlayer ? (
          <p className={styles.emptyNotice}>{t("items.emptyPlayers")}</p>
        ) : (
          <div className={styles.rosterContainer}>
            {players.length > 0 && (
              <div className={styles.rosterEditList}>
                {/* Desktop Table View */}
                <table className={styles.rosterTableDesktop}>
                  <thead>
                    <tr>
                      <th>{t("tableHeaders.number")}</th>
                      <th>{t("tableHeaders.name")}</th>
                      <th>{t("tableHeaders.position")}</th>
                      <th>{t("tableHeaders.dateOfBirth")}</th>
                      <th style={{ textAlign: "right" }}>{t("tableHeaders.actions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {players.map((item, index) => (
                      <tr
                        key={index}
                        className={editingPlayerIndex === index ? styles.activeRow : ""}
                      >
                        <td style={{ fontWeight: "bold", color: "#98002e" }}>
                          {item.jersey_number ? `#${item.jersey_number}` : `#${index + 1}`}
                        </td>
                        <td style={{ fontWeight: 600 }}>{item.name}</td>
                        <td>{item.position || "—"}</td>
                        <td>{item.date_of_birth || "—"}</td>
                        <td style={{ textAlign: "right" }}>
                          <div className={styles.rosterActionsFlex} style={{ justifyContent: "flex-end" }}>
                            <button
                              type="button"
                              onClick={() => handleStartEditPlayer(index)}
                              className={styles.editRowBtn}
                            >
                              {t("actions.editPlayer")}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemovePlayer(index)}
                              className={styles.removeItemBtn}
                            >
                              {t("actions.deletePlayer")}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Mobile Card View */}
                <ul className={styles.rosterMobileList}>
                  {players.map((item, index) => (
                    <li
                      key={index}
                      className={`${styles.rosterMobileCard} ${
                        editingPlayerIndex === index ? styles.activeCard : ""
                      }`}
                    >
                      <div className={styles.rosterMobileHeader}>
                        <span style={{ fontWeight: 600 }}>
                          {item.jersey_number ? `#${item.jersey_number} ` : ""}
                          {item.name}
                        </span>
                        <div className={styles.rosterActionsFlex}>
                          <button
                            type="button"
                            onClick={() => handleStartEditPlayer(index)}
                            className={styles.editRowBtn}
                          >
                            {t("actions.editPlayer")}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemovePlayer(index)}
                            className={styles.removeItemBtn}
                          >
                            {t("actions.deletePlayer")}
                          </button>
                        </div>
                      </div>
                      <div className={styles.rosterMobileMeta}>
                        <span>{t("labels.playerPosition")}: {item.position || "—"}</span>
                        <span>{t("labels.playerDob")}: {item.date_of_birth || "—"}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Inline Player Editor (for Adding or Editing a Player) */}
            {(isAddingPlayer || editingPlayerIndex !== null) && (
              <div className={styles.inlineEditorCard}>
                <div className={styles.inlineEditorHeader}>
                  <span className={styles.inlineEditorTitle}>
                    {isAddingPlayer
                      ? t("items.newPlayerTitle")
                      : t("items.editPlayerTitle", {
                          name: players[editingPlayerIndex!]?.name || `#${editingPlayerIndex! + 1}`,
                        })}
                  </span>
                </div>

                <div className={styles.itemGridQuad}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      {t("labels.playerName")} <span className={styles.required}>*</span>
                    </label>
                    <input
                      type="text"
                      value={activePlayerData.name}
                      onChange={(e) =>
                        setActivePlayerData({ ...activePlayerData, name: e.target.value })
                      }
                      placeholder={t("placeholders.playerName")}
                      className={styles.input}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>{t("labels.jerseyNumber")}</label>
                    <input
                      type="text"
                      value={activePlayerData.jersey_number || ""}
                      onChange={(e) =>
                        setActivePlayerData({
                          ...activePlayerData,
                          jersey_number: e.target.value,
                        })
                      }
                      placeholder={t("placeholders.jerseyNumber")}
                      className={styles.input}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>{t("labels.playerPosition")}</label>
                    <input
                      type="text"
                      value={activePlayerData.position || ""}
                      onChange={(e) =>
                        setActivePlayerData({
                          ...activePlayerData,
                          position: e.target.value,
                        })
                      }
                      placeholder={t("placeholders.playerPosition")}
                      className={styles.input}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>{t("labels.playerDob")}</label>
                    <input
                      type="text"
                      value={activePlayerData.date_of_birth || ""}
                      onChange={(e) =>
                        setActivePlayerData({
                          ...activePlayerData,
                          date_of_birth: e.target.value,
                        })
                      }
                      placeholder={t("placeholders.playerDob")}
                      className={styles.input}
                    />
                  </div>
                </div>

                <div className={styles.inlineEditorActions}>
                  <button
                    type="button"
                    onClick={handleCancelPlayerEditor}
                    className={styles.cancelBtn}
                  >
                    {t("actions.cancelEditing")}
                  </button>
                  <button
                    type="button"
                    onClick={handleSavePlayerEditor}
                    className={styles.doneBtn}
                  >
                    {t("actions.doneEditing")}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* SECTION 5: COACHING STAFF */}
      <div className={styles.sectionCard}>
        <div className={styles.sectionHeaderFlex}>
          <h3 className={styles.sectionTitle}>{t("sections.coachingStaff")}</h3>
          <button
            type="button"
            onClick={handleAddCoach}
            className={styles.addItemBtn}
          >
            {t("actions.addCoach")}
          </button>
        </div>

        {coachStaff.length === 0 ? (
          <p className={styles.emptyNotice}>{t("items.emptyCoachingStaff")}</p>
        ) : (
          coachStaff.map((item, index) => (
            <div key={index} className={styles.repeatableItem}>
              <div className={styles.itemHeader}>
                <span className={styles.itemIndex}>
                  {t("items.coachHeader", { index: index + 1 })}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveCoach(index)}
                  className={styles.removeItemBtn}
                >
                  {t("actions.remove")}
                </button>
              </div>
              <div className={styles.itemGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>{t("labels.coachName")}</label>
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) =>
                      handleUpdateCoach(index, "name", e.target.value)
                    }
                    placeholder={t("placeholders.coachName")}
                    className={styles.input}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>{t("labels.coachRole")}</label>
                  <input
                    type="text"
                    value={item.role || ""}
                    onChange={(e) =>
                      handleUpdateCoach(index, "role", e.target.value)
                    }
                    placeholder={t("placeholders.coachRole")}
                    className={styles.input}
                  />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>{t("labels.coachDescription")}</label>
                <textarea
                  value={item.description || ""}
                  onChange={(e) =>
                    handleUpdateCoach(index, "description", e.target.value)
                  }
                  placeholder={t("placeholders.coachDescription")}
                  rows={2}
                  className={styles.textarea}
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* SECTION 6: CONTACT INFORMATION */}
      <div className={styles.sectionCard}>
        <h3 className={styles.sectionTitle}>{t("sections.contactInfo")}</h3>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label className={styles.label}>{t("fields.email")}</label>
            <input
              type="email"
              value={contactInfo.email || ""}
              onChange={(e) =>
                setContactInfo({ ...contactInfo, email: e.target.value })
              }
              placeholder={t("placeholders.email")}
              className={styles.input}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>{t("fields.phone")}</label>
            <input
              type="text"
              value={contactInfo.phone || ""}
              onChange={(e) =>
                setContactInfo({ ...contactInfo, phone: e.target.value })
              }
              placeholder={t("placeholders.phone")}
              className={styles.input}
            />
          </div>
        </div>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label className={styles.label}>{t("fields.website")}</label>
            <input
              type="text"
              value={contactInfo.website || ""}
              onChange={(e) =>
                setContactInfo({ ...contactInfo, website: e.target.value })
              }
              placeholder={t("placeholders.website")}
              className={styles.input}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>{t("fields.address")}</label>
            <input
              type="text"
              value={contactInfo.address || ""}
              onChange={(e) =>
                setContactInfo({ ...contactInfo, address: e.target.value })
              }
              placeholder={t("placeholders.address")}
              className={styles.input}
            />
          </div>
        </div>
      </div>

      {/* SECTION 7: SOCIAL LINKS */}
      <div className={styles.sectionCard}>
        <h3 className={styles.sectionTitle}>{t("sections.socialLinks")}</h3>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label className={styles.label}>{t("fields.facebook")}</label>
            <input
              type="text"
              value={socialLinks.facebook || ""}
              onChange={(e) =>
                setSocialLinks({ ...socialLinks, facebook: e.target.value })
              }
              placeholder={t("placeholders.facebook")}
              className={styles.input}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>{t("fields.instagram")}</label>
            <input
              type="text"
              value={socialLinks.instagram || ""}
              onChange={(e) =>
                setSocialLinks({ ...socialLinks, instagram: e.target.value })
              }
              placeholder={t("placeholders.instagram")}
              className={styles.input}
            />
          </div>
        </div>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label className={styles.label}>{t("fields.tiktok")}</label>
            <input
              type="text"
              value={socialLinks.tiktok || ""}
              onChange={(e) =>
                setSocialLinks({ ...socialLinks, tiktok: e.target.value })
              }
              placeholder={t("placeholders.tiktok")}
              className={styles.input}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>{t("fields.youtube")}</label>
            <input
              type="text"
              value={socialLinks.youtube || ""}
              onChange={(e) =>
                setSocialLinks({ ...socialLinks, youtube: e.target.value })
              }
              placeholder={t("placeholders.youtube")}
              className={styles.input}
            />
          </div>
        </div>
      </div>

      <div className={styles.formActions}>
        <button
          type="button"
          onClick={() => router.back()}
          className={styles.cancelBtn}
        >
          {t("actions.cancel")}
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className={styles.submitBtn}
        >
          {isSubmitting ? t("actions.saving") : t("actions.save")}
        </button>
      </div>
    </form>
  );
}
