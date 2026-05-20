import { NextRequest, NextResponse } from 'next/server';
import { sql, ready } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const year = searchParams.get('year');
    const month = searchParams.get('month');

    if (!year || !month) {
      return NextResponse.json({ error: 'year, month 파라미터가 필요합니다.' }, { status: 400 });
    }

    await ready;
    const prefix = `${year}-${month.padStart(2, '0')}`;

    const posts = await sql`
      SELECT id, title, performance_date, viewing_count, casting_board
      FROM posts
      WHERE performance_date LIKE ${prefix + '%'}
      ORDER BY performance_date ASC
    `;
    return NextResponse.json(posts);
  } catch (e) {
    console.error('[GET /api/posts/calendar]', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
