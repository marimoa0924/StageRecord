import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { requireOwner } from '@/lib/requireOwner';

export async function POST(req: NextRequest) {
  const check = await requireOwner();
  if ('error' in check) return check.error;

  const formData = await req.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ error: '파일이 없습니다.' }, { status: 400 });
  }

  const { url } = await put(file.name, file, { access: 'public' });
  return NextResponse.json({ url }, { status: 201 });
}
