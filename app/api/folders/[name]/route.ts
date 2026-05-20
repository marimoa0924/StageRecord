import { NextRequest, NextResponse } from 'next/server';
import { sql, ready } from '@/lib/db';

const CHIKMUK = '찍먹극';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ name: string }> },
) {
  try {
    await ready;
    const { name } = await params;
    const title = decodeURIComponent(name);

    const vid = req.cookies.get('vid')?.value ??
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? '0';

    let posts;
    if (title === CHIKMUK) {
      posts = await sql`
        SELECT p.*,
          (SELECT COUNT(*)::int FROM reviews WHERE post_id = p.id) AS review_count,
          (SELECT COUNT(*)::int FROM likes   WHERE post_id = p.id) AS like_count,
          (SELECT COUNT(*)::int FROM likes   WHERE post_id = p.id
                                              AND visitor_id = ${vid}) AS liked_by_me
        FROM posts p
        WHERE COALESCE(NULLIF(SPLIT_PART(p.title, ' ', 2), ''), p.title) IN (
          SELECT COALESCE(NULLIF(SPLIT_PART(title, ' ', 2), ''), title)
          FROM posts
          GROUP BY COALESCE(NULLIF(SPLIT_PART(title, ' ', 2), ''), title)
          HAVING SUM(viewing_count) = 1
        )
        ORDER BY p.performance_date ASC
      `;
    } else {
      posts = await sql`
        SELECT p.*,
          (SELECT COUNT(*)::int FROM reviews WHERE post_id = p.id) AS review_count,
          (SELECT COUNT(*)::int FROM likes   WHERE post_id = p.id) AS like_count,
          (SELECT COUNT(*)::int FROM likes   WHERE post_id = p.id
                                              AND visitor_id = ${vid}) AS liked_by_me
        FROM posts p
        WHERE COALESCE(NULLIF(SPLIT_PART(p.title, ' ', 2), ''), p.title) = ${title}
        ORDER BY p.performance_date ASC
      `;
    }

    return NextResponse.json(posts);
  } catch (e) {
    console.error('[GET /api/folders/[name]]', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
