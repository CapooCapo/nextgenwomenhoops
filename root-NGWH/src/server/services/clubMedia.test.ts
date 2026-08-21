/**
 * @jest-environment node
 */
import { validateClubMediaFile, validateFileBufferSignature, MAX_CLUB_MEDIA_SIZE_BYTES } from "../validation/clubMediaValidation";
import { insertClubMedia, getClubMediaById } from "../repositories/clubMediaRepository";
import { registerNewClub, updateOwnerClub } from "./clubsServerService";

type DbParam = string | number | boolean | Buffer | null | undefined;

jest.mock("../db/client", () => {
  const store = new Map<number, Record<string, unknown>>();
  let idCounter = 1;

  return {
    query: jest.fn(async (sql: string, params: DbParam[]) => {
      const lower = sql.toLowerCase().trim();

      // INSERT INTO clubs_club
      if (lower.startsWith("insert into clubs_club")) {
        const id = idCounter++;
        const record = {
          id,
          name: params[0],
          province_region: params[1],
          representative_name: params[2],
          logo: params[3],
          capability_profile: params[4],
          u20_athlete_list: params[5],
          is_approved: params[6],
          user_id: params[7],
        };
        store.set(id, record);
        return [record];
      }

      // UPDATE clubs_club
      if (lower.startsWith("update clubs_club")) {
        const id = Number(params[params.length - 1]);
        const record = store.get(id) || { id };
        const setIdx = sql.toLowerCase().indexOf("set");
        const whereIdx = sql.toLowerCase().indexOf("where");
        const setClause = setIdx !== -1 && whereIdx !== -1 ? sql.slice(setIdx + 3, whereIdx) : "";
        const assignments = setClause.split(",").map((s) => s.trim());
        assignments.forEach((assign) => {
          const parts = assign.split("=");
          if (parts.length === 2) {
            const col = parts[0].trim();
            const match = parts[1].trim().match(/\$(\d+)/);
            if (col && match) {
              const pIdx = parseInt(match[1], 10) - 1;
              (record as Record<string, unknown>)[col] = params[pIdx];
            }
          }
        });
        store.set(id, record);
        return [record];
      }

      // SELECT FROM clubs_club
      if (lower.startsWith("select") && lower.includes("from clubs_club")) {
        const id = Number(params[0]);
        const record = store.get(id);
        return record ? [record] : [];
      }

      // INSERT INTO club_media
      if (lower.startsWith("insert into club_media")) {
        const id = idCounter++;
        const record = {
          id,
          club_id: Number(params[0]),
          media_type: String(params[1]),
          filename: String(params[2]),
          mime_type: String(params[3]),
          size_bytes: Number(params[4]),
          data: params[5] as Buffer,
          created_at: new Date(),
          updated_at: new Date(),
        };
        store.set(1000 + id, record);
        return [{ id: record.id, club_id: record.club_id, media_type: record.media_type, filename: record.filename, mime_type: record.mime_type, size_bytes: record.size_bytes }];
      }

      // SELECT FROM club_media
      if (lower.startsWith("select") && lower.includes("from club_media")) {
        const id = Number(params[0]);
        const mediaRecord = store.get(1000 + id);
        return mediaRecord ? [mediaRecord] : [];
      }

      // DELETE FROM club_media
      if (lower.startsWith("delete from club_media")) {
        return [];
      }

      return [];
    }),
    queryOne: jest.fn(async (sql: string, params: DbParam[]) => {
      const lower = sql.toLowerCase().trim();
      if (lower.includes("from club_media")) {
        const id = Number(params[0]);
        const mediaRecord = store.get(1000 + id);
        return mediaRecord || null;
      }
      if (lower.includes("from clubs_club")) {
        const id = Number(params[0]);
        return store.get(id) || null;
      }
      return null;
    }),
  };
});

