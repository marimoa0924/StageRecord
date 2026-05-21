'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useOwner } from '@/lib/useOwner';
import { useTheme } from '@/lib/theme';
import { signIn, signOut } from 'next-auth/react';
import Image from 'next/image';

interface Props {
  onNewPost: () => void;
}

export default function Sidebar({ onNewPost }: Props) {
  const pathname = usePathname();
  const { isOwner, user } = useOwner();
  const { theme, toggle } = useTheme();

  return (
    <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-screen w-[240px] xl:w-[260px] px-2 pt-1 pb-4 z-50 border-r border-zinc-200 dark:border-zinc-800/60 bg-white dark:bg-black">
      <Link
        href="/"
        className="flex items-center gap-3 px-3 py-4 rounded-2xl hover:bg-zinc-100 dark:hover:bg-zinc-900/60 transition w-fit mb-1"
      >
        <span className="text-[28px] leading-none">🎭</span>
        <span className="text-zinc-900 dark:text-white font-extrabold text-xl tracking-tight">StageRecord</span>
      </Link>

      <nav className="flex flex-col gap-0.5">
        <SideNavItem
          href="/"
          active={pathname === '/'}
          icon={
            pathname === '/' ? (
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
            ) : (
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            )
          }
          label="홈"
        />
        <SideNavItem
          href="/calendar"
          active={pathname === '/calendar'}
          icon={
            pathname === '/calendar' ? (
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/></svg>
            ) : (
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            )
          }
          label="캘린더"
        />
        <SideNavItem
          href="/folders"
          active={pathname.startsWith('/folders')}
          icon={
            pathname.startsWith('/folders') ? (
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>
            ) : (
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
            )
          }
          label="폴더"
        />
        <SideNavItem
          href="/search"
          active={pathname === '/search'}
          icon={
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={pathname === '/search' ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          }
          label="검색"
        />
        <button
          onClick={toggle}
          className="flex items-center gap-4 px-3 py-3 rounded-2xl transition text-[17px] text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900/60 font-medium"
        >
          {theme === 'dark' ? (
            <>
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
              라이트 모드
            </>
          ) : (
            <>
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
              다크 모드
            </>
          )}
        </button>
      </nav>

      {isOwner && (
        <button
          onClick={onNewPost}
          className="mt-4 w-full bg-sky-500 hover:bg-sky-400 active:bg-sky-600 text-white font-bold rounded-full py-3 text-[15px] transition shadow-sm"
        >
          새 기록 추가
        </button>
      )}

      <div className="mt-auto">
        {user ? (
          <button
            onClick={() => signOut()}
            className="flex items-center gap-3 w-full px-3 py-3 rounded-2xl hover:bg-zinc-100 dark:hover:bg-zinc-900/60 transition text-left"
          >
            {user.image ? (
              <Image src={user.image} alt="" width={40} height={40} className="rounded-full shrink-0" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-700 shrink-0 flex items-center justify-center text-zinc-700 dark:text-white font-bold">
                {user.name?.[0]?.toUpperCase() ?? '?'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-zinc-900 dark:text-white font-bold text-sm leading-tight truncate">{user.name}</p>
              <p className="text-zinc-500 text-xs mt-0.5 truncate">{isOwner ? '오너 계정' : '방문자'}</p>
            </div>
          </button>
        ) : (
          <button
            onClick={() => signIn('google', {}, { prompt: 'select_account' })}
            className="flex items-center gap-3 w-full px-3 py-3 rounded-2xl hover:bg-zinc-100 dark:hover:bg-zinc-900/60 transition text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white text-sm font-medium"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Google로 로그인
          </button>
        )}
      </div>
    </aside>
  );
}

function SideNavItem({
  href, active, icon, label,
}: {
  href: string; active: boolean; icon: React.ReactNode; label: string;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-4 px-3 py-3 rounded-2xl transition text-[17px]
        ${active
          ? 'text-zinc-900 dark:text-white font-bold'
          : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900/60 font-medium'}`}
    >
      {icon}
      {label}
    </Link>
  );
}
