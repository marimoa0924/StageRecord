import { neon } from '@neondatabase/serverless';

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
          visitor_id TEXT NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE(post_id, visitor_id)
        )
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS review_likes (
          id         SERIAL PRIMARY KEY,
          review_id  INTEGER NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
          visitor_id TEXT NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE(review_id, visitor_id)
        )
      `;
    })().catch((e) => console.error('[db init]', e))
  : Promise.resolve();
