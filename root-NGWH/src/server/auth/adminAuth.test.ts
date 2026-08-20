import {
  createAdminToken,
  verifyAdminToken,
  authenticateAdminCredentials,
} from "./adminAuth";

describe("adminAuth", () => {
  it("should authenticate correct credentials", () => {
    expect(authenticateAdminCredentials("admin", "admin123")).toBe(true);
    expect(authenticateAdminCredentials("admin", "wrong")).toBe(false);
    expect(authenticateAdminCredentials("wrong", "admin123")).toBe(false);
  });

  it("should create and verify valid admin token", () => {
    const token = createAdminToken("admin");
    expect(token).toBeDefined();
    expect(verifyAdminToken(token)).toBe(true);
  });

  it("should reject tampered or invalid tokens", () => {
    expect(verifyAdminToken(null)).toBe(false);
    expect(verifyAdminToken("invalid-token")).toBe(false);
    expect(verifyAdminToken("admin:12345:tampered_signature")).toBe(false);
  });

  it("should reject credentials in production if env is missing", () => {
    const originalEnv = process.env.NODE_ENV;
    (process.env as Record<string, string | undefined>).NODE_ENV = "production";
    expect(authenticateAdminCredentials("admin", "admin123")).toBe(false);
    (process.env as Record<string, string | undefined>).NODE_ENV = originalEnv;
  });
});
