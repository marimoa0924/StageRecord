import { NextRequest, NextResponse } from 'next/server';
import { sql, ready } from '@/lib/db';
import { requireOwner } from '@/lib/requireOwner';

export async function GET(req: NextRequest) {
  await ready;
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    '0.0.0.0';

  const posts = await sql`
    SELECT
      p.*,
      COUNT(DISTINCT r.id)::int   AS review_count,
      COUNT(DISTINCT l.id)::int   AS like_count,
      MAX(CASE WHEN l.ip_address = ${ip} THEN 1 ELSE 0 END) AS liked_by_me
    FROM posts p
    LEFT JOIN reviews r ON r.post_id = p.id
    LEFT JOIN likes   l ON l.post_id = p.id
    GROUP BY p.id
    ORDER BY p.created_at DESC
  `;
  return NextResponse.json(posts);
}

export async function POST(req: NextRequest) {
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
}
