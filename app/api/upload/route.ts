import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { requireOwner } from '@/lib/requireOwner';

export async function GET() {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return NextResponse.json({ ok: false, reason: 'BLOB_READ_WRITE_TOKEN not set' });
  const preview = `${token.slice(0, 20)}...`;
  return NextResponse.json({ ok: true, tokenPreview: preview });
}

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

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { url } = await put(uniqueName, file, { access: 'public', token });
    return NextResponse.json({ url }, { status: 201 });
  } catch (e) {
    console.error('[POST /api/upload]', e);
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
