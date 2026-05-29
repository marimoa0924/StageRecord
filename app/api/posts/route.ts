import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { sql, ready } from '@/lib/db';
import { requireOwner } from '@/lib/requireOwner';
import { auth } from '@/auth';

function isValidBlobUrl(url: unknown): boolean {
  if (typeof url !== 'string' || url.length > 2048) return false;
  try {
    const u = new URL(url);
    return u.protocol === 'https:' && u.hostname.endsWith('.public.blob.vercel-storage.com');
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  try {
    await ready;
    const session = await auth();
    const likeId = session?.user?.email ?? '__no_match__';

    const sortParam = req.nextUrl.searchParams.get('sort');
    const byDate = sortParam === 'date';

    const posts = byDate
      ? await sql`
          SELECT
            p.*,
            COUNT(DISTINCT r.id)::int   AS review_count,
            COUNT(DISTINCT l.id)::int   AS like_count,
            MAX(CASE WHEN l.visitor_id = ${likeId} THEN 1 ELSE 0 END) AS liked_by_me
          FROM posts p
          LEFT JOIN reviews r ON r.post_id = p.id
          LEFT JOIN likes   l ON l.post_id = p.id
          GROUP BY p.id
          ORDER BY p.performance_date DESC, p.created_at DESC
        `
      : await sql`
          SELECT
            p.*,
            COUNT(DISTINCT r.id)::int   AS review_count,
            COUNT(DISTINCT l.id)::int   AS like_count,
            MAX(CASE WHEN l.visitor_id = ${likeId} THEN 1 ELSE 0 END) AS liked_by_me
          FROM posts p
          LEFT JOIN reviews r ON r.post_id = p.id
          LEFT JOIN likes   l ON l.post_id = p.id
          GROUP BY p.id
          ORDER BY p.created_at DESC
        `;

    return NextResponse.json(posts);
  } catch (e) {
    logger.error('[GET /api/posts]', e);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const check = await requireOwner();
    if ('error' in check) return check.error;

    await ready;
    const { title, performance_date, viewing_count, casting_board } = await req.json();

    if (!title?.trim() || typeof title !== 'string' || title.length > 300) {
      return NextResponse.json({ error: '제목을 확인해주세요. (최대 300자)' }, { status: 400 });
    }
    if (typeof performance_date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(performance_date)) {
      return NextResponse.json({ error: '날짜 형식이 올바르지 않습니다. (YYYY-MM-DD)' }, { status: 400 });
    }
    const count = Number(viewing_count);
    if (!Number.isInteger(count) || count < 1 || count > 9999) {
      return NextResponse.json({ error: '관람 횟수가 올바르지 않습니다. (1~9999)' }, { status: 400 });
    }
    if (casting_board != null && !isValidBlobUrl(casting_board)) {
      return NextResponse.json({ error: '허용되지 않는 이미지 URL입니다.' }, { status: 400 });
    }

    const [post] = await sql`
      INSERT INTO posts (title, performance_date, viewing_count, casting_board)
      VALUES (${title.trim()}, ${performance_date}, ${count}, ${casting_board ?? null})
      RETURNING *
    `;
    return NextResponse.json(post, { status: 201 });
  } catch (e) {
    logger.error('[POST /api/posts]', e);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
