import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  let vid = request.cookies.get('vid')?.value;
  const isNew = !vid;
  if (!vid) vid = crypto.randomUUID();

  // 같은 요청의 라우트 핸들러도 vid를 보도록 전파 (첫 요청의 IP/'0' 폴백 방지)
  request.cookies.set('vid', vid);
  const response = NextResponse.next({ request: { headers: request.headers } });

  if (isNew) {
    response.cookies.set('vid', vid, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
  }
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
