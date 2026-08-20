import { registerClub } from "@/services/clubsService";
import { submitClubRegistrationAction } from "./actions";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

jest.mock("@/services/clubsService", () => ({
  registerClub: jest.fn(),
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

jest.mock("next/headers", () => ({
  cookies: jest.fn().mockResolvedValue({
    toString: () => "",
  }),
}));

const mockedRegisterClub = jest.mocked(registerClub);
const mockedRevalidatePath = jest.mocked(revalidatePath);
const mockedRedirect = jest.mocked(redirect);

describe("submitClubRegistrationAction", () => {
  beforeEach(() => {
    mockedRegisterClub.mockReset();
    mockedRevalidatePath.mockReset();
    mockedRedirect.mockReset();
  });

  it("forwards the FormData to clubsService.registerClub unmodified", async () => {
    mockedRegisterClub.mockResolvedValueOnce({
      ok: true,
      club: { id: 1, name: "New Club", province_region: "Hanoi", representative_name: "Jane", logo: null, capability_profile: null, u20_athlete_list: null },
    });
    const formData = new FormData();
    formData.set("name", "New Club");

    await submitClubRegistrationAction({ status: "idle" }, formData);

    expect(mockedRegisterClub).toHaveBeenCalledWith(formData, "");
    expect(mockedRevalidatePath).toHaveBeenCalledWith("/account/clubs");
    expect(mockedRedirect).toHaveBeenCalledWith("/account/clubs");
  });

  it("calls revalidatePath and redirect when registerClub resolves ok", async () => {
    mockedRegisterClub.mockResolvedValueOnce({
      ok: true,
      club: { id: 1, name: "New Club", province_region: "Hanoi", representative_name: "Jane", logo: null, capability_profile: null, u20_athlete_list: null },
    });

    await submitClubRegistrationAction({ status: "idle" }, new FormData());

    expect(mockedRevalidatePath).toHaveBeenCalledWith("/account/clubs");
    expect(mockedRedirect).toHaveBeenCalledWith("/account/clubs");
  });

  it("returns status:error with fieldErrors when registerClub resolves a validation failure", async () => {
    const fieldErrors = { name: ["This field is required."] };
    mockedRegisterClub.mockResolvedValueOnce({ ok: false, fieldErrors });

    await expect(
      submitClubRegistrationAction({ status: "idle" }, new FormData()),
    ).resolves.toEqual({ status: "error", fieldErrors });
  });

  it("returns status:error with networkError when registerClub resolves a network failure", async () => {
    mockedRegisterClub.mockResolvedValueOnce({ ok: false, networkError: true });

    await expect(
      submitClubRegistrationAction({ status: "idle" }, new FormData()),
    ).resolves.toEqual({ status: "error", networkError: true });
  });
});
