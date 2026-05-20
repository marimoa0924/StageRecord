import { NextRequest, NextResponse } from 'next/server';
import { sql, ready } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    await ready;
    const q = req.nextUrl.searchParams.get('q')?.trim() ?? '';
    if (!q) return NextResponse.json([]);

    const vid = req.cookies.get('vid')?.value ?? req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? '0';
    const pattern = `%${q}%`;

    const posts = await sql`
      SELECT DISTINCT
        p.*,
        (SELECT COUNT(*)::int FROM reviews WHERE post_id = p.id)             AS review_count,
        (SELECT COUNT(*)::int FROM likes   WHERE post_id = p.id)             AS like_count,
        (SELECT COUNT(*)::int FROM likes   WHERE post_id = p.id
                                            AND visitor_id = ${vid})::int    AS liked_by_me
      FROM posts p
      LEFT JOIN reviews r ON r.post_id = p.id
      WHERE p.title    ILIKE ${pattern}
         OR r.content  ILIKE ${pattern}
      ORDER BY p.created_at DESC
    `;
    return NextResponse.json(posts);
  } catch (e) {
    console.error('[GET /api/search]', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
