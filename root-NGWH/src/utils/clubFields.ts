export function formatTextListField(value: unknown): string[] {
  if (typeof value === "string") {
    return [value];
  }
  if (Array.isArray(value)) {
    return value.map((v) => String(v));
  }
  return [];
}
