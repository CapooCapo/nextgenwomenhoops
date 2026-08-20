import crypto from "crypto";
import { getDbPool } from "../db/client";

export interface AdminUserRecord {
  id: number;
  username: string;
  password_hash: string;
  role: "admin" | "subadmin";
  status: "active" | "disabled";
  created_at: Date | string;
  updated_at: Date | string;
}

export function hashAdminPassword(password: string): string {
  const salt = "ngwh_admin_rbac_salt_2026";
  return crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
}

export function verifyAdminPassword(password: string, storedHash: string): boolean {
  try {
    const computed = hashAdminPassword(password);
    const bufA = Buffer.from(computed, "hex");
    const bufB = Buffer.from(storedHash, "hex");
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

export async function findAdminUserByUsername(username: string): Promise<AdminUserRecord | null> {
  const pool = getDbPool();
  const res = await pool.query<AdminUserRecord>(
    `SELECT id, username, password_hash, role, status, created_at, updated_at
     FROM admin_users
     WHERE LOWER(username) = LOWER($1)
     LIMIT 1`,
    [username]
  );
  return res.rows[0] || null;
}

export async function findAdminUserById(id: number): Promise<AdminUserRecord | null> {
  const pool = getDbPool();
  const res = await pool.query<AdminUserRecord>(
    `SELECT id, username, password_hash, role, status, created_at, updated_at
     FROM admin_users
     WHERE id = $1
     LIMIT 1`,
    [id]
  );
  return res.rows[0] || null;
}

export async function findAllAdminUsers(): Promise<Omit<AdminUserRecord, "password_hash">[]> {
  const pool = getDbPool();
  const res = await pool.query<Omit<AdminUserRecord, "password_hash">>(
    `SELECT id, username, role, status, created_at, updated_at
     FROM admin_users
     ORDER BY id ASC`
  );
  return res.rows;
}

export async function createAdminUser(params: {
  username: string;
  password_hash: string;
  role: "admin" | "subadmin";
  status?: "active" | "disabled";
}): Promise<AdminUserRecord> {
  const pool = getDbPool();
  const status = params.status || "active";
  const res = await pool.query<AdminUserRecord>(
    `INSERT INTO admin_users (username, password_hash, role, status)
     VALUES ($1, $2, $3, $4)
     RETURNING id, username, password_hash, role, status, created_at, updated_at`,
    [params.username, params.password_hash, params.role, status]
  );
  return res.rows[0];
}

export async function updateAdminUserStatus(
  id: number,
  status: "active" | "disabled"
): Promise<AdminUserRecord | null> {
  const pool = getDbPool();
  const res = await pool.query<AdminUserRecord>(
    `UPDATE admin_users
     SET status = $1, updated_at = CURRENT_TIMESTAMP
     WHERE id = $2
     RETURNING id, username, password_hash, role, status, created_at, updated_at`,
    [status, id]
  );
  return res.rows[0] || null;
}

export async function deleteAdminUser(id: number): Promise<boolean> {
  const pool = getDbPool();
  const res = await pool.query(`DELETE FROM admin_users WHERE id = $1`, [id]);
  return (res.rowCount || 0) > 0;
}
