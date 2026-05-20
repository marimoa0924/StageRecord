import { auth, isOwner } from '@/auth';
import { NextResponse } from 'next/server';

export async function requireOwner(): Promise<{ error: NextResponse } | { ok: true }> {
  const session = await auth();
  if (!isOwner(session?.user?.email)) {
    return { error: NextResponse.json({ error: '권한이 없습니다.' }, { status: 401 }) };
  }
  return { ok: true };
}
