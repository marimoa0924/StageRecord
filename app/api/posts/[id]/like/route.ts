import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';
import { sql, ready } from '@/lib/db';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }
    const email = session.user.email;

    await ready;
    const { id } = await params;

    const [existing] = await sql`
      SELECT id FROM likes WHERE post_id = ${id} AND visitor_id = ${email}
    `;

    if (existing) {
      await sql`DELETE FROM likes WHERE post_id = ${id} AND visitor_id = ${email}`;
      const [{ count }] = await sql`SELECT COUNT(*)::int AS count FROM likes WHERE post_id = ${id}`;
      return NextResponse.json({ liked: false, count: Number(count) });
    } else {
      await sql`INSERT INTO likes (post_id, visitor_id) VALUES (${id}, ${email})`;
      const [{ count }] = await sql`SELECT COUNT(*)::int AS count FROM likes WHERE post_id = ${id}`;
      return NextResponse.json({ liked: true, count: Number(count) });
    }
  } catch (e) {
    console.error('[POST /api/posts/[id]/like]', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    const email = session?.user?.email ?? null;

    await ready;
    const { id } = await params;

    let liked = false;
    if (email) {
      const [existing] = await sql`
        SELECT id FROM likes WHERE post_id = ${id} AND visitor_id = ${email}
      `;
      liked = !!existing;
    }
    const [{ count }] = await sql`SELECT COUNT(*)::int AS count FROM likes WHERE post_id = ${id}`;
    return NextResponse.json({ liked, count: Number(count) });
  } catch (e) {
    console.error('[GET /api/posts/[id]/like]', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