describe("PostgreSQL BYTEA Club Media Validation & Repository", () => {
  it("1. JPEG upload validation succeeds", () => {
    const file = new File([new Uint8Array(100)], "logo.jpg", { type: "image/jpeg" });
    const res = validateClubMediaFile(file);
    expect(res.isValid).toBe(true);
  });

  it("2. PNG upload validation succeeds", () => {
    const file = new File([new Uint8Array(100)], "logo.png", { type: "image/png" });
    const res = validateClubMediaFile(file);
    expect(res.isValid).toBe(true);
  });

  it("3. WebP upload validation succeeds", () => {
    const file = new File([new Uint8Array(100)], "logo.webp", { type: "image/webp" });
    const res = validateClubMediaFile(file);
    expect(res.isValid).toBe(true);
  });

  it("4. PDF upload validation succeeds", () => {
    const file = new File([new Uint8Array(100)], "profile.pdf", { type: "application/pdf" });
    const res = validateClubMediaFile(file);
    expect(res.isValid).toBe(true);
  });

  it("5. Exactly 20 MB file validation succeeds", () => {
    const file = { size: MAX_CLUB_MEDIA_SIZE_BYTES, type: "image/png", name: "large.png" } as File;
    Object.setPrototypeOf(file, File.prototype);
    const res = validateClubMediaFile(file);
    expect(res.isValid).toBe(true);
  });

  it("6. File > 20 MB is rejected with clear error", () => {
    const file = { size: MAX_CLUB_MEDIA_SIZE_BYTES + 1, type: "image/png", name: "oversized.png" } as File;
    Object.setPrototypeOf(file, File.prototype);
    const res = validateClubMediaFile(file);
    expect(res.isValid).toBe(false);
    expect(res.error).toBe("File exceeds the maximum allowed size of 20 MB.");
  });

  it("7. Video upload is rejected with clear error", () => {
    const file = new File([new Uint8Array(100)], "clip.mp4", { type: "video/mp4" });
    const res = validateClubMediaFile(file);
    expect(res.isValid).toBe(false);
    expect(res.error).toBe("Unsupported file type.");
  });

  it("8. Audio upload is rejected with clear error", () => {
    const file = new File([new Uint8Array(100)], "audio.mp3", { type: "audio/mpeg" });
    const res = validateClubMediaFile(file);
    expect(res.isValid).toBe(false);
    expect(res.error).toBe("Unsupported file type.");
  });

  it("9. Unsupported MIME type (application/octet-stream) is rejected", () => {
    const file = new File([new Uint8Array(100)], "unknown.bin", { type: "application/octet-stream" });
    const res = validateClubMediaFile(file);
    expect(res.isValid).toBe(false);
    expect(res.error).toBe("Unsupported file type.");
  });

  it("9b. Validates magic-bytes for PNG, JPEG, WebP, and PDF signatures", () => {
    // PNG magic: 89 50 4E 47
    const pngBuf = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x00, 0x00]);
    expect(validateFileBufferSignature(pngBuf, "image/png")).toBe(true);

    // JPEG magic: FF D8 FF
    const jpgBuf = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00]);
    expect(validateFileBufferSignature(jpgBuf, "image/jpeg")).toBe(true);

    // PDF magic: %PDF (25 50 44 46)
    const pdfBuf = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31]);
    expect(validateFileBufferSignature(pdfBuf, "application/pdf")).toBe(true);

    // WebP magic: RIFF ... WEBP
    const webpBuf = new Uint8Array([
      0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50
    ]);
    expect(validateFileBufferSignature(webpBuf, "image/webp")).toBe(true);

    // Spoofed file (binary executable disguised as PNG)
    const spoofedBuf = new Uint8Array([0x7f, 0x45, 0x4c, 0x46]);
    expect(validateFileBufferSignature(spoofedBuf, "image/png")).toBe(false);
  });

  it("10. Insert and get BYTEA media record in PostgreSQL repository", async () => {
    const dataBuffer = Buffer.from("test binary payload");
    const inserted = await insertClubMedia({
      club_id: 54,
      media_type: "logo",
      filename: "test-logo.png",
      mime_type: "image/png",
      size_bytes: dataBuffer.length,
      data: dataBuffer,
    });

    expect(inserted.id).toBeDefined();
    expect(inserted.club_id).toBe(54);

    const fetched = await getClubMediaById(inserted.id);
    expect(fetched).not.toBeNull();
    expect(fetched?.mime_type).toBe("image/png");
    expect(fetched?.data).toEqual(dataBuffer);
  });

  it("11. Owner isolation: non-owner cannot update club media", async () => {
    // Register club owned by user_id 10
    const registerFormData = new FormData();
    registerFormData.append("name", "Owned Club");
    registerFormData.append("province_region", "Hanoi");
    registerFormData.append("representative_name", "Manager B");
    const regRes = await registerNewClub(registerFormData, 10);
    expect(regRes.ok).toBe(true);
    const createdClubId = regRes.club!.id;

    const updateFormData = new FormData();
    updateFormData.append("name", "Hacked Club Name");

    // Attempt update by non-owner user_id 99
    const res = await updateOwnerClub(createdClubId, 99, updateFormData);
    expect(res.ok).toBe(false);
    expect(res.status).toBe(403);
    expect(res.message).toContain("Forbidden");
  });

  it("12. Oversized file upload during club registration returns 400", async () => {
    const formData = new FormData();
    formData.append("name", "Big Media Club");
    formData.append("province_region", "Hanoi");
    formData.append("representative_name", "Coach A");

    const hugeFile = { size: 25 * 1024 * 1024, type: "image/png", name: "huge.png" } as File;
    Object.setPrototypeOf(hugeFile, File.prototype);
    formData.append("logo", hugeFile);

    const res = await registerNewClub(formData, 10);
    expect(res.ok).toBe(false);
    expect(res.status).toBe(400);
    expect(res.message).toBe("File exceeds the maximum allowed size of 20 MB.");
  });

  it("13. Roster/member image upload persists to PostgreSQL BYTEA with club_id=56 and media_type=u20_athlete", async () => {
    // Register club 56 owned by user_id 42
    const registerFormData = new FormData();
    registerFormData.append("name", "Club 56 Hoops");
    registerFormData.append("province_region", "HCMC");
    registerFormData.append("representative_name", "Rep 56");
    const regRes = await registerNewClub(registerFormData, 42);
    expect(regRes.ok).toBe(true);
    const clubId = regRes.club!.id;

    // Upload roster member image for club 56
    const updateFormData = new FormData();
    updateFormData.append("name", "Club 56 Hoops Updated");

    const pngHeader = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const mockRosterFile = new File([pngHeader], "athlete56.png", { type: "image/png" });
    updateFormData.append("u20_athlete_images", mockRosterFile);

    const updateRes = await updateOwnerClub(clubId, 42, updateFormData);
    expect(updateRes.ok).toBe(true);
    expect(updateRes.club?.u20_athlete_images?.length).toBeGreaterThan(0);
    expect(updateRes.club?.u20_athlete_images?.[0]).toContain(`/media/clubs/${clubId}/u20_athlete/`);
  });

  it("14. Preserves existing roster media when file input is empty on update", async () => {
    // Register club owned by user_id 42
    const registerFormData = new FormData();
    registerFormData.append("name", "Preserve Media Club");
    registerFormData.append("province_region", "Da Nang");
    registerFormData.append("representative_name", "Rep 14");
    const regRes = await registerNewClub(registerFormData, 42);
    expect(regRes.ok).toBe(true);
    const clubId = regRes.club!.id;

    // Perform update without passing any file inputs
    const updateFormData = new FormData();
    updateFormData.append("name", "Preserve Media Club Updated");

    const updateRes = await updateOwnerClub(clubId, 42, updateFormData);
    expect(updateRes.ok).toBe(true);
    expect(updateRes.club).toBeDefined();
    expect(updateRes.club?.name).toBe("Preserve Media Club Updated");
  });

  it("15. Logo upload preserves new media record (delete-before-insert) and edit without logo preserves existing logo", async () => {
    // 1. Register club with a logo
    const regFormData = new FormData();
    regFormData.append("name", "Logo Test Club");
    regFormData.append("province_region", "Can Tho");
    regFormData.append("representative_name", "Coach Logo");
    const pngHeader = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const logoFile1 = new File([pngHeader], "logo1.png", { type: "image/png" });
    regFormData.append("logo", logoFile1);

    const regRes = await registerNewClub(regFormData, 42);
    expect(regRes.ok).toBe(true);
    const clubId = regRes.club!.id;
    const initialLogoUrl = regRes.club!.logo;
    expect(initialLogoUrl).toContain(`/media/clubs/${clubId}/logo/`);

    // 2. Update club name ONLY (no logo uploaded) -> existing logo MUST be preserved
    const updateNoLogoData = new FormData();
    updateNoLogoData.append("name", "Logo Test Club Renamed");
    const updateNoLogoRes = await updateOwnerClub(clubId, 42, updateNoLogoData);
    expect(updateNoLogoRes.ok).toBe(true);

    // 3. Update club with a NEW logo file -> old logo deleted, new logo saved
    const logoFile2 = new File([pngHeader], "logo2.png", { type: "image/png" });
    const updateWithLogoData = new FormData();
    updateWithLogoData.append("name", "Logo Test Club Renamed Again");
    updateWithLogoData.append("logo", logoFile2);

    const updateWithLogoRes = await updateOwnerClub(clubId, 42, updateWithLogoData);
    expect(updateWithLogoRes.ok).toBe(true);
    expect(logoFile2).toBeDefined();
  });
});
