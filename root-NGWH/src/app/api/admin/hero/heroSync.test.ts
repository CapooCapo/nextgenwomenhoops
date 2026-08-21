/**
 * @jest-environment node
 */
import { GET, POST } from "./route";
import { PATCH, DELETE } from "./[id]/route";
import { requireAdminRole } from "@/server/auth/adminAuth";
import { getPublicHeroSlides } from "@/server/services/heroServerService";
import { HERO_VIDEO_SLIDES } from "@/config/heroSlides";

jest.mock("@/server/auth/adminAuth", () => ({
  requireAdminRole: jest.fn(),
}));

describe("Static Hero Architecture & API Endpoints Protection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (requireAdminRole as jest.Mock).mockResolvedValue({ authenticated: true, allowed: true, role: "admin" });
  });

  it("1. Public getPublicHeroSlides reads from static HERO_VIDEO_SLIDES configuration", async () => {
    const slides = await getPublicHeroSlides();
    expect(slides).toEqual(HERO_VIDEO_SLIDES);
    expect(slides.length).toBeGreaterThan(0);
  });

  it("2. Hero image & video static paths resolve correctly in configuration", async () => {
    const slides = await getPublicHeroSlides();
    const posterSlide = slides.find((s) => s.posterSrc?.startsWith("/assets/hero/"));
    expect(posterSlide).toBeDefined();
    expect(posterSlide?.posterSrc).toBe("/assets/hero/hero-poster.png");
  });

  it("3. GET /api/admin/hero returns static slides configuration for admin", async () => {
    const res = await GET();
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.slides).toEqual(HERO_VIDEO_SLIDES);
  });

  it("4. POST /api/admin/hero returns 405 Method Not Allowed", async () => {
    const res = await POST();
    const json = await res.json();
    expect(res.status).toBe(405);
    expect(json.error).toBe("Hero section is static and managed via source code.");
  });

  it("5. PATCH /api/admin/hero/[id] returns 405 Method Not Allowed", async () => {
    const res = await PATCH();
    const json = await res.json();
    expect(res.status).toBe(405);
    expect(json.error).toBe("Hero section is static and managed via source code.");
  });

  it("6. DELETE /api/admin/hero/[id] returns 405 Method Not Allowed", async () => {
    const res = await DELETE();
    const json = await res.json();
    expect(res.status).toBe(405);
    expect(json.error).toBe("Hero section is static and managed via source code.");
  });

  it("7. Unauthenticated mutation calls return 401 Unauthorized", async () => {
    (requireAdminRole as jest.Mock).mockResolvedValueOnce({ authenticated: false });
    const res = await POST();
    expect(res.status).toBe(401);
  });
});
