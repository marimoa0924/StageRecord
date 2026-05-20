import { NextResponse } from 'next/server';
import { sql, ready } from '@/lib/db';

// Extract the real show name: 2nd space-delimited word of the title
// e.g. "0824 차미 자아홉 자막" → "차미"
// Falls back to full title if there's no space.
export async function GET() {
  try {
    await ready;
    const rows = await sql`
      SELECT
        COALESCE(NULLIF(SPLIT_PART(title, ' ', 2), ''), title) AS folder_name,
        SUM(viewing_count)::int  AS total_views,
        COUNT(*)::int            AS post_count,
        MIN(performance_date)    AS first_date,
        MAX(performance_date)    AS latest_date
      FROM posts
      GROUP BY COALESCE(NULLIF(SPLIT_PART(title, ' ', 2), ''), title)
      ORDER BY MAX(performance_date) DESC
    `;

    const chikmuk = rows.filter((r) => (r.total_views as number) === 1);
    const folders = rows.filter((r) => (r.total_views as number) > 1);

    return NextResponse.json({ chikmuk_count: chikmuk.length, folders });
  } catch (e) {
    console.error('[GET /api/folders]', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
