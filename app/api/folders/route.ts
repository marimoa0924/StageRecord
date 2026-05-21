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
          TRIM(REGEXP_REPLACE(
            REGEXP_REPLACE(title, '^[^ ]+ ', ''),
            ' (?:(?:낮공|밤공|세미막|페어막) )?자[가-힣]+.*$', ''
          )) AS folder_name,
          viewing_count,
          performance_date
        FROM posts
      )
      SELECT
        folder_name,
        COUNT(*)::int           AS post_count,
        MAX(viewing_count)::int AS max_viewing,
        MIN(performance_date)   AS first_date,
        MAX(performance_date)   AS latest_date
      FROM fn
      GROUP BY folder_name
      ORDER BY MAX(performance_date) DESC
    `;

    const chikmuk = rows.filter((r) => (r.post_count as number) === 1);
    const folders = rows.filter((r) => (r.post_count as number) > 1);

    return NextResponse.json({ chikmuk_count: chikmuk.length, folders });
  } catch (e) {
    console.error('[GET /api/folders]', e);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
