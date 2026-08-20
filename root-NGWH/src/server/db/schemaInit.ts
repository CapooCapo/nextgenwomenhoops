import { getDbPool } from "./client";

let schemaEnsured = false;

async function safeQuery(sql: string, description: string): Promise<void> {
  try {
    const pool = getDbPool();
    await pool.query(sql);
  } catch (err) {
    if (process.env.NODE_ENV !== "test") {
      console.error(`[DB SchemaInit] Failed for ${description}:`, err);
    }
  }
}

export async function ensureDatabaseSchema(): Promise<void> {
  if (schemaEnsured) return;
  schemaEnsured = true;

  // 1. users
  await safeQuery(
    `CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'club_user',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );`,
    "users table"
  );

  // 2. password_resets
  await safeQuery(
    `CREATE TABLE IF NOT EXISTS password_resets (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash VARCHAR(255) NOT NULL,
      expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
      used_at TIMESTAMP WITH TIME ZONE
    );`,
    "password_resets table"
  );

  // 3. clubs_club
  await safeQuery(
    `CREATE TABLE IF NOT EXISTS clubs_club (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      province_region VARCHAR(255) NOT NULL,
      representative_name VARCHAR(255) NOT NULL,
      logo VARCHAR(500),
      capability_profile VARCHAR(500),
      u20_athlete_list VARCHAR(500),
      founding_year INTEGER,
      achievements TEXT,
      contact_info TEXT,
      social_links TEXT,
      is_approved BOOLEAN DEFAULT FALSE,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );`,
    "clubs_club table"
  );

  await safeQuery(
    `ALTER TABLE clubs_club ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;`,
    "clubs_club.user_id"
  );
  await safeQuery(
    `ALTER TABLE clubs_club ADD COLUMN IF NOT EXISTS capability_profile VARCHAR(500);`,
    "clubs_club.capability_profile"
  );
  await safeQuery(
    `ALTER TABLE clubs_club ADD COLUMN IF NOT EXISTS u20_athlete_list VARCHAR(500);`,
    "clubs_club.u20_athlete_list"
  );
  await safeQuery(
    `ALTER TABLE clubs_club ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE;`,
    "clubs_club.is_approved"
  );

  // 4. players_player
  await safeQuery(
    `CREATE TABLE IF NOT EXISTS players_player (
      id SERIAL PRIMARY KEY,
      club_id INTEGER REFERENCES clubs_club(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      jersey_number VARCHAR(50),
      position VARCHAR(100),
      date_of_birth VARCHAR(50)
    );`,
    "players_player table"
  );
  await safeQuery(
    `ALTER TABLE players_player ADD COLUMN IF NOT EXISTS jersey_number VARCHAR(50);`,
    "players_player.jersey_number"
  );
  await safeQuery(
    `ALTER TABLE players_player ADD COLUMN IF NOT EXISTS position VARCHAR(100);`,
    "players_player.position"
  );
  await safeQuery(
    `ALTER TABLE players_player ADD COLUMN IF NOT EXISTS date_of_birth VARCHAR(50);`,
    "players_player.date_of_birth"
  );

  // 5. players_coachstaff
  await safeQuery(
    `CREATE TABLE IF NOT EXISTS players_coachstaff (
      id SERIAL PRIMARY KEY,
      club_id INTEGER REFERENCES clubs_club(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      role VARCHAR(100),
      description TEXT
    );`,
    "players_coachstaff table"
  );
  await safeQuery(
    `ALTER TABLE players_coachstaff ADD COLUMN IF NOT EXISTS role VARCHAR(100);`,
    "players_coachstaff.role"
  );
  await safeQuery(
    `ALTER TABLE players_coachstaff ADD COLUMN IF NOT EXISTS description TEXT;`,
    "players_coachstaff.description"
  );

  // 6. tournaments_tournament
  await safeQuery(
    `CREATE TABLE IF NOT EXISTS tournaments_tournament (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL
    );`,
    "tournaments_tournament table"
  );

  // 7. tournaments_season
  await safeQuery(
    `CREATE TABLE IF NOT EXISTS tournaments_season (
      id SERIAL PRIMARY KEY,
      tournament_id INTEGER REFERENCES tournaments_tournament(id) ON DELETE CASCADE,
      year INTEGER NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );`,
    "tournaments_season table"
  );

  // 8. matches_match
  await safeQuery(
    `CREATE TABLE IF NOT EXISTS matches_match (
      id SERIAL PRIMARY KEY,
      season_id INTEGER REFERENCES tournaments_season(id) ON DELETE SET NULL,
      home_club_id INTEGER REFERENCES clubs_club(id) ON DELETE CASCADE,
      away_club_id INTEGER REFERENCES clubs_club(id) ON DELETE CASCADE,
      scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
      venue VARCHAR(255),
      status VARCHAR(50) NOT NULL DEFAULT 'scheduled',
      home_score INTEGER,
      away_score INTEGER,
      home_fouls INTEGER,
      away_fouls INTEGER,
      timer VARCHAR(50),
      period VARCHAR(50)
    );`,
    "matches_match table"
  );

  await safeQuery(
    `ALTER TABLE matches_match ADD COLUMN IF NOT EXISTS home_score INTEGER;`,
    "matches_match.home_score"
  );
  await safeQuery(
    `ALTER TABLE matches_match ADD COLUMN IF NOT EXISTS away_score INTEGER;`,
    "matches_match.away_score"
  );
  await safeQuery(
    `ALTER TABLE matches_match ADD COLUMN IF NOT EXISTS home_fouls INTEGER;`,
    "matches_match.home_fouls"
  );
  await safeQuery(
    `ALTER TABLE matches_match ADD COLUMN IF NOT EXISTS away_fouls INTEGER;`,
    "matches_match.away_fouls"
  );
  await safeQuery(
    `ALTER TABLE matches_match ADD COLUMN IF NOT EXISTS timer VARCHAR(50);`,
    "matches_match.timer"
  );
  await safeQuery(
    `ALTER TABLE matches_match ADD COLUMN IF NOT EXISTS period VARCHAR(50);`,
    "matches_match.period"
  );

  // 9. news_articles
  await safeQuery(
    `CREATE TABLE IF NOT EXISTS news_articles (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      category VARCHAR(100),
      summary TEXT,
      content TEXT,
      image_url VARCHAR(500),
      slug VARCHAR(255),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );`,
    "news_articles table"
  );

  // 10. gallery_items
  await safeQuery(
    `CREATE TABLE IF NOT EXISTS gallery_items (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      category VARCHAR(100),
      media_type VARCHAR(50),
      media_url VARCHAR(500),
      caption TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );`,
    "gallery_items table"
  );

  // 11. contact_submissions
  await safeQuery(
    `CREATE TABLE IF NOT EXISTS contact_submissions (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      subject VARCHAR(255),
      message TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );`,
    "contact_submissions table"
  );

  // 12. hero_slides
  await safeQuery(
    `CREATE TABLE IF NOT EXISTS hero_slides (
      id SERIAL PRIMARY KEY,
      slide_id VARCHAR(100) UNIQUE NOT NULL,
      title VARCHAR(255),
      description TEXT,
      video_src VARCHAR(500),
      poster_src VARCHAR(500),
      cta_label VARCHAR(100),
      cta_link VARCHAR(500),
      display_order INTEGER DEFAULT 0,
      is_enabled BOOLEAN DEFAULT TRUE
    );`,
    "hero_slides table"
  );

  // 13. admin_users
  await safeQuery(
    `CREATE TABLE IF NOT EXISTS admin_users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(100) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'subadmin',
      status VARCHAR(50) NOT NULL DEFAULT 'active',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );`,
    "admin_users table"
  );

  // Migration: ensure u20_athlete_list is TEXT to support JSON arrays of up to 12 images
  await safeQuery(
    `ALTER TABLE clubs_club ALTER COLUMN u20_athlete_list TYPE TEXT;`,
    "clubs_club.u20_athlete_list to TEXT"
  );

  // 14. PostgreSQL NOTIFY trigger for real-time match updates
  await safeQuery(
    `CREATE OR REPLACE FUNCTION notify_match_change() RETURNS trigger AS $$
    BEGIN
      PERFORM pg_notify('match_updates', json_build_object(
        'operation', TG_OP,
        'id', COALESCE(NEW.id, OLD.id)
      )::text);
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;`,
    "notify_match_change procedure"
  );

  await safeQuery(
    `DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'trg_matches_match_notify'
      ) THEN
        CREATE TRIGGER trg_matches_match_notify
        AFTER INSERT OR UPDATE OR DELETE ON matches_match
        FOR EACH ROW EXECUTE FUNCTION notify_match_change();
      END IF;
    END $$;`,
    "trg_matches_match_notify trigger"
  );

  // 15. Admin Bootstrap (One-time Superadmin Initialization)
  await bootstrapAdminUser();
}

