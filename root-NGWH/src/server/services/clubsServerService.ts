import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import {
  createClub,
  findApprovedClubsPaginated,
  findCoachStaffByClubId,
  findPlayersByClubId,
  findClubById,
  findClubsByUserId,
  updateClub,
  replaceClubPlayers,
  replaceClubCoachStaff,
} from "../repositories/clubsRepository";
import {
  validateClubRegistration,
  validateU20AthleteFiles,
} from "../validation/clubValidation";

const MEDIA_DIR = process.env.MEDIA_ROOT || path.join(process.cwd(), "media");

async function saveUploadedFile(file: File): Promise<string | null> {
  if (!file || !(file instanceof File) || file.size === 0 || !file.name) {
    return null;
  }
  const fileUuid = crypto.randomUUID();
  const relDir = path.join("clubs", "registrations", fileUuid);
  const targetDir = path.join(MEDIA_DIR, relDir);

  await fs.mkdir(targetDir, { recursive: true });
  const targetPath = path.join(targetDir, file.name);

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  await fs.writeFile(targetPath, buffer);

  // Return path formatted with forward slashes
  return `clubs/registrations/${fileUuid}/${file.name}`;
}

export function formatFileUrl(filePath: string | null): string | null {
  if (!filePath) return null;
  if (
    filePath.startsWith("http://") ||
    filePath.startsWith("https://") ||
    filePath.startsWith("/media/") ||
    filePath.startsWith("/")
  ) {
    return filePath;
  }
  return `/media/${filePath}`;
}

export function parseU20AthleteImages(rawList: string | null): string[] {
  if (!rawList) return [];
  if (rawList.startsWith("[") && rawList.endsWith("]")) {
    try {
      const parsed = JSON.parse(rawList);
      if (Array.isArray(parsed)) {
        return parsed
          .map((item) => formatFileUrl(String(item)))
          .filter((url): url is string => !!url);
      }
    } catch {
      // Fallback
    }
  }
  const formatted = formatFileUrl(rawList);
  return formatted ? [formatted] : [];
}

