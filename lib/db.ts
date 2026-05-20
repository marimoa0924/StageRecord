import { neon } from '@neondatabase/serverless';

// Vercel Neon integration sets DATABASE_URL; some setups use POSTGRES_URL
const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL;

export const sql = DATABASE_URL ? neon(DATABASE_URL) : (null as never);

export const ready: Promise<void> = DATABASE_URL
  ? (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS posts (
          id               SERIAL PRIMARY KEY,
          title            TEXT NOT NULL,
          performance_date TEXT NOT NULL,
          viewing_count    INTEGER NOT NULL DEFAULT 1,
          casting_board    TEXT,
          created_at       TIMESTAMPTZ DEFAULT NOW()
        )
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS reviews (
          id         SERIAL PRIMARY KEY,
          post_id    INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
          content    TEXT NOT NULL DEFAULT '',
          images     TEXT NOT NULL DEFAULT '[]',
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS likes (
          id         SERIAL PRIMARY KEY,
          post_id    INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
          ip_address TEXT NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE(post_id, ip_address)
        )
      `;
    })().catch((e) => console.error('[db init]', e))
  : Promise.resolve();
