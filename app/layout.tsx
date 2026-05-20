import type { Metadata } from 'next';
import { Noto_Sans_KR } from 'next/font/google';
import './globals.css';

const notoSans = Noto_Sans_KR({ subsets: ['latin'], weight: ['400', '500', '700'] });

export const metadata: Metadata = {
  title: 'StageRecord',
  description: '나의 공연 관람 기록',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className={`${notoSans.className} bg-black text-white min-h-screen`}>
        <div className="max-w-xl mx-auto border-x border-zinc-800 min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
