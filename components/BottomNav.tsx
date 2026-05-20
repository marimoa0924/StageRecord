'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pointer-events-none">
      <div className="w-full max-w-xl bg-black/90 backdrop-blur border-t border-zinc-800 flex pointer-events-auto">
        <Link
          href="/"
          className={`flex-1 flex flex-col items-center justify-center py-3 gap-0.5 min-h-[56px] transition
            ${pathname === '/' ? 'text-sky-400' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          <span className="text-xl">🏠</span>
          <span className="text-[10px] font-medium">홈</span>
        </Link>
        <Link
          href="/calendar"
          className={`flex-1 flex flex-col items-center justify-center py-3 gap-0.5 min-h-[56px] transition
            ${pathname === '/calendar' ? 'text-sky-400' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          <span className="text-xl">📅</span>
          <span className="text-[10px] font-medium">캘린더</span>
        </Link>
      </div>
    </nav>
  );
}
