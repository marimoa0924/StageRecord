import { NextRequest, NextResponse } from 'next/server';
import { sql, ready } from '@/lib/db';
import { requireOwner } from '@/lib/requireOwner';

function getVid(req: NextRequest): string {
  return (
    req.cookies.get('vid')?.value ||
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    '0'
  );
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await ready;
    const { id } = await params;
    const vid = getVid(req);

    const reviews = await sql`
      SELECT
        r.*,
        COUNT(DISTINCT rl.id)::int AS like_count,
        MAX(CASE WHEN rl.visitor_id = ${vid} THEN 1 ELSE 0 END) AS liked_by_me
      FROM reviews r
      LEFT JOIN review_likes rl ON rl.review_id = r.id
      WHERE r.post_id = ${id}
      GROUP BY r.id
      ORDER BY r.created_at ASC
    `;
    return NextResponse.json(reviews);
  } catch (e) {
    console.error('[GET /api/posts/[id]/reviews]', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const check = await requireOwner();
    if ('error' in check) return check.error;

    await ready;
    const { id } = await params;
    const { content, images } = await req.json();

    const imageList: string[] = Array.isArray(images) ? images : [];
    if (!content?.trim() && imageList.length === 0) {
      return NextResponse.json({ error: '내용이나 이미지를 추가해주세요.' }, { status: 400 });
    }

    const [review] = await sql`
      INSERT INTO reviews (post_id, content, images)
      VALUES (${id}, ${content?.trim() ?? ''}, ${JSON.stringify(imageList)})
      RETURNING *
    `;
    return NextResponse.json(review, { status: 201 });
  } catch (e) {
    console.error('[POST /api/posts/[id]/reviews]', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const check = await requireOwner();
    if ('error' in check) return check.error;

    await ready;
    const { id } = await params;
    const { reviewId } = await req.json();
    await sql`DELETE FROM reviews WHERE id = ${reviewId} AND post_id = ${id}`;
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[DELETE /api/posts/[id]/reviews]', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
