import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  const reviews = db.prepare(`
    SELECT * FROM reviews WHERE post_id = ? ORDER BY created_at ASC
  `).all(id);
  return NextResponse.json(reviews);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { content } = body;

  if (!content?.trim()) {
    return NextResponse.json({ error: '내용을 입력해주세요.' }, { status: 400 });
  }

  const db = getDb();
  const result = db.prepare(`
    INSERT INTO reviews (post_id, content) VALUES (?, ?)
  `).run(id, content.trim());

  const review = db.prepare('SELECT * FROM reviews WHERE id = ?').get(result.lastInsertRowid);
  return NextResponse.json(review, { status: 201 });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { reviewId } = await req.json();
  const db = getDb();
  db.prepare('DELETE FROM reviews WHERE id = ? AND post_id = ?').run(reviewId, id);
  return NextResponse.json({ ok: true });
}
