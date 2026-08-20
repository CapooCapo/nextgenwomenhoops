// Split out of introActions.ts: a "use server" file may only export async
// functions (Server Actions) — a plain constant export there breaks the
// module for every consumer, same reason LOCALE_COOKIE_NAME lives in
// i18n/request.ts rather than i18n/actions.ts.
export const REGISTRATION_INTRO_COOKIE_NAME = "club_registration_intro_seen";
