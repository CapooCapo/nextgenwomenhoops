// Split out of actions.ts: a "use server" file may only export async
// functions (Server Actions) — a plain object/type export there is
// invalid ("A 'use server' file can only export async functions, found
// object"). Same reason REGISTRATION_INTRO_COOKIE_NAME lives in
// introConstants.ts rather than introActions.ts, and LOCALE_COOKIE_NAME
// lives in i18n/request.ts rather than i18n/actions.ts.
export interface RegistrationActionState {
  status: "idle" | "success" | "error";
  fieldErrors?: Record<string, string[]>;
  networkError?: boolean;
}

export const initialRegistrationActionState: RegistrationActionState = {
  status: "idle",
};
