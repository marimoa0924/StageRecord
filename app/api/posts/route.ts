import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { requireOwner } from '@/lib/requireOwner';

export async function GET(req: NextRequest) {
  const db = getDb();
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    '0.0.0.0';

  const posts = db.prepare(`
    SELECT
      p.*,
      COUNT(DISTINCT r.id) as review_count,
      COUNT(DISTINCT l.id) as like_count,
      MAX(CASE WHEN l.ip_address = ? THEN 1 ELSE 0 END) as liked_by_me
    FROM posts p
    LEFT JOIN reviews r ON r.post_id = p.id
    LEFT JOIN likes l ON l.post_id = p.id
    GROUP BY p.id
    ORDER BY p.created_at DESC
  `).all(ip);
  return NextResponse.json(posts);
}

export async function POST(req: NextRequest) {
  const check = await requireOwner();
  if ('error' in check) return check.error;

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
