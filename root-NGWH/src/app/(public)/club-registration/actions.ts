"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { registerClub } from "@/services/clubsService";
import type { RegistrationActionState } from "./registrationActionState";

export async function submitClubRegistrationAction(
  _prevState: RegistrationActionState,
  formData: FormData,
): Promise<RegistrationActionState> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const result = await registerClub(formData, cookieHeader);

  if (!result.ok) {
    if ("fieldErrors" in result && result.fieldErrors) {
      return { status: "error", fieldErrors: result.fieldErrors };
    }
    if ("networkError" in result && result.networkError) {
      return { status: "error", networkError: true };
    }
    return { status: "error" };
  }

  revalidatePath("/account/clubs");
  revalidatePath("/clubs");
  redirect("/account/clubs");
}
