import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const year = searchParams.get('year');
  const month = searchParams.get('month');

  if (!year || !month) {
    return NextResponse.json({ error: 'year, month 파라미터가 필요합니다.' }, { status: 400 });
  }

  const paddedMonth = month.padStart(2, '0');
  const prefix = `${year}-${paddedMonth}`;

  const db = getDb();
  const posts = db.prepare(`
    SELECT id, title, performance_date, viewing_count, casting_board
    FROM posts
    WHERE performance_date LIKE ?
    ORDER BY performance_date ASC
  `).all(`${prefix}%`);

  return NextResponse.json(posts);
}
