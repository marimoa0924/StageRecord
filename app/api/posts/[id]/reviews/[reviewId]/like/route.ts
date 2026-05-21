import { NextRequest, NextResponse } from 'next/server';
import { sql, ready } from '@/lib/db';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; reviewId: string }> },
) {
  try {
    await ready;
    const { reviewId } = await params;
    const vid = req.cookies.get('vid')?.value ?? '0';

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
    console.error('[POST /api/posts/[id]/reviews/[reviewId]/like]', e);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
