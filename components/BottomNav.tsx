'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useOwner } from '@/lib/useOwner';

interface Props {
  onNewPost: () => void;
}

export default function BottomNav({ onNewPost }: Props) {
  const pathname = usePathname();
  const { isOwner } = useOwner();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex justify-center">
      <div className="w-full max-w-[598px] bg-black/90 backdrop-blur-md border-t border-zinc-800/60 flex items-stretch pb-safe">
        <Link
          href="/"
          className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-1 transition min-h-[52px]
            ${pathname === '/' ? 'text-sky-400' : 'text-zinc-500'}`}
        >
          {pathname === '/' ? (
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
          ) : (
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          )}
          <span className="text-[10px] font-medium">홈</span>
        </Link>

        {isOwner && (
          <button
            onClick={onNewPost}
            className="flex-1 flex flex-col items-center justify-center py-2.5 gap-1 transition min-h-[52px] text-zinc-500 hover:text-sky-400"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="16"/>
              <line x1="8" y1="12" x2="16" y2="12"/>
            </svg>
            <span className="text-[10px] font-medium">기록</span>
          </button>
        )}

        <Link
          href="/calendar"
          className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-1 transition min-h-[52px]
            ${pathname === '/calendar' ? 'text-sky-400' : 'text-zinc-500'}`}
        >
          {pathname === '/calendar' ? (
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/></svg>
          ) : (
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          )}
          <span className="text-[10px] font-medium">캘린더</span>
        </Link>
      </div>
    </nav>
  );
}