async function bootstrapAdminUser(): Promise<void> {
  const bootstrapUsername = process.env.ADMIN_BOOTSTRAP?.trim();
  const bootstrapPassword = process.env.ADMIN_BOOTSTRAP_PASSWORD;

  if (!bootstrapUsername || !bootstrapPassword) {
    return;
  }

  try {
    const pool = getDbPool();
    const checkRes = await pool.query(
      `SELECT id FROM admin_users WHERE LOWER(username) = LOWER($1) LIMIT 1`,
      [bootstrapUsername]
    );

    if ((checkRes.rowCount ?? 0) > 0) {
      if (process.env.NODE_ENV !== "test") {
        console.log("[DB SchemaInit] Admin bootstrap skipped: account already exists.");
      }
      return;
    }

    const { hashAdminPassword } = await import("../repositories/adminUsersRepository");
    const passwordHash = hashAdminPassword(bootstrapPassword);

    await pool.query(
      `INSERT INTO admin_users (username, password_hash, role, status)
       VALUES ($1, $2, 'admin', 'active')`,
      [bootstrapUsername, passwordHash]
    );

    if (process.env.NODE_ENV !== "test") {
      console.log("[DB SchemaInit] Admin bootstrap completed successfully.");
    }
  } catch (err) {
    if (process.env.NODE_ENV !== "test") {
      console.error("[DB SchemaInit] Admin bootstrap failed:", err instanceof Error ? err.message : err);
    }
  }
}
