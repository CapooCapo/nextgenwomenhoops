export interface ClubRegistrationInput {
  name?: string | null;
  province_region?: string | null;
  representative_name?: string | null;
}

export interface FieldErrors {
  [key: string]: string[];
}

export function validateClubRegistration(input: ClubRegistrationInput): {
  isValid: boolean;
  errors: FieldErrors;
} {
  const errors: FieldErrors = {};

  if (!input.name || input.name.trim() === "") {
    errors.name = ["This field is required."];
  }
  if (!input.province_region || input.province_region.trim() === "") {
    errors.province_region = ["This field is required."];
  }
  if (!input.representative_name || input.representative_name.trim() === "") {
    errors.representative_name = ["This field is required."];
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateU20AthleteFiles(files: File[]): { isValid: boolean; error?: string } {
  if (files.length > 12) {
    return { isValid: false, error: "Maximum 12 U20 athlete images allowed." };
  }

  const maxSizeBytes = 5 * 1024 * 1024; // 5MB limit
  for (const file of files) {
    if (file && file instanceof File && file.size > 0) {
      if (file.size > maxSizeBytes) {
        return { isValid: false, error: `File "${file.name}" exceeds maximum allowed size of 5MB.` };
      }
      if (file.type && !file.type.startsWith("image/")) {
        return { isValid: false, error: `File "${file.name}" is not a valid image format.` };
      }
    }
  }

  return { isValid: true };
}
