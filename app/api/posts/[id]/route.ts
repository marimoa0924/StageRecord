import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { sql, ready } from '@/lib/db';
import { requireOwner } from '@/lib/requireOwner';

function parseId(raw: string): number | null {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await ready;
    const { id: raw } = await params;
    const id = parseId(raw);
    if (!id) return NextResponse.json({ error: '유효하지 않은 게시물 ID입니다.' }, { status: 400 });

    const [post] = await sql`SELECT * FROM posts WHERE id = ${id}`;
    if (!post) return NextResponse.json({ error: '없는 게시물입니다.' }, { status: 404 });
    return NextResponse.json(post);
  } catch (e) {
    logger.error('[GET /api/posts/[id]]', e);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const check = await requireOwner();
    if ('error' in check) return check.error;

    await ready;
    const { id: raw } = await params;
    const id = parseId(raw);
    if (!id) return NextResponse.json({ error: '유효하지 않은 게시물 ID입니다.' }, { status: 400 });

    await sql`DELETE FROM posts WHERE id = ${id}`;
    return NextResponse.json({ ok: true });
  } catch (e) {
    logger.error('[DELETE /api/posts/[id]]', e);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
