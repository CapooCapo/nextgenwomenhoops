import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import {
  createClub,
  findApprovedClubById,
  findApprovedClubs,
  findCoachStaffByClubId,
  findPlayersByClubId,
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
  if (filePath.startsWith("http://") || filePath.startsWith("https://") || filePath.startsWith("/media/")) {
    return filePath;
  }
  return `/media/${filePath}`;
}

export async function getApprovedClubsList(provinceRegion?: string) {
  const clubs = await findApprovedClubs(provinceRegion);
  return clubs.map((club) => ({
    id: club.id,
    name: club.name,
    logo: club.logo,
    founding_year: club.founding_year,
    achievements: club.achievements,
    province_region: club.province_region,
  }));
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
    logo: club.logo,
    founding_year: club.founding_year,
    achievements: club.achievements,
    province_region: club.province_region,
    contact_info: club.contact_info,
    social_links: club.social_links,
    players: players.map((p) => ({ id: p.id, name: p.name })),
    coach_staff: coachStaff.map((c) => ({ id: c.id, name: c.name })),
  };
}

export async function registerNewClub(formData: FormData) {
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

  const capabilityFile = formData.get("capability_profile");
  const athleteListFile = formData.get("u20_athlete_list");

  let capPath: string | null = null;
  let athPath: string | null = null;

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
    capability_profile: capPath,
    u20_athlete_list: athPath,
  });

  return {
    ok: true,
    status: 201,
    club: {
      id: createdClub.id,
      name: createdClub.name,
      province_region: createdClub.province_region,
      representative_name: createdClub.representative_name,
      capability_profile: formatFileUrl(createdClub.capability_profile),
      u20_athlete_list: formatFileUrl(createdClub.u20_athlete_list),
    },
  };
}
