import { NextRequest, NextResponse } from 'next/server';
import { sql, ready } from '@/lib/db';

function getIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    '0.0.0.0'
  );
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await ready;
  const { id } = await params;
  const ip = getIp(req);

  const [existing] = await sql`
    SELECT id FROM likes WHERE post_id = ${id} AND ip_address = ${ip}
  `;

  if (existing) {
    await sql`DELETE FROM likes WHERE post_id = ${id} AND ip_address = ${ip}`;
    const [{ count }] = await sql`SELECT COUNT(*)::int AS count FROM likes WHERE post_id = ${id}`;
    return NextResponse.json({ liked: false, count: Number(count) });
  } else {
    await sql`INSERT INTO likes (post_id, ip_address) VALUES (${id}, ${ip})`;
    const [{ count }] = await sql`SELECT COUNT(*)::int AS count FROM likes WHERE post_id = ${id}`;
    return NextResponse.json({ liked: true, count: Number(count) });
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await ready;
  const { id } = await params;
  const ip = getIp(req);

  const [existing] = await sql`
    SELECT id FROM likes WHERE post_id = ${id} AND ip_address = ${ip}
  `;
  const [{ count }] = await sql`SELECT COUNT(*)::int AS count FROM likes WHERE post_id = ${id}`;
  return NextResponse.json({ liked: !!existing, count: Number(count) });
}
