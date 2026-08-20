/**
 * @jest-environment node
 */
import { POST } from "./route";
import { PATCH, DELETE } from "./[id]/route";
import { NextRequest } from "next/server";
import { requireAdminRole } from "@/server/auth/adminAuth";
import {
  createHeroSlide,
  updateHeroSlide,
  deleteHeroSlide,
  findEnabledHeroSlides,
} from "@/server/repositories/heroRepository";
import { getPublicHeroSlides } from "@/server/services/heroServerService";
import { revalidatePath } from "next/cache";

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

jest.mock("@/server/auth/adminAuth", () => ({
  requireAdminRole: jest.fn(),
}));

jest.mock("@/server/repositories/heroRepository", () => ({
  findAllHeroSlides: jest.fn(),
  findEnabledHeroSlides: jest.fn(),
  createHeroSlide: jest.fn(),
  updateHeroSlide: jest.fn(),
  deleteHeroSlide: jest.fn(),
}));

describe("Hero Section Admin-to-Public Synchronization", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (requireAdminRole as jest.Mock).mockResolvedValue({ authenticated: true, allowed: true, role: "admin" });
  });

  it("POST /api/admin/hero creates slide in DB and triggers revalidatePath('/')", async () => {
    const mockCreated = {
      id: 1,
      slide_id: "hero-1",
      title: "New Hero Title",
      video_src: "https://example.com/video.mp4",
      is_enabled: true,
    };
    (createHeroSlide as jest.Mock).mockResolvedValue(mockCreated);

    const req = new NextRequest("http://localhost/api/admin/hero", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slide_id: "hero-1",
        title: "New Hero Title",
        video_src: "https://example.com/video.mp4",
      }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json.slide).toEqual(mockCreated);
    expect(createHeroSlide).toHaveBeenCalledWith(
      expect.objectContaining({
        slide_id: "hero-1",
        title: "New Hero Title",
        video_src: "https://example.com/video.mp4",
      })
    );
    expect(revalidatePath).toHaveBeenCalledWith("/");
    expect(revalidatePath).toHaveBeenCalledWith("/admin/homepage/hero");
  });

  it("PATCH /api/admin/hero/[id] updates slide in DB and triggers revalidatePath('/')", async () => {
    const mockUpdated = {
      id: 1,
      slide_id: "hero-1",
      title: "Updated Hero Title",
      video_src: "https://example.com/video.mp4",
      is_enabled: true,
    };
    (updateHeroSlide as jest.Mock).mockResolvedValue(mockUpdated);

    const req = new NextRequest("http://localhost/api/admin/hero/1", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Updated Hero Title",
      }),
    });

    const params = Promise.resolve({ id: "1" });
    const res = await PATCH(req, { params });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.slide).toEqual(mockUpdated);
    expect(updateHeroSlide).toHaveBeenCalledWith(1, expect.objectContaining({ title: "Updated Hero Title" }));
    expect(revalidatePath).toHaveBeenCalledWith("/");
    expect(revalidatePath).toHaveBeenCalledWith("/admin/homepage/hero");
  });

  it("DELETE /api/admin/hero/[id] deletes slide from DB and triggers revalidatePath('/')", async () => {
    (deleteHeroSlide as jest.Mock).mockResolvedValue(true);

    const req = new NextRequest("http://localhost/api/admin/hero/1", {
      method: "DELETE",
    });

    const params = Promise.resolve({ id: "1" });
    const res = await DELETE(req, { params });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(deleteHeroSlide).toHaveBeenCalledWith(1);
    expect(revalidatePath).toHaveBeenCalledWith("/");
    expect(revalidatePath).toHaveBeenCalledWith("/admin/homepage/hero");
  });

  it("Public getPublicHeroSlides reads updated slides from same database source", async () => {
    const mockSlidesFromDB = [
      {
        id: 1,
        slide_id: "hero-updated",
        title: "Updated Hero Title",
        description: "Fresh description",
        video_src: "/media/hero/uuid/video.mp4",
        poster_src: "/media/hero/uuid/poster.jpg",
        cta_label: "Explore",
        cta_link: "/tournaments",
        display_order: 1,
        is_enabled: true,
      },
    ];
    (findEnabledHeroSlides as jest.Mock).mockResolvedValue(mockSlidesFromDB);

    const publicSlides = await getPublicHeroSlides();

    expect(findEnabledHeroSlides).toHaveBeenCalled();
    expect(publicSlides).toEqual([
      {
        id: "hero-updated",
        title: "Updated Hero Title",
        description: "Fresh description",
        videoSrc: "/media/hero/uuid/video.mp4",
        posterSrc: "/media/hero/uuid/poster.jpg",
        ctaLabel: "Explore",
        ctaLink: "/tournaments",
      },
    ]);
  });
});
