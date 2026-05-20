import { NextRequest, NextResponse } from 'next/server';
import { sql, ready } from '@/lib/db';
import { requireOwner } from '@/lib/requireOwner';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await ready;
  const { id } = await params;
  const [post] = await sql`SELECT * FROM posts WHERE id = ${id}`;
  if (!post) return NextResponse.json({ error: '없는 게시물입니다.' }, { status: 404 });
  return NextResponse.json(post);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const check = await requireOwner();
  if ('error' in check) return check.error;

  await ready;
  const { id } = await params;
  await sql`DELETE FROM posts WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
