// Shape-defensive parsing for Club fields whose JSON structure is
// REQUIRES_CONFIRMATION (.ai/lld/clubs.md §2-3): achievements,
// contact_info, social_links. Only a non-empty string or an array of
// non-empty strings is treated as renderable data — any other shape
// (object, array of objects, null, number, etc.) is treated as absent.
// Shared by ClubProfileCard (Directory excerpt) and the Club Profile
// sections (.ai/lld/club-profile.md §16) so the same defensive rule
// isn't duplicated per field/component.

export type TextListField =
  | { kind: "text"; value: string }
  | { kind: "list"; values: string[] };

export function formatTextListField(value: unknown): TextListField | null {
  if (typeof value === "string" && value.trim().length > 0) {
    return { kind: "text", value };
  }
  if (Array.isArray(value)) {
    const values = value.filter(
      (item): item is string =>
        typeof item === "string" && item.trim().length > 0,
    );
    return values.length > 0 ? { kind: "list", values } : null;
  }
  return null;
}

/**
 * A social link is only linkified when it's already a well-formed URL
 * string — no {platform, url} or similar structure is guessed
 * (.ai/lld/club-profile.md §16).
 */
export function isUrlLike(value: string): boolean {
  return /^https?:\/\//i.test(value.trim());
}
