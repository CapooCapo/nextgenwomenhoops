import { validateClubRegistration } from "./clubValidation";

describe("validateClubRegistration", () => {
  it("passes validation when all required fields are present", () => {
    const result = validateClubRegistration({
      name: "Legendary Women",
      province_region: "Hanoi",
      representative_name: "John Smith",
    });
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual({});
  });

  it("returns error keys when required fields are missing or whitespace", () => {
    const result = validateClubRegistration({
      name: "",
      province_region: "   ",
      representative_name: undefined,
    });
    expect(result.isValid).toBe(false);
    expect(result.errors).toEqual({
      name: ["This field is required."],
      province_region: ["This field is required."],
      representative_name: ["This field is required."],
    });
  });
});
