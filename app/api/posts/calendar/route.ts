import { NextRequest, NextResponse } from 'next/server';
import { sql, ready } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const year = Number(searchParams.get('year'));
    const month = Number(searchParams.get('month'));

    if (!Number.isInteger(year) || year < 1900 || year > 2100 ||
        !Number.isInteger(month) || month < 1 || month > 12) {
      return NextResponse.json({ error: '유효하지 않은 날짜 파라미터입니다.' }, { status: 400 });
    }

    await ready;
    const prefix = `${year}-${String(month).padStart(2, '0')}`;

    const posts = await sql`
      SELECT id, title, performance_date, viewing_count, casting_board
      FROM posts
      WHERE performance_date LIKE ${prefix + '%'}
      ORDER BY performance_date ASC
    `;
    return NextResponse.json(posts);
  } catch (e) {
    console.error('[GET /api/posts/calendar]', e);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
