import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { requireOwner } from '@/lib/requireOwner';

const ALLOWED_MIME_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/heic': 'heic',
  'image/heif': 'heif',
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(req: NextRequest) {
  try {
    const check = await requireOwner();
    if ('error' in check) return check.error;

    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      return NextResponse.json({ error: 'BLOB_READ_WRITE_TOKEN이 설정되지 않았습니다.' }, { status: 503 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: '파일이 없습니다.' }, { status: 400 });
    }

    const ext = ALLOWED_MIME_TYPES[file.type];
    if (!ext) {
      return NextResponse.json({ error: '이미지 파일만 업로드할 수 있습니다.' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: '파일 크기는 10MB 이하여야 합니다.' }, { status: 400 });
    }

    const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { url } = await put(uniqueName, file, { access: 'public', token });
    return NextResponse.json({ url }, { status: 201 });
  } catch (e) {
    logger.error('[POST /api/upload]', e);
    return NextResponse.json({ error: '업로드 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
