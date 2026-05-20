import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { requireOwner } from '@/lib/requireOwner';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  const reviews = db.prepare(`
    SELECT * FROM reviews WHERE post_id = ? ORDER BY created_at ASC
  `).all(id);
  return NextResponse.json(reviews);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const check = await requireOwner();
  if ('error' in check) return check.error;

  const { id } = await params;
  const body = await req.json();
  const { content, images } = body;

  const imageList = Array.isArray(images) ? images : [];
  if (!content?.trim() && imageList.length === 0) {
    return NextResponse.json({ error: '내용이나 이미지를 추가해주세요.' }, { status: 400 });
  }

  const imagesJson = JSON.stringify(imageList);
  const db = getDb();
  const result = db.prepare(`
    INSERT INTO reviews (post_id, content, images) VALUES (?, ?, ?)
  `).run(id, content.trim(), imagesJson);

  const review = db.prepare('SELECT * FROM reviews WHERE id = ?').get(result.lastInsertRowid);
  return NextResponse.json(review, { status: 201 });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const check = await requireOwner();
  if ('error' in check) return check.error;

  const { id } = await params;
  const { reviewId } = await req.json();
  const db = getDb();
  db.prepare('DELETE FROM reviews WHERE id = ? AND post_id = ?').run(reviewId, id);
  return NextResponse.json({ ok: true });
}
