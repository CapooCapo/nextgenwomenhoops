import { registerClub } from "@/services/clubsService";
import { submitClubRegistrationAction } from "./actions";

jest.mock("@/services/clubsService", () => ({
  registerClub: jest.fn(),
}));

const mockedRegisterClub = jest.mocked(registerClub);

describe("submitClubRegistrationAction", () => {
  beforeEach(() => {
    mockedRegisterClub.mockReset();
  });

  it("forwards the FormData to clubsService.registerClub unmodified", async () => {
    mockedRegisterClub.mockResolvedValueOnce({
      ok: true,
      club: { id: 1, name: "New Club", province_region: "Hanoi", representative_name: "Jane", capability_profile: null, u20_athlete_list: null },
    });
    const formData = new FormData();
    formData.set("name", "New Club");

    await submitClubRegistrationAction({ status: "idle" }, formData);

    expect(mockedRegisterClub).toHaveBeenCalledWith(formData);
  });

  it("returns status:success when registerClub resolves ok", async () => {
    mockedRegisterClub.mockResolvedValueOnce({
      ok: true,
      club: { id: 1, name: "New Club", province_region: "Hanoi", representative_name: "Jane", capability_profile: null, u20_athlete_list: null },
    });

    await expect(
      submitClubRegistrationAction({ status: "idle" }, new FormData()),
    ).resolves.toEqual({ status: "success" });
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
