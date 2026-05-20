import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function GET() {
  const db = getDb();
  const posts = db.prepare(`
    SELECT p.*, COUNT(r.id) as review_count
    FROM posts p
    LEFT JOIN reviews r ON r.post_id = p.id
    GROUP BY p.id
    ORDER BY p.created_at DESC
  `).all();
  return NextResponse.json(posts);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, performance_date, viewing_count, casting_board } = body;

  if (!title || !performance_date || !viewing_count) {
    return NextResponse.json({ error: '필수 항목을 입력해주세요.' }, { status: 400 });
  }

  const db = getDb();
  const result = db.prepare(`
    INSERT INTO posts (title, performance_date, viewing_count, casting_board)
    VALUES (?, ?, ?, ?)
  `).run(title, performance_date, viewing_count, casting_board || null);

  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(result.lastInsertRowid);
  return NextResponse.json(post, { status: 201 });
}
