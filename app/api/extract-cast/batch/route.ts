import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { sql, ready } from '@/lib/db';
import { requireOwner } from '@/lib/requireOwner';
import { extractCastFromImage } from '@/lib/extractCast';

export const maxDuration = 60;

// 캐스팅보드는 있고 배우가 비어있고 아직 스캔 안 한 글만 몇 개씩 처리 (클라이언트가 반복 호출)
export async function POST(req: NextRequest) {
  try {
    const check = await requireOwner();
    if ('error' in check) return check.error;
    await ready;

    const body = await req.json().catch(() => ({}));
    const take = Math.min(Math.max(Number(body?.limit) || 2, 1), 5);

    const rows = await sql`
      SELECT id, casting_board FROM posts
      WHERE casting_board IS NOT NULL AND actors = '[]' AND cast_scanned = false
      ORDER BY id DESC LIMIT ${take}
    `;

    let processed = 0;
    let failed = 0;
    for (const r of rows) {
      try {
        const actors = await extractCastFromImage(r.casting_board as string);
        // 빈 결과여도 cast_scanned=true로 표시해 다시 처리하지 않음
        await sql`UPDATE posts SET actors = ${JSON.stringify(actors)}, cast_scanned = true WHERE id = ${r.id}`;
        processed++;
      } catch (e) {
        failed++; // 실패는 표시하지 않음 → 다음 호출에서 재시도
        logger.error(`[batch extract ${r.id}]`, e);
      }
    }

    const [{ remaining }] = await sql`
      SELECT COUNT(*)::int AS remaining FROM posts
      WHERE casting_board IS NOT NULL AND actors = '[]' AND cast_scanned = false
    `;

    return NextResponse.json({ processed, failed, remaining });
  } catch (e) {
    logger.error('[POST /api/extract-cast/batch]', e);
    return NextResponse.json({ error: '일괄 추출 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
