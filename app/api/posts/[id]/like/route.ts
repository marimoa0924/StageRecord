import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';
import { sql, ready } from '@/lib/db';
import { checkRateLimit } from '@/lib/rateLimit';
import { logger } from '@/lib/logger';

const RATE_LIMIT = { requests: 10, windowMs: 60_000 }; // 10 toggles/min per user

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }
    const email = session.user.email;

    const rl = checkRateLimit(`like:${email}`, RATE_LIMIT.requests, RATE_LIMIT.windowMs);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(rl.retryAfterMs / 1000)) } },
      );
    }

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
    logger.error('POST /api/posts/[id]/like', e);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
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
    logger.error('GET /api/posts/[id]/like', e);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