export interface GetApprovedClubsOptions {
  provinceRegion?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export async function getApprovedClubsList(
  options: GetApprovedClubsOptions | string = {}
) {
  const opts: GetApprovedClubsOptions =
    typeof options === "string" ? { provinceRegion: options } : options;
  const { clubs, total, page, limit, totalPages } =
    await findApprovedClubsPaginated(opts);

  return {
    data: clubs.map((club) => ({
      id: club.id,
      name: club.name,
      logo: formatFileUrl(club.logo),
      founding_year: club.founding_year,
      achievements: club.achievements,
      province_region: club.province_region,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
}

export async function getApprovedClubDetail(id: number) {
  return getClubDetailForView(id);
}

export async function getClubDetailForView(id: number, currentUserId?: number, isAdmin?: boolean) {
  const club = await findClubById(id);
  if (!club) return null;

  if (!club.is_approved) {
    const isOwner = Boolean(currentUserId && club.user_id === currentUserId);
    if (!isOwner && !isAdmin) {
      return null;
    }
  }

  const [players, coachStaff] = await Promise.all([
    findPlayersByClubId(club.id),
    findCoachStaffByClubId(club.id),
  ]);

  return {
    id: club.id,
    name: club.name,
    logo: formatFileUrl(club.logo),
    founding_year: club.founding_year,
    achievements: club.achievements,
    province_region: club.province_region,
    contact_info: club.contact_info,
    social_links: club.social_links,
    capability_profile: formatFileUrl(club.capability_profile),
    u20_athlete_list: formatFileUrl(club.u20_athlete_list),
    u20_athlete_images: parseU20AthleteImages(club.u20_athlete_list),
    players: players.map((p) => ({
      id: p.id,
      name: p.name,
      jersey_number: p.jersey_number,
      position: p.position,
      date_of_birth: p.date_of_birth,
    })),
    coach_staff: coachStaff.map((c) => ({
      id: c.id,
      name: c.name,
      role: c.role,
      description: c.description,
    })),
    user_id: club.user_id || null,
    is_approved: club.is_approved,
  };
}

export async function registerNewClub(formData: FormData, userId?: number) {
  const name = formData.get("name") as string | null;
  const provinceRegion = formData.get("province_region") as string | null;
  const representativeName = formData.get("representative_name") as string | null;

  const validation = validateClubRegistration({
    name,
    province_region: provinceRegion,
    representative_name: representativeName,
  });

  if (!validation.isValid) {
    return { ok: false, status: 400, errors: validation.errors };
  }

  const logoFile = formData.get("logo");
  const capabilityFile = formData.get("capability_profile");

  const rawAthleteEntries = [
    ...formData.getAll("u20_athlete_images"),
    ...formData.getAll("u20_athlete_list"),
  ];
  const athleteFiles = rawAthleteEntries.filter(
    (item): item is File => item instanceof File && item.size > 0 && !!item.name
  );

  if (athleteFiles.length > 12) {
    return {
      ok: false,
      status: 400,
      errors: { u20_athlete_list: ["Tối đa 12 hình ảnh VĐV U20."] },
    };
  }

  const fileValidation = validateU20AthleteFiles(athleteFiles);
  if (!fileValidation.isValid) {
    return {
      ok: false,
      status: 400,
      errors: { u20_athlete_list: [fileValidation.error!] },
    };
  }

  let logoPath: string | null = null;
  let capPath: string | null = null;
  let athPath: string | null = null;

  if (logoFile && logoFile instanceof File && logoFile.size > 0) {
    logoPath = await saveUploadedFile(logoFile);
  }
  if (capabilityFile && capabilityFile instanceof File && capabilityFile.size > 0) {
    capPath = await saveUploadedFile(capabilityFile);
  }

  if (athleteFiles.length > 0) {
    const savedPaths: string[] = [];
    for (const file of athleteFiles.slice(0, 12)) {
      const saved = await saveUploadedFile(file);
      if (saved) savedPaths.push(saved);
    }
    if (savedPaths.length > 0) {
      athPath = JSON.stringify(savedPaths);
    }
  }

  const createdClub = await createClub({
    name: name!.trim(),
    province_region: provinceRegion!.trim(),
    representative_name: representativeName!.trim(),
    logo: logoPath,
    capability_profile: capPath,
    u20_athlete_list: athPath,
    is_approved: false,
    user_id: userId || null,
  });

  return {
    ok: true,
    status: 201,
    club: {
      id: createdClub.id,
      name: createdClub.name,
      province_region: createdClub.province_region,
      representative_name: createdClub.representative_name,
      logo: formatFileUrl(createdClub.logo),
      capability_profile: formatFileUrl(createdClub.capability_profile),
      u20_athlete_list: formatFileUrl(createdClub.u20_athlete_list),
      u20_athlete_images: parseU20AthleteImages(createdClub.u20_athlete_list),
    },
  };
}

export async function getUserClubsList(userId: number) {
  const clubs = await findClubsByUserId(userId);
  return clubs.map((club) => ({
    id: club.id,
    name: club.name,
    logo: formatFileUrl(club.logo),
    founding_year: club.founding_year,
    achievements: club.achievements,
    province_region: club.province_region,
    is_approved: club.is_approved,
    representative_name: club.representative_name,
    capability_profile: formatFileUrl(club.capability_profile),
    u20_athlete_list: formatFileUrl(club.u20_athlete_list),
    u20_athlete_images: parseU20AthleteImages(club.u20_athlete_list),
    user_id: club.user_id,
  }));
}

export async function updateOwnerClub(
  clubId: number,
  userId: number,
  formData: FormData
) {
  const club = await findClubById(clubId);
  if (!club) {
    return { ok: false, status: 404, message: "Club not found" };
  }

  if (club.user_id !== userId) {
    return { ok: false, status: 403, message: "Forbidden: You do not own this club" };
  }

  const name = formData.get("name") as string | null;
  const provinceRegion = formData.get("province_region") as string | null;
  const representativeName = formData.get("representative_name") as string | null;
  const foundingYearStr = formData.get("founding_year") as string | null;

  const logoFile = formData.get("logo");
  const capabilityFile = formData.get("capability_profile");

  const rawAthleteEntries = [
    ...formData.getAll("u20_athlete_images"),
    ...formData.getAll("u20_athlete_list"),
  ];
  const athleteFiles = rawAthleteEntries.filter(
    (item): item is File => item instanceof File && item.size > 0 && !!item.name
  );

  if (athleteFiles.length > 12) {
    return { ok: false, status: 400, message: "Tối đa 12 hình ảnh VĐV U20." };
  }

  const fileValidation = validateU20AthleteFiles(athleteFiles);
  if (!fileValidation.isValid) {
    return { ok: false, status: 400, message: fileValidation.error };
  }

  let logoPath: string | undefined = undefined;
  let capPath: string | undefined = undefined;
  let athPath: string | undefined = undefined;

  if (logoFile && logoFile instanceof File && logoFile.size > 0) {
    const saved = await saveUploadedFile(logoFile);
    if (saved) logoPath = saved;
  }
  if (capabilityFile && capabilityFile instanceof File && capabilityFile.size > 0) {
    const saved = await saveUploadedFile(capabilityFile);
    if (saved) capPath = saved;
  }

  if (athleteFiles.length > 0) {
    const savedPaths: string[] = [];
    for (const file of athleteFiles.slice(0, 12)) {
      const saved = await saveUploadedFile(file);
      if (saved) savedPaths.push(saved);
    }
    if (savedPaths.length > 0) {
      athPath = JSON.stringify(savedPaths);
    }
  }

  const updateParams: Record<string, unknown> = {};
  if (name !== null && name.trim()) updateParams.name = name.trim();
  if (provinceRegion !== null && provinceRegion.trim()) updateParams.province_region = provinceRegion.trim();
  if (representativeName !== null && representativeName.trim()) updateParams.representative_name = representativeName.trim();
  if (foundingYearStr !== null) {
    const trimmedYear = foundingYearStr.trim();
    if (trimmedYear) {
      const parsedYear = parseInt(trimmedYear, 10);
      if (!isNaN(parsedYear)) updateParams.founding_year = parsedYear;
    } else {
      updateParams.founding_year = null;
    }
  }
  if (logoPath !== undefined) updateParams.logo = logoPath;
  if (capPath !== undefined) updateParams.capability_profile = capPath;
  if (athPath !== undefined) updateParams.u20_athlete_list = athPath;

  // Process Achievements
  const achievementsRaw = formData.get("achievements");
  if (achievementsRaw !== null) {
    updateParams.achievements = String(achievementsRaw);
  }

  // Process Contact Info
  const contactInfoRaw = formData.get("contact_info");
  const contactEmail = formData.get("contact_email") as string | null;
  const contactPhone = formData.get("contact_phone") as string | null;
  const contactWebsite = formData.get("contact_website") as string | null;
  const contactAddress = formData.get("contact_address") as string | null;

  if (contactInfoRaw !== null) {
    updateParams.contact_info = String(contactInfoRaw);
  } else if (contactEmail !== null || contactPhone !== null || contactWebsite !== null || contactAddress !== null) {
    const contactObj = {
      email: contactEmail || undefined,
      phone: contactPhone || undefined,
      website: contactWebsite || undefined,
      address: contactAddress || undefined,
    };
    updateParams.contact_info = JSON.stringify(contactObj);
  }

  // Process Social Links
  const socialLinksRaw = formData.get("social_links");
  const socialFacebook = formData.get("social_facebook") as string | null;
  const socialInstagram = formData.get("social_instagram") as string | null;
  const socialTiktok = formData.get("social_tiktok") as string | null;
  const socialYoutube = formData.get("social_youtube") as string | null;

  if (socialLinksRaw !== null) {
    updateParams.social_links = String(socialLinksRaw);
  } else if (socialFacebook !== null || socialInstagram !== null || socialTiktok !== null || socialYoutube !== null) {
    const socialObj = {
      facebook: socialFacebook || undefined,
      instagram: socialInstagram || undefined,
      tiktok: socialTiktok || undefined,
      youtube: socialYoutube || undefined,
    };
    updateParams.social_links = JSON.stringify(socialObj);
  }

  const updated = await updateClub(clubId, updateParams);
  if (!updated) {
    return { ok: false, status: 500, message: "Failed to update club" };
  }

  // Process Roster / Players
  const playersRaw = formData.get("players");
  if (playersRaw !== null) {
    try {
      const parsedPlayers = JSON.parse(String(playersRaw));
      if (Array.isArray(parsedPlayers)) {
        await replaceClubPlayers(clubId, parsedPlayers);
      }
    } catch (err) {
      console.error("Failed to parse players JSON:", err);
    }
  }

  // Process Coaching Staff
  const coachStaffRaw = formData.get("coach_staff");
  if (coachStaffRaw !== null) {
    try {
      const parsedStaff = JSON.parse(String(coachStaffRaw));
      if (Array.isArray(parsedStaff)) {
        await replaceClubCoachStaff(clubId, parsedStaff);
      }
    } catch (err) {
      console.error("Failed to parse coach_staff JSON:", err);
    }
  }

  const [players, coachStaff] = await Promise.all([
    findPlayersByClubId(clubId),
    findCoachStaffByClubId(clubId),
  ]);

  return {
    ok: true,
    status: 200,
    club: {
      id: updated.id,
      name: updated.name,
      province_region: updated.province_region,
      representative_name: updated.representative_name,
      founding_year: updated.founding_year,
      logo: formatFileUrl(updated.logo),
      capability_profile: formatFileUrl(updated.capability_profile),
      u20_athlete_list: formatFileUrl(updated.u20_athlete_list),
      u20_athlete_images: parseU20AthleteImages(updated.u20_athlete_list),
      achievements: updated.achievements,
      contact_info: updated.contact_info,
      social_links: updated.social_links,
      is_approved: updated.is_approved,
      user_id: updated.user_id,
      players: players.map((p) => ({
        id: p.id,
        name: p.name,
        jersey_number: p.jersey_number,
        position: p.position,
        date_of_birth: p.date_of_birth,
      })),
      coach_staff: coachStaff.map((c) => ({
        id: c.id,
        name: c.name,
        role: c.role,
        description: c.description,
      })),
    },
  };
}
