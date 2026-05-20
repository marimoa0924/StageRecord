import { auth, isOwner } from '@/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await auth();
  return NextResponse.json({
    isOwner: isOwner(session?.user?.email),
    user: session?.user ?? null,
  });
}
