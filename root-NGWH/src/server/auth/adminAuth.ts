import crypto from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE_NAME = "admin_session";

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

export function createAdminToken(username: string): string {
  const { secret } = getAdminConfig();
  const timestamp = Date.now();
  const data = `${username}:${timestamp}`;
  const signature = crypto.createHmac("sha256", secret).update(data).digest("hex");
  return `${data}:${signature}`;
}

export function verifyAdminToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const parts = token.split(":");
  if (parts.length !== 3) return false;

  const [username, timestampStr, signature] = parts;
  const { user: adminUser, secret } = getAdminConfig();

  if (!adminUser || username !== adminUser) return false;

  const timestamp = parseInt(timestampStr, 10);
  if (isNaN(timestamp)) return false;

  // Session valid for 24 hours
  const maxAge = 24 * 60 * 60 * 1000;
  if (Date.now() - timestamp > maxAge) return false;

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(`${username}:${timestampStr}`)
    .digest("hex");

  const sigBuf = Buffer.from(signature, "hex");
  const expBuf = Buffer.from(expectedSignature, "hex");

  if (sigBuf.length === 0 || sigBuf.length !== expBuf.length) {
    return false;
  }

  return crypto.timingSafeEqual(sigBuf, expBuf);
}

export function authenticateAdminCredentials(user: string, pass: string): boolean {
  if (!user || !pass) return false;
  const { user: expectedUser, pass: expectedPass } = getAdminConfig();
  if (!expectedUser || !expectedPass) return false;
  return user === expectedUser && pass === expectedPass;
}

export async function getAdminSession(): Promise<{ authenticated: boolean; username: string | null }> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    if (token && verifyAdminToken(token)) {
      const username = token.split(":")[0];
      return { authenticated: true, username };
    }
  } catch {
    // cookies() call might throw outside request context
  }
  return { authenticated: false, username: null };
}

export async function requireAdminAuth(): Promise<boolean> {
  const session = await getAdminSession();
  return session.authenticated;
}
