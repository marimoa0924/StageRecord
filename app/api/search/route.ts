import { NextRequest, NextResponse } from 'next/server';
import { sql, ready } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    await ready;
    const q = req.nextUrl.searchParams.get('q')?.trim() ?? '';
    if (!q) return NextResponse.json([]);

    const vid = req.cookies.get('vid')?.value ??
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? '0';
    const pattern = `%${q}%`;

    // Step 1: get matching posts (DISTINCT avoids duplicates from the review join)
    const posts = await sql`
      SELECT DISTINCT p.*,
        (SELECT COUNT(*)::int FROM reviews WHERE post_id = p.id) AS review_count,
        (SELECT COUNT(*)::int FROM likes   WHERE post_id = p.id) AS like_count,
        (SELECT COUNT(*)::int FROM likes   WHERE post_id = p.id
                                            AND visitor_id = ${vid}) AS liked_by_me
      FROM posts p
      LEFT JOIN reviews r ON r.post_id = p.id
      WHERE p.title   ILIKE ${pattern}
         OR r.content ILIKE ${pattern}
      ORDER BY p.created_at DESC
    `;

    if (posts.length === 0) return NextResponse.json([]);

    // Step 2: get all reviews whose content matches, then join in JS
    const matchingReviews = await sql`
      SELECT id, post_id, content, created_at
      FROM reviews
      WHERE content ILIKE ${pattern}
      ORDER BY post_id, created_at
    `;

    const reviewsByPost = new Map<number, typeof matchingReviews>();
    for (const r of matchingReviews) {
      const pid = r.post_id as number;
      if (!reviewsByPost.has(pid)) reviewsByPost.set(pid, []);
      reviewsByPost.get(pid)!.push(r);
    }

    const result = posts.map((p) => ({
      ...p,
      matching_reviews: reviewsByPost.get(p.id as number) ?? [],
    }));

    return NextResponse.json(result);
  } catch (e) {
    console.error('[GET /api/search]', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
