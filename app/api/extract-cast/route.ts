import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { requireOwner } from '@/lib/requireOwner';
import { checkRateLimit } from '@/lib/rateLimit';
import { extractCastFromImage } from '@/lib/extractCast';

export const maxDuration = 30;

function isBlobUrl(url: unknown): url is string {
  if (typeof url !== 'string' || url.length > 2048) return false;
  try {
    const u = new URL(url);
    return u.protocol === 'https:' && u.hostname.endsWith('.public.blob.vercel-storage.com');
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const check = await requireOwner();
    if ('error' in check) return check.error;

    // Gemini 호출은 유료 → 소유자라도 분당 제한
    const rl = checkRateLimit('extract-cast', 20, 60_000);
    if (!rl.allowed) {
      return NextResponse.json({ error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' }, { status: 429 });
    }

    const { url } = await req.json();
    if (!isBlobUrl(url)) {
      return NextResponse.json({ error: '유효한 캐스팅보드 이미지가 없습니다.' }, { status: 400 });
    }

    const actors = await extractCastFromImage(url);
    return NextResponse.json({ actors });
  } catch (e) {
    logger.error('[POST /api/extract-cast]', e);
    // owner 전용 라우트라 실제 원인을 노출해 진단을 돕는다
    const msg = e instanceof Error ? e.message : '배우 추출 중 오류가 발생했습니다.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
