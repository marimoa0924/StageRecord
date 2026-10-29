import { logger } from '@/lib/logger';
import { NextResponse } from 'next/server';
import { sql, ready } from '@/lib/db';

// Show name = strip leading date word, then strip optional performance-type word
// (낮공|밤공|세미막|페어막) and the Korean ordinal suffix (자[가-힣]+...)
// "0705 차미 낮공 자넷" → "차미"
// "0824 수영장의 사과 자일곱 자막" → "수영장의 사과"
export async function GET() {
  try {
    await ready;
    const rows = await sql`
      WITH fn AS (
        SELECT
          show_name(title) AS folder_name,
          viewing_count,
          performance_date
        FROM posts
      )
      SELECT
        fn.folder_name,
        COUNT(*)::int           AS post_count,
        MAX(fn.viewing_count)::int AS max_viewing,
        MIN(fn.performance_date)   AS first_date,
        MAX(fn.performance_date)   AS latest_date,
        MAX(fe.emoji)           AS emoji
      FROM fn
      LEFT JOIN folder_emojis fe ON fe.name = fn.folder_name
      GROUP BY fn.folder_name
      ORDER BY MAX(fn.performance_date) DESC
    `;

    const chikmuk = rows.filter((r) => (r.post_count as number) === 1);
    const folders = rows.filter((r) => (r.post_count as number) > 1);

    return NextResponse.json({ chikmuk_count: chikmuk.length, folders });
  } catch (e) {
    logger.error('[GET /api/folders]', e);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
