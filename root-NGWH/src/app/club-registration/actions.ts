"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { registerClub } from "@/services/clubsService";
import type { RegistrationActionState } from "./registrationActionState";

/**
 * REQ-REG-001/002/003 form submission — Sprint 3
 * (.ai/lld/club-registration.md §10). Follows the same `"use server"`
 * Server Action precedent already established by `setLocaleAction`
 * (src/i18n/actions.ts): the browser's `FormData` (including any files)
 * is submitted to this Next.js server action, which forwards it,
 * unmodified to Next.js API Route Handlers — the browser never talks to external APIs
 * directly (ARCHITECTURE.md §12 constraint 1).
 */
export async function submitClubRegistrationAction(
  _prevState: RegistrationActionState,
  formData: FormData,
): Promise<RegistrationActionState> {
  const result = await registerClub(formData);

  if (!result.ok) {
    if ("fieldErrors" in result && result.fieldErrors) {
      return { status: "error", fieldErrors: result.fieldErrors };
    }
    if ("networkError" in result && result.networkError) {
      return { status: "error", networkError: true };
    }
    return { status: "error" };
  }

  revalidatePath("/clubs");
  redirect("/clubs");
}
