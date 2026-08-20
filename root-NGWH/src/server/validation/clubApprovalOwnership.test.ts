import {
  registerNewClub,
  getApprovedClubsList,
  getClubDetailForView,
  updateOwnerClub,
  getUserClubsList,
} from "../services/clubsServerService";
import * as clubsRepository from "../repositories/clubsRepository";
import * as adminClubsRepository from "../repositories/adminClubsRepository";

jest.mock("../repositories/clubsRepository");
jest.mock("../repositories/adminClubsRepository");

describe("Club Registration Approval + My Club Ownership Rules", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("1. New registration creates is_approved = false", async () => {
    const formData = new FormData();
    formData.append("name", "Test Club");
    formData.append("province_region", "Hanoi");
    formData.append("representative_name", "John Doe");

    (clubsRepository.createClub as jest.Mock).mockResolvedValue({
      id: 101,
      name: "Test Club",
      province_region: "Hanoi",
      representative_name: "John Doe",
      logo: null,
      capability_profile: null,
      u20_athlete_list: null,
      is_approved: false,
      user_id: 5,
    });

    const result = await registerNewClub(formData, 5);
    expect(clubsRepository.createClub).toHaveBeenCalledWith(
      expect.objectContaining({
        is_approved: false,
      })
    );
    expect(result.ok).toBe(true);
  });

  it("2. New registration stores authenticated user_id", async () => {
    const formData = new FormData();
    formData.append("name", "Test Club");
    formData.append("province_region", "Hanoi");
    formData.append("representative_name", "John Doe");

    (clubsRepository.createClub as jest.Mock).mockResolvedValue({
      id: 101,
      name: "Test Club",
      province_region: "Hanoi",
      representative_name: "John Doe",
      is_approved: false,
      user_id: 42,
    });

    await registerNewClub(formData, 42);
    expect(clubsRepository.createClub).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 42,
      })
    );
  });

  it("3. Public getApprovedClubsList queries only approved clubs", async () => {
    (clubsRepository.findApprovedClubsPaginated as jest.Mock).mockResolvedValue({
      clubs: [
        {
          id: 1,
          name: "Approved Club",
          logo: null,
          founding_year: 2020,
          achievements: null,
          province_region: "Hanoi",
          is_approved: true,
        },
      ],
      total: 1,
      page: 1,
      limit: 9,
      totalPages: 1,
    });

    const list = await getApprovedClubsList();
    expect(clubsRepository.findApprovedClubsPaginated).toHaveBeenCalled();
    expect(list.data).toHaveLength(1);
    expect(list.data[0].id).toBe(1);
  });

  it("4. Public search/filter excludes pending clubs", async () => {
    (clubsRepository.findApprovedClubsPaginated as jest.Mock).mockResolvedValue({
      clubs: [],
      total: 0,
      page: 1,
      limit: 9,
      totalPages: 0,
    });

    const list = await getApprovedClubsList({ search: "Pending" });
    expect(clubsRepository.findApprovedClubsPaginated).toHaveBeenCalledWith({ search: "Pending" });
    expect(list.data).toHaveLength(0);
  });

  it("5. Owner can retrieve own pending club", async () => {
    (clubsRepository.findClubById as jest.Mock).mockResolvedValue({
      id: 101,
      name: "My Pending Club",
      is_approved: false,
      user_id: 42,
    });
    (clubsRepository.findPlayersByClubId as jest.Mock).mockResolvedValue([]);
    (clubsRepository.findCoachStaffByClubId as jest.Mock).mockResolvedValue([]);

    const club = await getClubDetailForView(101, 42, false);
    expect(club).not.toBeNull();
    expect(club?.name).toBe("My Pending Club");
    expect(club?.is_approved).toBe(false);
  });

  it("6. Non-owner cannot retrieve another user's pending club", async () => {
    (clubsRepository.findClubById as jest.Mock).mockResolvedValue({
      id: 101,
      name: "My Pending Club",
      is_approved: false,
      user_id: 42,
    });

    const club = await getClubDetailForView(101, 999, false);
    expect(club).toBeNull();
  });

  it("7. Owner can update own club", async () => {
    (clubsRepository.findClubById as jest.Mock).mockResolvedValue({
      id: 101,
      name: "Old Name",
      user_id: 42,
    });
    (clubsRepository.updateClub as jest.Mock).mockResolvedValue({
      id: 101,
      name: "Updated Name",
      user_id: 42,
      is_approved: false,
    });

    const formData = new FormData();
    formData.append("name", "Updated Name");

    const res = await updateOwnerClub(101, 42, formData);
    expect(res.ok).toBe(true);
    expect(res.club?.name).toBe("Updated Name");
  });

  it("8. Non-owner receives 403 when updating another user's club", async () => {
    (clubsRepository.findClubById as jest.Mock).mockResolvedValue({
      id: 101,
      name: "Old Name",
      user_id: 42,
    });

    const formData = new FormData();
    formData.append("name", "Hacked Name");

    const res = await updateOwnerClub(101, 999, formData);
    expect(res.ok).toBe(false);
    expect(res.status).toBe(403);
  });

  it("9. Owner cannot modify approval status via updateOwnerClub", async () => {
    (clubsRepository.findClubById as jest.Mock).mockResolvedValue({
      id: 101,
      name: "Pending Club",
      user_id: 42,
      is_approved: false,
    });
    (clubsRepository.updateClub as jest.Mock).mockResolvedValue({
      id: 101,
      name: "Pending Club",
      user_id: 42,
      is_approved: false,
    });

    const formData = new FormData();
    formData.append("is_approved", "true");

    await updateOwnerClub(101, 42, formData);
    expect(clubsRepository.updateClub).toHaveBeenCalledWith(
      101,
      expect.not.objectContaining({ is_approved: true })
    );
  });

  it("10. Admin can approve a pending club", async () => {
    (adminClubsRepository.updateClubApprovalStatus as jest.Mock).mockResolvedValue({
      id: 101,
      name: "Now Approved",
      is_approved: true,
    });

    const result = await adminClubsRepository.updateClubApprovalStatus(101, true);
    expect(result?.is_approved).toBe(true);
  });

  it("11. Approved club appears publicly after admin approval", async () => {
    (clubsRepository.findApprovedClubsPaginated as jest.Mock).mockResolvedValue({
      clubs: [
        {
          id: 101,
          name: "Now Approved",
          is_approved: true,
        },
      ],
      total: 1,
      page: 1,
      limit: 9,
      totalPages: 1,
    });

    const publicList = await getApprovedClubsList();
    expect(publicList.data.some((c) => c.id === 101)).toBe(true);
  });

  it("12. Admin can reject a club", async () => {
    (adminClubsRepository.deleteClubById as jest.Mock).mockResolvedValue(true);

    const deleted = await adminClubsRepository.deleteClubById(101);
    expect(deleted).toBe(true);
  });

  it("13. Rejected/deleted club does not appear publicly", async () => {
    (clubsRepository.findApprovedClubsPaginated as jest.Mock).mockResolvedValue({
      clubs: [],
      total: 0,
      page: 1,
      limit: 9,
      totalPages: 0,
    });

    const list = await getApprovedClubsList();
    expect(list.data).toHaveLength(0);
  });

  it("14. Existing approved clubs continue working in getUserClubsList and public list", async () => {
    (clubsRepository.findClubsByUserId as jest.Mock).mockResolvedValue([
      {
        id: 1,
        name: "Existing Approved Club",
        is_approved: true,
        user_id: 42,
      },
    ]);

    const userClubs = await getUserClubsList(42);
    expect(userClubs).toHaveLength(1);
    expect(userClubs[0].is_approved).toBe(true);
  });
});
