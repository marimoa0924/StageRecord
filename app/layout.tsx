import type { Metadata, Viewport } from 'next';
import { Noto_Sans_KR } from 'next/font/google';
import './globals.css';
import BottomNav from '@/components/BottomNav';
import { SessionProvider } from 'next-auth/react';

const notoSans = Noto_Sans_KR({ subsets: ['latin'], weight: ['400', '500', '700'] });

export const metadata: Metadata = {
  title: 'StageRecord',
  description: '나의 공연 관람 기록',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className={`${notoSans.className} bg-black text-white min-h-screen`}>
        <SessionProvider>
          <div className="max-w-xl mx-auto border-x border-zinc-800 min-h-screen relative">
            {children}
          </div>
          <BottomNav />
        </SessionProvider>
      </body>
    </html>
  );
}
