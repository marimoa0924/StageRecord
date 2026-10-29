import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { sql, ready } from '@/lib/db';
import { auth } from '@/auth';
import { requireOwner } from '@/lib/requireOwner';

const CHIKMUK = '찍먹극';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ name: string }> }) {
  try {
    const check = await requireOwner();
    if ('error' in check) return check.error;

    await ready;
    const { name } = await params;
    const folder = decodeURIComponent(name);
    const { emoji } = await req.json();
    if (typeof emoji !== 'string' || emoji.trim().length === 0 || emoji.length > 16) {
      return NextResponse.json({ error: '이모지를 확인해주세요.' }, { status: 400 });
    }

    await sql`
      INSERT INTO folder_emojis (name, emoji) VALUES (${folder}, ${emoji.trim()})
      ON CONFLICT (name) DO UPDATE SET emoji = EXCLUDED.emoji
    `;
    return NextResponse.json({ ok: true });
  } catch (e) {
    logger.error('[PATCH /api/folders/[name]]', e);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

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
        WHERE show_name(p.title) IN (
          SELECT show_name(title)
          FROM posts
          GROUP BY show_name(title)
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
        WHERE show_name(p.title) = ${title}
        ORDER BY p.performance_date ASC
      `;
    }

    return NextResponse.json(posts);
  } catch (e) {
    logger.error('[GET /api/folders/[name]]', e);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
