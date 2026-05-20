import { NextResponse } from 'next/server';
import { sql, ready } from '@/lib/db';

// Each row: title, total_views (sum of viewing_count), post_count, first_date, latest_date
export async function GET() {
  try {
    await ready;
    const rows = await sql`
      SELECT
        title,
        SUM(viewing_count)::int  AS total_views,
        COUNT(*)::int            AS post_count,
        MIN(performance_date)    AS first_date,
        MAX(performance_date)    AS latest_date
      FROM posts
      GROUP BY title
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
