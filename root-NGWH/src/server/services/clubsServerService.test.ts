import {
  getApprovedClubDetail,
  getApprovedClubsList,
  registerNewClub,
} from "./clubsServerService";
import * as clubsRepository from "../repositories/clubsRepository";

jest.mock("../repositories/clubsRepository");

describe("clubsServerService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getApprovedClubsList", () => {
    it("formats and returns approved clubs list", async () => {
      (clubsRepository.findApprovedClubs as jest.Mock).mockResolvedValue([
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
      ]);

      const result = await getApprovedClubsList("Hanoi");
      expect(clubsRepository.findApprovedClubs).toHaveBeenCalledWith("Hanoi");
      expect(result).toEqual([
        {
          id: 1,
          name: "Hoops Club",
          logo: "/logo.png",
          founding_year: 2020,
          achievements: ["Championship 2021"],
          province_region: "Hanoi",
        },
      ]);
      // Ensures is_approved and representative_name are excluded from public list
      expect(result[0]).not.toHaveProperty("is_approved");
      expect(result[0]).not.toHaveProperty("representative_name");
    });
  });

  describe("getApprovedClubDetail", () => {
    it("returns null if club is not found or not approved", async () => {
      (clubsRepository.findApprovedClubById as jest.Mock).mockResolvedValue(null);

      const result = await getApprovedClubDetail(999);
      expect(result).toBeNull();
    });

    it("returns detailed profile with nested players and coaching staff", async () => {
      (clubsRepository.findApprovedClubById as jest.Mock).mockResolvedValue({
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
        players: [{ id: 10, name: "Player 1" }],
        coach_staff: [{ id: 20, name: "Coach 1" }],
      });
      expect(result).not.toHaveProperty("is_approved");
      expect(result).not.toHaveProperty("representative_name");
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
      });

      const result = await registerNewClub(formData);
      expect(result.ok).toBe(true);
      expect(result.status).toBe(201);
      expect(result.club).toEqual({
        id: 5,
        name: "New Club",
        province_region: "Da Nang",
        representative_name: "Jane Doe",
        capability_profile: null,
        u20_athlete_list: null,
      });
    });
  });
});
