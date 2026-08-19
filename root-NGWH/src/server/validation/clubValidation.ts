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
