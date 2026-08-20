import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import {
  createClub,
  findApprovedClubById,
  findApprovedClubsPaginated,
  findCoachStaffByClubId,
  findPlayersByClubId,
  findClubById,
  findClubsByUserId,
  updateClub,
} from "../repositories/clubsRepository";
import { validateClubRegistration } from "../validation/clubValidation";

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

function formatFileUrl(filePath: string | null): string | null {
  if (!filePath) return null;
  if (filePath.startsWith("http://") || filePath.startsWith("https://") || filePath.startsWith("/media/") || filePath.startsWith("/")) {
    return filePath;
  }
  return `/media/${filePath}`;
}

export interface GetApprovedClubsOptions {
  provinceRegion?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export async function getApprovedClubsList(options: GetApprovedClubsOptions | string = {}) {
  const opts: GetApprovedClubsOptions = typeof options === "string" ? { provinceRegion: options } : options;
  const { clubs, total, page, limit, totalPages } = await findApprovedClubsPaginated(opts);

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
  const club = await findApprovedClubById(id);
  if (!club) return null;

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
    players: players.map((p) => ({ id: p.id, name: p.name })),
    coach_staff: coachStaff.map((c) => ({ id: c.id, name: c.name })),
    user_id: club.user_id || null,
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
  const athleteListFile = formData.get("u20_athlete_list");

  let logoPath: string | null = null;
  let capPath: string | null = null;
  let athPath: string | null = null;

  if (logoFile && logoFile instanceof File && logoFile.size > 0) {
    logoPath = await saveUploadedFile(logoFile);
  }
  if (capabilityFile && capabilityFile instanceof File && capabilityFile.size > 0) {
    capPath = await saveUploadedFile(capabilityFile);
  }
  if (athleteListFile && athleteListFile instanceof File && athleteListFile.size > 0) {
    athPath = await saveUploadedFile(athleteListFile);
  }

  const createdClub = await createClub({
    name: name!.trim(),
    province_region: provinceRegion!.trim(),
    representative_name: representativeName!.trim(),
    logo: logoPath,
    capability_profile: capPath,
    u20_athlete_list: athPath,
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
    user_id: club.user_id,
  }));
}

export async function updateOwnerClub(clubId: number, userId: number, formData: FormData) {
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
  const athleteListFile = formData.get("u20_athlete_list");

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
  if (athleteListFile && athleteListFile instanceof File && athleteListFile.size > 0) {
    const saved = await saveUploadedFile(athleteListFile);
    if (saved) athPath = saved;
  }

  const updateParams: Record<string, unknown> = {};
  if (name !== null && name.trim()) updateParams.name = name.trim();
  if (provinceRegion !== null && provinceRegion.trim()) updateParams.province_region = provinceRegion.trim();
  if (representativeName !== null && representativeName.trim()) updateParams.representative_name = representativeName.trim();
  if (foundingYearStr !== null && foundingYearStr.trim()) {
    const parsedYear = parseInt(foundingYearStr.trim(), 10);
    if (!isNaN(parsedYear)) updateParams.founding_year = parsedYear;
  }
  if (logoPath !== undefined) updateParams.logo = logoPath;
  if (capPath !== undefined) updateParams.capability_profile = capPath;
  if (athPath !== undefined) updateParams.u20_athlete_list = athPath;

  const updated = await updateClub(clubId, updateParams);
  if (!updated) {
    return { ok: false, status: 500, message: "Failed to update club" };
  }

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
      is_approved: updated.is_approved,
      user_id: updated.user_id,
    },
  };
}
