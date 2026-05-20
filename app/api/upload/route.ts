import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { requireOwner } from '@/lib/requireOwner';

export async function POST(req: NextRequest) {
  try {
    const check = await requireOwner();
    if ('error' in check) return check.error;

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json({ error: 'Blob storage가 설정되지 않았습니다. Vercel Storage에서 Blob을 생성해주세요.' }, { status: 503 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: '파일이 없습니다.' }, { status: 400 });
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { url } = await put(uniqueName, file, { access: 'public' });
    return NextResponse.json({ url }, { status: 201 });
  } catch (e) {
    console.error('[POST /api/upload]', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
