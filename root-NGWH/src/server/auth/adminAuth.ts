import crypto from "crypto";
import { cookies } from "next/headers";
import {
  findAdminUserByUsername,
  verifyAdminPassword,
} from "../repositories/adminUsersRepository";

export const ADMIN_COOKIE_NAME = "admin_session";

export type AdminRole = "admin" | "subadmin";

export interface AdminSession {
  authenticated: boolean;
  username: string | null;
  role: AdminRole | null;
}

function getAdminConfig() {
  const isProd = process.env.NODE_ENV === "production";
  const user = process.env.ADMIN_USERNAME || (isProd ? "" : "admin");
  const pass = process.env.ADMIN_PASSWORD || (isProd ? "" : "admin123");
  const secret = process.env.ADMIN_SESSION_SECRET || (isProd ? "" : "nextgen_women_hoops_admin_secret_key_2026");

  if (isProd && (!user || !pass || !secret || user === "admin" || pass === "admin123")) {
    console.error(
      "SECURITY WARNING: Production mode requires ADMIN_USERNAME, ADMIN_PASSWORD, and ADMIN_SESSION_SECRET environment variables to be set to secure non-default values."
    );
  }

  return { user, pass, secret, isProd };
}

export function createAdminToken(username: string, role: AdminRole = "admin"): string {
  const { secret } = getAdminConfig();
  const timestamp = Date.now();
  const data = `${username}:${role}:${timestamp}`;
  const signature = crypto.createHmac("sha256", secret).update(data).digest("hex");
  return `${data}:${signature}`;
}

export function parseAndVerifyAdminToken(token: string | undefined | null): {
  valid: boolean;
  username: string | null;
  role: AdminRole | null;
} {
  if (!token) return { valid: false, username: null, role: null };
  const parts = token.split(":");

  // 4 parts format: username:role:timestamp:signature
  if (parts.length === 4) {
    const [username, roleStr, timestampStr, signature] = parts;
    const { secret } = getAdminConfig();
    const role: AdminRole = roleStr === "subadmin" ? "subadmin" : "admin";

    const timestamp = parseInt(timestampStr, 10);
    if (isNaN(timestamp)) return { valid: false, username: null, role: null };

    // Session valid for 24 hours
    const maxAge = 24 * 60 * 60 * 1000;
    if (Date.now() - timestamp > maxAge) return { valid: false, username: null, role: null };

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${username}:${role}:${timestampStr}`)
      .digest("hex");

    const sigBuf = Buffer.from(signature, "hex");
    const expBuf = Buffer.from(expectedSignature, "hex");

    if (sigBuf.length === 0 || sigBuf.length !== expBuf.length) {
      return { valid: false, username: null, role: null };
    }

    if (crypto.timingSafeEqual(sigBuf, expBuf)) {
      return { valid: true, username, role };
    }
  }

  // Legacy 3 parts format fallback: username:timestamp:signature
  if (parts.length === 3) {
    const [username, timestampStr, signature] = parts;
    const { secret } = getAdminConfig();

    const timestamp = parseInt(timestampStr, 10);
    if (isNaN(timestamp)) return { valid: false, username: null, role: null };

    const maxAge = 24 * 60 * 60 * 1000;
    if (Date.now() - timestamp > maxAge) return { valid: false, username: null, role: null };

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${username}:${timestampStr}`)
      .digest("hex");

    const sigBuf = Buffer.from(signature, "hex");
    const expBuf = Buffer.from(expectedSignature, "hex");

    if (sigBuf.length === 0 || sigBuf.length !== expBuf.length) {
      return { valid: false, username: null, role: null };
    }

    if (crypto.timingSafeEqual(sigBuf, expBuf)) {
      return { valid: true, username, role: "admin" };
    }
  }

  return { valid: false, username: null, role: null };
}

export function verifyAdminToken(token: string | undefined | null): boolean {
  return parseAndVerifyAdminToken(token).valid;
}

export async function authenticateAdminCredentials(
  user: string,
  pass: string
): Promise<{ authenticated: boolean; username: string | null; role: AdminRole | null }> {
  if (!user || !pass) {
    return { authenticated: false, username: null, role: null };
  }

  // 1. Try DB lookup first
  try {
    const dbUser = await findAdminUserByUsername(user);
    if (dbUser && dbUser.status === "active") {
      if (verifyAdminPassword(pass, dbUser.password_hash)) {
        return { authenticated: true, username: dbUser.username, role: dbUser.role };
      }
    }
  } catch (err) {
    if (process.env.NODE_ENV !== "test") {
      console.warn("[AdminAuth] DB auth query failed, falling back to ENV config:", err);
    }
  }

  // 2. Fallback to ENV configuration (Primary Admin)
  const { user: expectedUser, pass: expectedPass } = getAdminConfig();
  if (expectedUser && expectedPass && user === expectedUser && pass === expectedPass) {
    return { authenticated: true, username: expectedUser, role: "admin" };
  }

  return { authenticated: false, username: null, role: null };
}

export async function getAdminSession(): Promise<AdminSession> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    const verified = parseAndVerifyAdminToken(token);
    if (verified.valid && verified.username && verified.role) {
      return { authenticated: true, username: verified.username, role: verified.role };
    }
  } catch {
    // cookies() call might throw outside request context
  }
  return { authenticated: false, username: null, role: null };
}

export async function requireAdminAuth(): Promise<boolean> {
  const session = await getAdminSession();
  return session.authenticated;
}

export async function requireAdminRole(
  ...allowedRoles: AdminRole[]
): Promise<{ authenticated: boolean; username: string | null; role: AdminRole | null; allowed: boolean }> {
  const session = await getAdminSession();
  if (!session.authenticated || !session.role) {
    return { ...session, allowed: false };
  }
  const allowed = allowedRoles.includes(session.role);
  return { ...session, allowed };
}
