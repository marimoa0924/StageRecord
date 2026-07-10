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
      // Migrate old ip_address column to visitor_id if it still exists
      await sql`
        DO $$
        BEGIN
          IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'likes' AND column_name = 'ip_address'
          ) THEN
            ALTER TABLE likes RENAME COLUMN ip_address TO visitor_id;
          END IF;
        END $$
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
      // Add is_private column if it doesn't exist
      await sql`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'posts' AND column_name = 'is_private'
          ) THEN
            ALTER TABLE posts ADD COLUMN is_private BOOLEAN NOT NULL DEFAULT FALSE;
          END IF;
        END $$
      `;
      // One-time title renames (idempotent: skip if 3rd word already matches)
      await sql`UPDATE posts SET title = replace(title, ' 수영장의 ', ' 수영장의 사과 ') WHERE split_part(title,' ',2)='수영장의' AND split_part(title,' ',3)!='사과'`;
      await sql`UPDATE posts SET title = replace(title, ' 올랜도 ', ' 올랜도 인 버지니아 ') WHERE split_part(title,' ',2)='올랜도' AND split_part(title,' ',3)!='인'`;
      await sql`UPDATE posts SET title = replace(title, ' 미세스 ', ' 미세스 다웃파이어 ') WHERE split_part(title,' ',2)='미세스' AND split_part(title,' ',3)!='다웃파이어'`;
    })().catch((e) => console.error('[db init]', e))
  : Promise.resolve();
