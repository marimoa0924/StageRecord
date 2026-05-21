import { NextRequest, NextResponse } from 'next/server';
import { sql, ready } from '@/lib/db';
import { requireOwner } from '@/lib/requireOwner';
import { auth } from '@/auth';

export async function GET(req: NextRequest) {
  try {
    await ready;
    const session = await auth();
    const likeId = session?.user?.email ?? '__no_match__';

    const posts = await sql`
      SELECT
        p.*,
        COUNT(DISTINCT r.id)::int   AS review_count,
        COUNT(DISTINCT l.id)::int   AS like_count,
        MAX(CASE WHEN l.visitor_id = ${likeId} THEN 1 ELSE 0 END) AS liked_by_me
      FROM posts p
      LEFT JOIN reviews r ON r.post_id = p.id
      LEFT JOIN likes   l ON l.post_id = p.id
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `;
    return NextResponse.json(posts);
  } catch (e) {
    console.error('[GET /api/posts]', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const check = await requireOwner();
    if ('error' in check) return check.error;

    await ready;
    const { title, performance_date, viewing_count, casting_board } = await req.json();

    if (!title || !performance_date || !viewing_count) {
      return NextResponse.json({ error: '필수 항목을 입력해주세요.' }, { status: 400 });
    }

    const [post] = await sql`
      INSERT INTO posts (title, performance_date, viewing_count, casting_board)
      VALUES (${title}, ${performance_date}, ${viewing_count}, ${casting_board ?? null})
      RETURNING *
    `;
    return NextResponse.json(post, { status: 201 });
  } catch (e) {
    console.error('[POST /api/posts]', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
