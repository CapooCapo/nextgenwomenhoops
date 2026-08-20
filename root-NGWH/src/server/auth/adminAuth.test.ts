import {
  createAdminToken,
  verifyAdminToken,
  authenticateAdminCredentials,
} from "./adminAuth";

describe("adminAuth", () => {
  it("should authenticate correct credentials", async () => {
    const res1 = await authenticateAdminCredentials("admin", "admin123");
    expect(res1.authenticated).toBe(true);
    expect(res1.role).toBe("admin");

    const res2 = await authenticateAdminCredentials("admin", "wrong");
    expect(res2.authenticated).toBe(false);

    const res3 = await authenticateAdminCredentials("wrong", "admin123");
    expect(res3.authenticated).toBe(false);
  });

  it("should create and verify valid admin token", () => {
    const token = createAdminToken("admin", "admin");
    expect(token).toBeDefined();
    expect(verifyAdminToken(token)).toBe(true);
  });

  it("should reject tampered or invalid tokens", () => {
    expect(verifyAdminToken(null)).toBe(false);
    expect(verifyAdminToken("invalid-token")).toBe(false);
    expect(verifyAdminToken("admin:admin:12345:tampered_signature")).toBe(false);
  });

  it("should reject credentials in production if env is missing", async () => {
    const originalEnv = process.env.NODE_ENV;
    (process.env as Record<string, string | undefined>).NODE_ENV = "production";
    const res = await authenticateAdminCredentials("admin", "admin123");
    expect(res.authenticated).toBe(false);
    (process.env as Record<string, string | undefined>).NODE_ENV = originalEnv;
  });
});
