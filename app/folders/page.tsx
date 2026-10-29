'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface FolderRow {
  folder_name: string;
  post_count: number;
  max_viewing: number;
  first_date: string;
  latest_date: string;
}

interface FoldersData {
  chikmuk_count: number;
  folders: FolderRow[];
}

function formatDate(iso: string) {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
}

function FolderCard({ href, icon, title, sub, meta }: {
  href: string;
  icon: React.ReactNode;
  title: string;
  sub: string;
  meta?: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 px-5 py-4 border-b border-zinc-200/80 dark:border-zinc-800/60 hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition cursor-pointer"
    >
      <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/60 flex items-center justify-center text-2xl shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-zinc-900 dark:text-white font-semibold text-[15px] truncate">{title}</p>
        <p className="text-zinc-500 text-[13px] mt-0.5">{sub}</p>
        {meta && <p className="text-zinc-400 dark:text-zinc-600 text-xs mt-0.5">{meta}</p>}
      </div>
      <svg className="w-4 h-4 text-zinc-400 dark:text-zinc-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6"/>
      </svg>
    </Link>
  );
}

export default function FoldersPage() {
  const [data, setData] = useState<FoldersData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/folders')
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-zinc-200/60 dark:border-zinc-800/60 px-4 h-14 flex items-center">
        <h1 className="text-zinc-900 dark:text-white font-bold text-[17px]">폴더</h1>
      </header>

      <main className="flex-1">
        {loading && (
          <div className="flex flex-col">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-zinc-200/60 dark:border-zinc-800/60 animate-pulse">
                <div className="w-12 h-12 rounded-2xl bg-zinc-200 dark:bg-zinc-800 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded-full w-1/2" />
                  <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded-full w-1/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && data && (
          <>
            {/* 찍먹극 — always shown if any exist */}
            {data.chikmuk_count > 0 && (
              <FolderCard
                href="/folders/찍먹극"
                icon="⚡"
                title="찍먹극"
                sub={`${data.chikmuk_count}개 작품`}
                meta="총 1회 관람한 공연 모음"
              />
            )}

            {/* Title folders */}
            {data.folders.length === 0 && data.chikmuk_count === 0 && (
              <div className="flex flex-col items-center justify-center py-28 gap-3">
                <div className="text-5xl">📁</div>
                <p className="text-zinc-600 dark:text-zinc-400 font-semibold text-base">폴더가 없습니다</p>
                <p className="text-zinc-400 dark:text-zinc-600 text-sm">공연을 기록하면 자동으로 분류됩니다</p>
              </div>
            )}

            {data.folders.map((folder) => (
              <FolderCard
                key={folder.folder_name}
                href={`/folders/${encodeURIComponent(folder.folder_name)}`}
                icon="🎭"
                title={folder.folder_name}
                sub={`${folder.post_count}번 관람 · 최근 ${folder.max_viewing}회차`}
                meta={
                  folder.first_date === folder.latest_date
                    ? formatDate(folder.first_date)
                    : `${formatDate(folder.first_date)} – ${formatDate(folder.latest_date)}`
                }
              />
            ))}
          </>
        )}
      </main>
    </div>
  );
}
