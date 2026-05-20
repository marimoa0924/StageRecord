import { NextRequest, NextResponse } from 'next/server';
import { sql, ready } from '@/lib/db';
import { requireOwner } from '@/lib/requireOwner';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await ready;
  const { id } = await params;
  const reviews = await sql`
    SELECT * FROM reviews WHERE post_id = ${id} ORDER BY created_at ASC
  `;
  return NextResponse.json(reviews);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const check = await requireOwner();
  if ('error' in check) return check.error;

  await ready;
  const { id } = await params;
  const { content, images } = await req.json();

  const imageList: string[] = Array.isArray(images) ? images : [];
  if (!content?.trim() && imageList.length === 0) {
    return NextResponse.json({ error: '내용이나 이미지를 추가해주세요.' }, { status: 400 });
  }

  const imagesJson = JSON.stringify(imageList);
  const contentStr = content?.trim() ?? '';

  const [review] = await sql`
    INSERT INTO reviews (post_id, content, images)
    VALUES (${id}, ${contentStr}, ${imagesJson})
    RETURNING *
  `;
  return NextResponse.json(review, { status: 201 });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const check = await requireOwner();
  if ('error' in check) return check.error;

  await ready;
  const { id } = await params;
  const { reviewId } = await req.json();
  await sql`DELETE FROM reviews WHERE id = ${reviewId} AND post_id = ${id}`;
  return NextResponse.json({ ok: true });
}
