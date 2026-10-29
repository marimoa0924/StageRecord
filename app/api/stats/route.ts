import { logger } from '@/lib/logger';
import { NextResponse } from 'next/server';
import { sql, ready } from '@/lib/db';

// 후기 기록 전체를 바탕으로 한 결산 통계 (공개 — 읽기 전용)
export async function GET() {
  try {
    await ready;

    const [totals] = await sql`
      SELECT COUNT(*)::int                       AS total_shows,
             COUNT(DISTINCT show_name(title))::int AS total_works,
             MIN(performance_date)               AS first_date,
             MAX(performance_date)               AS latest_date
      FROM posts
    `;

    const topShows = await sql`
      SELECT show_name(title) AS name, COUNT(*)::int AS count
      FROM posts GROUP BY 1 ORDER BY count DESC, name LIMIT 5
    `;

    const byMonth = await sql`
      SELECT substring(performance_date, 1, 7) AS month, COUNT(*)::int AS count
      FROM posts GROUP BY 1 ORDER BY 1
    `;

    const [price] = await sql`
      SELECT COUNT(price)::int           AS priced,
             COALESCE(SUM(price), 0)::int AS total,
             COALESCE(AVG(price), 0)::int AS avg,
             MAX(price)::int             AS max
      FROM posts
    `;
    const [maxPriceShow] =
      price.max != null
        ? await sql`SELECT title FROM posts WHERE price = ${price.max} ORDER BY performance_date DESC LIMIT 1`
        : [undefined];

    const topActors = await sql`
      SELECT a AS name, COUNT(*)::int AS count
      FROM posts, jsonb_array_elements_text(actors::jsonb) AS a
      GROUP BY a ORDER BY count DESC, name LIMIT 8
    `;

    const [{ total_reviews }] = await sql`SELECT COUNT(*)::int AS total_reviews FROM reviews`;

    return NextResponse.json({
      total_shows: totals.total_shows,
      total_works: totals.total_works,
      first_date: totals.first_date,
      latest_date: totals.latest_date,
      top_shows: topShows,
      by_month: byMonth,
      price: { ...price, max_title: maxPriceShow?.title ?? null },
      top_actors: topActors,
      total_reviews,
    });
  } catch (e) {
    logger.error('[GET /api/stats]', e);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
