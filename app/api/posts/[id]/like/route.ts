import { NextRequest, NextResponse } from 'next/server';
import { sql, ready } from '@/lib/db';

function getVid(req: NextRequest): string {
  return (
    req.cookies.get('vid')?.value ||
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    '0'
  );
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await ready;
    const { id } = await params;
    const vid = getVid(req);

    const [existing] = await sql`
      SELECT id FROM likes WHERE post_id = ${id} AND visitor_id = ${vid}
    `;

    if (existing) {
      await sql`DELETE FROM likes WHERE post_id = ${id} AND visitor_id = ${vid}`;
      const [{ count }] = await sql`SELECT COUNT(*)::int AS count FROM likes WHERE post_id = ${id}`;
      return NextResponse.json({ liked: false, count: Number(count) });
    } else {
      await sql`INSERT INTO likes (post_id, visitor_id) VALUES (${id}, ${vid})`;
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
    await ready;
    const { id } = await params;
    const vid = getVid(req);

    const [existing] = await sql`
      SELECT id FROM likes WHERE post_id = ${id} AND visitor_id = ${vid}
    `;
    const [{ count }] = await sql`SELECT COUNT(*)::int AS count FROM likes WHERE post_id = ${id}`;
    return NextResponse.json({ liked: !!existing, count: Number(count) });
  } catch (e) {
    console.error('[GET /api/posts/[id]/like]', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
