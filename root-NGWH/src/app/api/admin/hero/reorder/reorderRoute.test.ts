/**
 * @jest-environment node
 */
import { POST } from "./route";
import { requireAdminRole } from "@/server/auth/adminAuth";

jest.mock("@/server/auth/adminAuth");

describe("POST /api/admin/hero/reorder", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 if unauthorized", async () => {
    (requireAdminRole as jest.Mock).mockResolvedValueOnce({ authenticated: false });
    const res = await POST();
    expect(res.status).toBe(401);
  });

  it("should return 405 Method Not Allowed as Hero is static", async () => {
    (requireAdminRole as jest.Mock).mockResolvedValueOnce({ authenticated: true, allowed: true });
    const res = await POST();
    expect(res.status).toBe(405);
    const data = await res.json();
    expect(data.error).toContain("Hero section is static");
  });
});
