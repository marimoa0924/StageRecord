import { NextRequest, NextResponse } from 'next/server';
import { sql, ready } from '@/lib/db';
import { checkRateLimit } from '@/lib/rateLimit';
import { logger } from '@/lib/logger';

const MAX_QUERY_LENGTH = 100;
const RATE_LIMIT = { requests: 30, windowMs: 60_000 }; // 30 req/min per IP

function escapeLike(s: string): string {
  return s.replace(/[\\%_]/g, (c) => `\\${c}`);
}

export async function GET(req: NextRequest) {
  try {
    // Rate limit by client IP (set by Vercel edge — trustworthy server-side)
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown';
    const rl = checkRateLimit(`search:${ip}`, RATE_LIMIT.requests, RATE_LIMIT.windowMs);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(rl.retryAfterMs / 1000)) } },
      );
    }

    await ready;
    const q = req.nextUrl.searchParams.get('q')?.trim() ?? '';
    if (!q) return NextResponse.json([]);
    if (q.length > MAX_QUERY_LENGTH) {
      return NextResponse.json({ error: '검색어가 너무 깁니다.' }, { status: 400 });
    }

    const vid = req.cookies.get('vid')?.value ?? '0';
    const pattern = `%${escapeLike(q)}%`;

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
    logger.error('GET /api/search', e);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
