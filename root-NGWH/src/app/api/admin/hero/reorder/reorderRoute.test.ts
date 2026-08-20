/**
 * @jest-environment node
 */
import { POST } from "./route";
import { NextRequest } from "next/server";
import { requireAdminRole } from "@/server/auth/adminAuth";
import { reorderHeroSlides } from "@/server/repositories/heroRepository";

jest.mock("@/server/auth/adminAuth");
jest.mock("@/server/repositories/heroRepository");

describe("POST /api/admin/hero/reorder", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 if unauthorized", async () => {
    (requireAdminRole as jest.Mock).mockResolvedValueOnce({ authenticated: false });
    const req = new NextRequest("http://localhost:3000/api/admin/hero/reorder", {
      method: "POST",
      body: JSON.stringify({ orders: [] }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("should reorder slides successfully for authenticated admin", async () => {
    (requireAdminRole as jest.Mock).mockResolvedValueOnce({ authenticated: true, allowed: true });
    (reorderHeroSlides as jest.Mock).mockResolvedValueOnce(true);

    const req = new NextRequest("http://localhost:3000/api/admin/hero/reorder", {
      method: "POST",
      body: JSON.stringify({
        orders: [
          { id: 3, display_order: 1 },
          { id: 1, display_order: 2 },
        ],
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(reorderHeroSlides).toHaveBeenCalledWith([
      { id: 3, display_order: 1 },
      { id: 1, display_order: 2 },
    ]);
  });
});
