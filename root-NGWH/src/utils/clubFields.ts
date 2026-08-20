import { AchievementItem, ClubContactInfo, ClubSocialLinks } from "../types/club";

export function formatTextListField(value: unknown): string[] {
  if (!value) return [];
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.map((v) => (typeof v === "object" && v !== null ? v.title || String(v) : String(v)));
      }
    } catch {
      return [value];
    }
    return [value];
  }
  if (Array.isArray(value)) {
    return value.map((v) => (typeof v === "object" && v !== null ? v.title || String(v) : String(v)));
  }
  return [];
}

export function formatAchievements(value: unknown): AchievementItem[] {
  if (!value) return [];
  
  let raw: unknown = value;
  if (typeof value === "string") {
    try {
      raw = JSON.parse(value);
    } catch {
      return [{ title: value }];
    }
  }

  if (Array.isArray(raw)) {
    const list: AchievementItem[] = [];
    for (const item of raw) {
      if (typeof item === "string" && item.trim()) {
        list.push({ title: item.trim() });
      } else if (typeof item === "object" && item !== null) {
        const obj = item as Record<string, unknown>;
        const title = String(obj.title || obj.name || "").trim();
        if (title) {
          list.push({
            title,
            year: obj.year ? String(obj.year) : undefined,
            description: obj.description ? String(obj.description) : undefined,
          });
        }
      }
    }
    return list;
  }

  if (typeof raw === "object" && raw !== null) {
    const obj = raw as Record<string, unknown>;
    if (obj.title) {
      return [
        {
          title: String(obj.title),
          year: obj.year ? String(obj.year) : undefined,
          description: obj.description ? String(obj.description) : undefined,
        },
      ];
    }
  }

  return [];
}

export interface ClubContactInfoResult extends ClubContactInfo {
  raw_string?: string;
}

export function formatContactInfo(value: unknown): ClubContactInfoResult {
  if (!value) return {};
  
  let raw: unknown = value;
  if (typeof value === "string") {
    try {
      raw = JSON.parse(value);
    } catch {
      return { raw_string: value };
    }
  }

  if (typeof raw === "object" && raw !== null && !Array.isArray(raw)) {
    const obj = raw as Record<string, unknown>;
    return {
      email: obj.email ? String(obj.email) : undefined,
      phone: obj.phone ? String(obj.phone) : undefined,
      website: obj.website ? String(obj.website) : undefined,
      address: obj.address ? String(obj.address) : undefined,
    };
  }

  if (Array.isArray(raw)) {
    const info: ClubContactInfoResult = {};
    raw.forEach((item) => {
      const str = String(item);
      if (str.includes("@") && !info.email) {
        info.email = str;
      } else if (/^\+?[0-9\s-]{7,}$/.test(str) && !info.phone) {
        info.phone = str;
      } else if (/^https?:\/\//i.test(str) && !info.website) {
        info.website = str;
      } else if (!info.address) {
        info.address = str;
      }
    });
    return info;
  }

  return {};
}

export interface ClubSocialLinksResult extends ClubSocialLinks {
  legacyList?: string[];
}

export function formatSocialLinks(value: unknown): ClubSocialLinksResult {
  if (!value) return {};

  let raw: unknown = value;
  if (typeof value === "string") {
    try {
      raw = JSON.parse(value);
    } catch {
      return { legacyList: [value] };
    }
  }

  if (typeof raw === "object" && raw !== null && !Array.isArray(raw)) {
    const obj = raw as Record<string, unknown>;
    return {
      facebook: obj.facebook ? String(obj.facebook) : undefined,
      instagram: obj.instagram ? String(obj.instagram) : undefined,
      tiktok: obj.tiktok ? String(obj.tiktok) : undefined,
      youtube: obj.youtube ? String(obj.youtube) : undefined,
    };
  }

  if (Array.isArray(raw)) {
    const links: ClubSocialLinksResult = {};
    const legacy: string[] = [];
    raw.forEach((item) => {
      const str = String(item);
      if (str.includes("facebook.com")) links.facebook = str;
      else if (str.includes("instagram.com")) links.instagram = str;
      else if (str.includes("tiktok.com")) links.tiktok = str;
      else if (str.includes("youtube.com")) links.youtube = str;
      else legacy.push(str);
    });
    if (legacy.length > 0) links.legacyList = legacy;
    return links;
  }

  return {};
}
