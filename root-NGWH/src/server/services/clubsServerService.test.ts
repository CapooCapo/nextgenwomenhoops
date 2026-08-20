import {
  getApprovedClubDetail,
  getClubDetailForView,
  getApprovedClubsList,
  registerNewClub,
  getUserClubsList,
  updateOwnerClub,
} from "./clubsServerService";
import * as clubsRepository from "../repositories/clubsRepository";

jest.mock("../repositories/clubsRepository");

describe("clubsServerService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getApprovedClubsList", () => {
    it("formats and returns approved clubs list with pagination", async () => {
      (clubsRepository.findApprovedClubsPaginated as jest.Mock).mockResolvedValue({
        clubs: [
          {
            id: 1,
            name: "Hoops Club",
            logo: "/logo.png",
            founding_year: 2020,
            achievements: ["Championship 2021"],
            province_region: "Hanoi",
            contact_info: { email: "test@example.com" },
            social_links: null,
            is_approved: true,
            representative_name: "Rep Name",
            capability_profile: null,
            u20_athlete_list: null,
          },
        ],
        total: 1,
        page: 1,
        limit: 9,
        totalPages: 1,
      });

      const result = await getApprovedClubsList("Hanoi");
      expect(clubsRepository.findApprovedClubsPaginated).toHaveBeenCalledWith({
        provinceRegion: "Hanoi",
      });
      expect(result).toEqual({
        data: [
          {
            id: 1,
            name: "Hoops Club",
            logo: "/logo.png",
            founding_year: 2020,
            achievements: ["Championship 2021"],
            province_region: "Hanoi",
          },
        ],
        pagination: {
          page: 1,
          limit: 9,
          total: 1,
          totalPages: 1,
        },
      });
      // Ensures is_approved and representative_name are excluded from public list
      expect(result.data[0]).not.toHaveProperty("is_approved");
      expect(result.data[0]).not.toHaveProperty("representative_name");
    });
  });

  describe("getApprovedClubDetail and getClubDetailForView", () => {
    it("returns null if club is not found", async () => {
      (clubsRepository.findClubById as jest.Mock).mockResolvedValue(null);

      const result = await getApprovedClubDetail(999);
      expect(result).toBeNull();
    });

    it("returns null for non-owner viewing pending club", async () => {
      (clubsRepository.findClubById as jest.Mock).mockResolvedValue({
        id: 1,
        name: "Pending Club",
        is_approved: false,
        user_id: 10,
      });

      const nonOwnerView = await getApprovedClubDetail(1);
      expect(nonOwnerView).toBeNull();
    });

    it("returns club detail for owner viewing own pending club", async () => {
      (clubsRepository.findClubById as jest.Mock).mockResolvedValue({
        id: 1,
        name: "Pending Club",
        logo: "/logo.png",
        founding_year: 2020,
        achievements: null,
        province_region: "Hanoi",
        contact_info: null,
        social_links: null,
        is_approved: false,
        representative_name: "Rep Name",
        capability_profile: null,
        u20_athlete_list: null,
        user_id: 10,
      });
      (clubsRepository.findPlayersByClubId as jest.Mock).mockResolvedValue([]);
      (clubsRepository.findCoachStaffByClubId as jest.Mock).mockResolvedValue([]);

      const ownerView = await getApprovedClubDetail(1); // without params, defaults to non-owner -> null
      expect(ownerView).toBeNull();

      const result = await getClubDetailForView(1, 10, false);
      expect(result).not.toBeNull();
      expect(result?.name).toBe("Pending Club");
      expect(result?.is_approved).toBe(false);
    });

    it("returns detailed profile with nested players and coaching staff for approved club", async () => {
      (clubsRepository.findClubById as jest.Mock).mockResolvedValue({
        id: 1,
        name: "Hoops Club",
        logo: "/logo.png",
        founding_year: 2020,
        achievements: null,
        province_region: "Hanoi",
        contact_info: { email: "contact@hoops.com" },
        social_links: { facebook: "https://fb.com/hoops" },
        is_approved: true,
        representative_name: "Rep Name",
        capability_profile: null,
        u20_athlete_list: null,
        user_id: 10,
      });
      (clubsRepository.findPlayersByClubId as jest.Mock).mockResolvedValue([
        { id: 10, club_id: 1, name: "Player 1" },
      ]);
      (clubsRepository.findCoachStaffByClubId as jest.Mock).mockResolvedValue([
        { id: 20, club_id: 1, name: "Coach 1" },
      ]);

      const result = await getApprovedClubDetail(1);
      expect(result).toEqual({
        id: 1,
        name: "Hoops Club",
        logo: "/logo.png",
        founding_year: 2020,
        achievements: null,
        province_region: "Hanoi",
        contact_info: { email: "contact@hoops.com" },
        social_links: { facebook: "https://fb.com/hoops" },
        capability_profile: null,
        u20_athlete_list: null,
        u20_athlete_images: [],
        players: [{ id: 10, name: "Player 1" }],
        coach_staff: [{ id: 20, name: "Coach 1" }],
        user_id: 10,
        is_approved: true,
      });
    });
  });

  describe("registerNewClub", () => {
    it("returns 400 when required fields are missing", async () => {
      const formData = new FormData();
      formData.append("name", "");

      const result = await registerNewClub(formData);
      expect(result.ok).toBe(false);
      expect(result.status).toBe(400);
      expect(result.errors).toHaveProperty("name");
    });

    it("creates an unapproved club with status 201", async () => {
      const formData = new FormData();
      formData.append("name", "New Club");
      formData.append("province_region", "Da Nang");
      formData.append("representative_name", "Jane Doe");

      (clubsRepository.createClub as jest.Mock).mockResolvedValue({
        id: 5,
        name: "New Club",
        logo: null,
        founding_year: null,
        achievements: null,
        province_region: "Da Nang",
        contact_info: null,
        social_links: null,
        is_approved: false,
        representative_name: "Jane Doe",
        capability_profile: null,
        u20_athlete_list: null,
        user_id: 42,
      });

      const result = await registerNewClub(formData, 42);
      expect(result.ok).toBe(true);
      expect(result.status).toBe(201);
      expect(result.club).toEqual({
        id: 5,
        name: "New Club",
        province_region: "Da Nang",
        representative_name: "Jane Doe",
        logo: null,
        capability_profile: null,
        u20_athlete_list: null,
        u20_athlete_images: [],
      });
    });
  });

  describe("getUserClubsList", () => {
    it("returns clubs belonging to user", async () => {
      (clubsRepository.findClubsByUserId as jest.Mock).mockResolvedValue([
        {
          id: 1,
          name: "User Club",
          logo: null,
          founding_year: 2021,
          achievements: null,
          province_region: "Hanoi",
          contact_info: null,
          social_links: null,
          is_approved: false,
          representative_name: "User Rep",
          capability_profile: null,
          u20_athlete_list: null,
          user_id: 42,
        },
      ]);

      const result = await getUserClubsList(42);
      expect(clubsRepository.findClubsByUserId).toHaveBeenCalledWith(42);
      expect(result).toHaveLength(1);
      expect(result[0].user_id).toBe(42);
    });
  });

  describe("updateOwnerClub", () => {
    it("returns 404 if club does not exist", async () => {
      (clubsRepository.findClubById as jest.Mock).mockResolvedValue(null);
      const formData = new FormData();
      const result = await updateOwnerClub(999, 42, formData);
      expect(result).toEqual({ ok: false, status: 404, message: "Club not found" });
    });

    it("returns 403 if user is not the club owner", async () => {
      (clubsRepository.findClubById as jest.Mock).mockResolvedValue({
        id: 1,
        name: "User A Club",
        user_id: 10,
      });

      const formData = new FormData();
      const result = await updateOwnerClub(1, 42, formData);
      expect(result).toEqual({
        ok: false,
        status: 403,
        message: "Forbidden: You do not own this club",
      });
    });

    it("updates club fields successfully for authorized owner", async () => {
      (clubsRepository.findClubById as jest.Mock).mockResolvedValue({
        id: 1,
        name: "Old Name",
        province_region: "Hanoi",
        representative_name: "Old Rep",
        user_id: 42,
      });

      (clubsRepository.updateClub as jest.Mock).mockResolvedValue({
        id: 1,
        name: "New Name",
        province_region: "Da Nang",
        representative_name: "New Rep",
        founding_year: 2022,
        logo: null,
        capability_profile: null,
        u20_athlete_list: null,
        is_approved: true,
        user_id: 42,
      });

      const formData = new FormData();
      formData.append("name", "New Name");
      formData.append("province_region", "Da Nang");
      formData.append("representative_name", "New Rep");

      const result = await updateOwnerClub(1, 42, formData);
      expect(result.ok).toBe(true);
      expect(result.status).toBe(200);
      expect(result.club?.name).toBe("New Name");
    });
  });
});
