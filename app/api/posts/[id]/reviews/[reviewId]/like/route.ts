import { NextRequest, NextResponse } from 'next/server';
import { sql, ready } from '@/lib/db';
import { checkRateLimit } from '@/lib/rateLimit';
import { logger } from '@/lib/logger';

const RATE_LIMIT = { requests: 20, windowMs: 60_000 }; // 20 toggles/min per visitor

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; reviewId: string }> },
) {
  try {
    const vid = req.cookies.get('vid')?.value ?? '0';

    const rl = checkRateLimit(`rlikes:${vid}`, RATE_LIMIT.requests, RATE_LIMIT.windowMs);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(rl.retryAfterMs / 1000)) } },
      );
    }

    await ready;
    const { reviewId } = await params;

    const [existing] = await sql`
      SELECT id FROM review_likes WHERE review_id = ${reviewId} AND visitor_id = ${vid}
    `;

    if (existing) {
      await sql`DELETE FROM review_likes WHERE review_id = ${reviewId} AND visitor_id = ${vid}`;
      const [{ count }] = await sql`SELECT COUNT(*)::int AS count FROM review_likes WHERE review_id = ${reviewId}`;
      return NextResponse.json({ liked: false, count: Number(count) });
    } else {
      await sql`INSERT INTO review_likes (review_id, visitor_id) VALUES (${reviewId}, ${vid})`;
      const [{ count }] = await sql`SELECT COUNT(*)::int AS count FROM review_likes WHERE review_id = ${reviewId}`;
      return NextResponse.json({ liked: true, count: Number(count) });
    }
  } catch (e) {
    logger.error('POST /api/posts/[id]/reviews/[reviewId]/like', e);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
