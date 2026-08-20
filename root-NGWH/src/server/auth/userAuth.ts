import crypto from "crypto";
import { cookies } from "next/headers";

export const USER_COOKIE_NAME = "user_session";

function getUserSecret(): string {
  return (
    process.env.USER_SESSION_SECRET ||
    process.env.ADMIN_SESSION_SECRET ||
    "nextgen_women_hoops_user_session_secret_2026"
  );
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString("hex")}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  if (!password || !storedHash) return false;
  const parts = storedHash.split(":");
  if (parts.length !== 2) return false;

  const [salt, expectedHashHex] = parts;
  try {
    const derivedKey = crypto.scryptSync(password, salt, 64);
    const expectedBuf = Buffer.from(expectedHashHex, "hex");

    if (derivedKey.length !== expectedBuf.length) {
      return false;
    }

    return crypto.timingSafeEqual(derivedKey, expectedBuf);
  } catch {
    return false;
  }
}

export function createUserToken(user: {
  id: number;
  email: string;
  role: string;
}): string {
  const secret = getUserSecret();
  const timestamp = Date.now();
  const payload = `${user.id}:${user.email}:${user.role}:${timestamp}`;
  const signature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
  return `${payload}:${signature}`;
}

export function verifyUserToken(
  token: string | undefined | null
): { id: number; email: string; role: string } | null {
  if (!token) return null;
  const parts = token.split(":");
  if (parts.length !== 5) return null;

  const [idStr, email, role, timestampStr, signature] = parts;
  const secret = getUserSecret();

  const id = parseInt(idStr, 10);
  const timestamp = parseInt(timestampStr, 10);

  if (isNaN(id) || isNaN(timestamp)) return null;

  // 7 days session expiration
  const maxAge = 7 * 24 * 60 * 60 * 1000;
  if (Date.now() - timestamp > maxAge) return null;

  const payload = `${idStr}:${email}:${role}:${timestampStr}`;
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  const sigBuf = Buffer.from(signature, "hex");
  const expBuf = Buffer.from(expectedSignature, "hex");

  if (sigBuf.length === 0 || sigBuf.length !== expBuf.length) {
    return null;
  }

  if (!crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }

  return { id, email, role };
}

export async function getUserSession(): Promise<{
  authenticated: boolean;
  user: { id: number; email: string; role: string } | null;
}> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(USER_COOKIE_NAME)?.value;
    const user = verifyUserToken(token);
    if (user) {
      return { authenticated: true, user };
    }
  } catch {
    // cookies() may throw if called outside request context
  }
  return { authenticated: false, user: null };
}

export async function requireUserAuth(): Promise<{
  id: number;
  email: string;
  role: string;
}> {
  const session = await getUserSession();
  if (!session.authenticated || !session.user) {
    throw new Error("Unauthorized");
  }
  return session.user;
}
