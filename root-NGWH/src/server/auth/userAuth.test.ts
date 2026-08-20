import {
  hashPassword,
  verifyPassword,
  createUserToken,
  verifyUserToken,
} from "./userAuth";

describe("userAuth unit tests", () => {
  describe("password hashing & verification", () => {
    it("should correctly hash and verify valid password", () => {
      const password = "SecurePassword123!";
      const hash = hashPassword(password);

      expect(hash).toContain(":");
      expect(verifyPassword(password, hash)).toBe(true);
    });

    it("should reject incorrect password", () => {
      const password = "SecurePassword123!";
      const hash = hashPassword(password);

      expect(verifyPassword("WrongPassword", hash)).toBe(false);
    });

    it("should handle empty or invalid stored hashes gracefully", () => {
      expect(verifyPassword("password", "")).toBe(false);
      expect(verifyPassword("password", "invalid_format")).toBe(false);
    });
  });

  describe("user session token creation & verification", () => {
    const mockUser = {
      id: 42,
      email: "club@example.com",
      role: "club_user",
    };

    it("should create and verify valid user token", () => {
      const token = createUserToken(mockUser);
      expect(typeof token).toBe("string");

      const verified = verifyUserToken(token);
      expect(verified).not.toBeNull();
      expect(verified?.id).toBe(42);
      expect(verified?.email).toBe("club@example.com");
      expect(verified?.role).toBe("club_user");
    });

    it("should reject null, undefined, or empty tokens", () => {
      expect(verifyUserToken(null)).toBeNull();
      expect(verifyUserToken(undefined)).toBeNull();
      expect(verifyUserToken("")).toBeNull();
    });

    it("should reject tampered token signatures", () => {
      const token = createUserToken(mockUser);
      const parts = token.split(":");
      parts[4] = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
      const tamperedToken = parts.join(":");

      expect(verifyUserToken(tamperedToken)).toBeNull();
    });
  });
});
