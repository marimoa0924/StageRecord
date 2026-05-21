import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { sql, ready } from '@/lib/db';
import { auth } from '@/auth';

const CHIKMUK = '찍먹극';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ name: string }> },
) {
  try {
    await ready;
    const { name } = await params;
    const title = decodeURIComponent(name);

    const session = await auth();
    const likeId = session?.user?.email ?? '__no_match__';

    let posts;
    if (title === CHIKMUK) {
      posts = await sql`
        SELECT p.*,
          (SELECT COUNT(*)::int FROM reviews WHERE post_id = p.id) AS review_count,
          (SELECT COUNT(*)::int FROM likes   WHERE post_id = p.id) AS like_count,
          (SELECT COUNT(*)::int FROM likes   WHERE post_id = p.id
                                              AND visitor_id = ${likeId}) AS liked_by_me
        FROM posts p
        WHERE TRIM(REGEXP_REPLACE(REGEXP_REPLACE(p.title, '^[^ ]+ ', ''), ' (?:(?:낮공|밤공|세미막|페어막) )?자[가-힣]+.*$', '')) IN (
          SELECT TRIM(REGEXP_REPLACE(REGEXP_REPLACE(title, '^[^ ]+ ', ''), ' (?:(?:낮공|밤공|세미막|페어막) )?자[가-힣]+.*$', ''))
          FROM posts
          GROUP BY TRIM(REGEXP_REPLACE(REGEXP_REPLACE(title, '^[^ ]+ ', ''), ' (?:(?:낮공|밤공|세미막|페어막) )?자[가-힣]+.*$', ''))
          HAVING COUNT(*) = 1
        )
        ORDER BY p.performance_date ASC
      `;
    } else {
      posts = await sql`
        SELECT p.*,
          (SELECT COUNT(*)::int FROM reviews WHERE post_id = p.id) AS review_count,
          (SELECT COUNT(*)::int FROM likes   WHERE post_id = p.id) AS like_count,
          (SELECT COUNT(*)::int FROM likes   WHERE post_id = p.id
                                              AND visitor_id = ${likeId}) AS liked_by_me
        FROM posts p
        WHERE TRIM(REGEXP_REPLACE(REGEXP_REPLACE(p.title, '^[^ ]+ ', ''), ' (?:(?:낮공|밤공|세미막|페어막) )?자[가-힣]+.*$', '')) = ${title}
        ORDER BY p.performance_date ASC
      `;
    }

    return NextResponse.json(posts);
  } catch (e) {
    logger.error('[GET /api/folders/[name]]', e);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
