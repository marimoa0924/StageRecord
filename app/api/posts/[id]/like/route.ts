import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

function getIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    '0.0.0.0'
  );
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ip = getIp(req);
  const db = getDb();

  const existing = db.prepare('SELECT id FROM likes WHERE post_id = ? AND ip_address = ?').get(id, ip);

  if (existing) {
    db.prepare('DELETE FROM likes WHERE post_id = ? AND ip_address = ?').run(id, ip);
    const count = (db.prepare('SELECT COUNT(*) as c FROM likes WHERE post_id = ?').get(id) as { c: number }).c;
    return NextResponse.json({ liked: false, count });
  } else {
    db.prepare('INSERT INTO likes (post_id, ip_address) VALUES (?, ?)').run(id, ip);
    const count = (db.prepare('SELECT COUNT(*) as c FROM likes WHERE post_id = ?').get(id) as { c: number }).c;
    return NextResponse.json({ liked: true, count });
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ip = getIp(req);
  const db = getDb();

  const liked = !!db.prepare('SELECT id FROM likes WHERE post_id = ? AND ip_address = ?').get(id, ip);
  const count = (db.prepare('SELECT COUNT(*) as c FROM likes WHERE post_id = ?').get(id) as { c: number }).c;

  return NextResponse.json({ liked, count });
}
