import { query, queryOne } from "../db/client";
import { ClubRow } from "../db/types";

export interface UserRow {
  id: number;
  email: string;
  password_hash: string;
  role: "club_user" | "admin";
  created_at: string;
  updated_at: string;
}

export interface PasswordResetRow {
  id: number;
  user_id: number;
  token_hash: string;
  expires_at: string;
  used_at: string | null;
}

export async function ensureUserTables(): Promise<void> {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'club_user',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS password_resets (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash VARCHAR(255) NOT NULL,
      expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
      used_at TIMESTAMP WITH TIME ZONE
    );
  `);

  await query(`
    ALTER TABLE clubs_club ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;
  `);
}

export async function createUser(params: {
  email: string;
  passwordHash: string;
  role?: "club_user" | "admin";
}): Promise<UserRow> {
  await ensureUserTables();
  const role = params.role || "club_user";
  const rows = await query<UserRow>(
    `INSERT INTO users (email, password_hash, role)
     VALUES ($1, $2, $3)
     RETURNING id, email, password_hash, role, created_at, updated_at`,
    [params.email.toLowerCase().trim(), params.passwordHash, role]
  );
  return rows[0];
}

export async function findUserByEmail(email: string): Promise<UserRow | null> {
  await ensureUserTables();
  return queryOne<UserRow>(
    `SELECT id, email, password_hash, role, created_at, updated_at
     FROM users
     WHERE LOWER(email) = LOWER($1)`,
    [email.trim()]
  );
}

export async function findUserById(id: number): Promise<UserRow | null> {
  await ensureUserTables();
  return queryOne<UserRow>(
    `SELECT id, email, password_hash, role, created_at, updated_at
     FROM users
     WHERE id = $1`,
    [id]
  );
}

export async function updateUserPassword(
  userId: number,
  passwordHash: string
): Promise<boolean> {
  await ensureUserTables();
  const rows = await query(
    `UPDATE users
     SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
     WHERE id = $2
     RETURNING id`,
    [passwordHash, userId]
  );
  return rows.length > 0;
}

export async function createPasswordResetToken(params: {
  userId: number;
  tokenHash: string;
  expiresAt: Date;
}): Promise<PasswordResetRow> {
  await ensureUserTables();
  const rows = await query<PasswordResetRow>(
    `INSERT INTO password_resets (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)
     RETURNING id, user_id, token_hash, expires_at, used_at`,
    [params.userId, params.tokenHash, params.expiresAt.toISOString()]
  );
  return rows[0];
}

export async function findValidPasswordResetToken(
  tokenHash: string
): Promise<PasswordResetRow | null> {
  await ensureUserTables();
  return queryOne<PasswordResetRow>(
    `SELECT id, user_id, token_hash, expires_at, used_at
     FROM password_resets
     WHERE token_hash = $1 AND used_at IS NULL AND expires_at > CURRENT_TIMESTAMP`,
    [tokenHash]
  );
}

export async function markPasswordResetTokenUsed(
  tokenId: number
): Promise<void> {
  await ensureUserTables();
  await query(
    `UPDATE password_resets
     SET used_at = CURRENT_TIMESTAMP
     WHERE id = $1`,
    [tokenId]
  );
}

export async function findClubByUserId(
  userId: number
): Promise<ClubRow | null> {
  await ensureUserTables();
  return queryOne<ClubRow>(
    `SELECT id, name, logo, founding_year, achievements, province_region, contact_info, social_links, is_approved, representative_name, capability_profile, u20_athlete_list
     FROM clubs_club
     WHERE user_id = $1`,
    [userId]
  );
}

export async function associateClubWithUser(
  clubId: number,
  userId: number
): Promise<void> {
  await ensureUserTables();
  await query(
    `UPDATE clubs_club
     SET user_id = $1
     WHERE id = $2`,
    [userId, clubId]
  );
}
