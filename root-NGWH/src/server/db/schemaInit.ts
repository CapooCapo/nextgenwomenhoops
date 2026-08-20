import { getDbPool } from "./client";

let schemaEnsured = false;

export async function ensureDatabaseSchema(): Promise<void> {
  if (schemaEnsured) return;
  schemaEnsured = true;

  try {
    const pool = getDbPool();

    // 1. users
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'club_user',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. password_resets
    await pool.query(`
      CREATE TABLE IF NOT EXISTS password_resets (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token_hash VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        used_at TIMESTAMP WITH TIME ZONE
      );
    `);

    // 3. clubs_club
    await pool.query(`
      CREATE TABLE IF NOT EXISTS clubs_club (
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
      );
    `);

    // Ensure columns exist on clubs_club if table already existed
    await pool.query(`
      ALTER TABLE clubs_club
      ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS capability_profile VARCHAR(500),
      ADD COLUMN IF NOT EXISTS u20_athlete_list VARCHAR(500),
      ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE;
    `);

    // 4. players_player
    await pool.query(`
      CREATE TABLE IF NOT EXISTS players_player (
        id SERIAL PRIMARY KEY,
        club_id INTEGER REFERENCES clubs_club(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL
      );
    `);

    // 5. players_coachstaff
    await pool.query(`
      CREATE TABLE IF NOT EXISTS players_coachstaff (
        id SERIAL PRIMARY KEY,
        club_id INTEGER REFERENCES clubs_club(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL
      );
    `);

    // 6. tournaments_tournament
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tournaments_tournament (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL
      );
    `);

    // 7. tournaments_season
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tournaments_season (
        id SERIAL PRIMARY KEY,
        tournament_id INTEGER REFERENCES tournaments_tournament(id) ON DELETE CASCADE,
        year INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 8. matches_match
    await pool.query(`
      CREATE TABLE IF NOT EXISTS matches_match (
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
      );
    `);

    // Ensure columns on matches_match
    await pool.query(`
      ALTER TABLE matches_match
      ADD COLUMN IF NOT EXISTS home_score INTEGER,
      ADD COLUMN IF NOT EXISTS away_score INTEGER,
      ADD COLUMN IF NOT EXISTS home_fouls INTEGER,
      ADD COLUMN IF NOT EXISTS away_fouls INTEGER,
      ADD COLUMN IF NOT EXISTS timer VARCHAR(50),
      ADD COLUMN IF NOT EXISTS period VARCHAR(50);
    `);

    // 9. news_articles
    await pool.query(`
      CREATE TABLE IF NOT EXISTS news_articles (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        summary TEXT,
        content TEXT,
        image_url VARCHAR(500),
        slug VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 10. gallery_items
    await pool.query(`
      CREATE TABLE IF NOT EXISTS gallery_items (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        media_type VARCHAR(50),
        media_url VARCHAR(500),
        caption TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 11. contact_submissions
    await pool.query(`
      CREATE TABLE IF NOT EXISTS contact_submissions (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        subject VARCHAR(255),
        message TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 12. hero_slides
    await pool.query(`
      CREATE TABLE IF NOT EXISTS hero_slides (
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
      );
    `);
  } catch (err) {
    schemaEnsured = false;
    if (process.env.NODE_ENV !== "test") {
      console.error("Failed to initialize database schema:", err);
    }
  }
}
