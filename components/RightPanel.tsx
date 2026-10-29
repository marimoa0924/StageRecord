'use client';
import { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface FolderRow {
  folder_name: string;
  post_count: number;
  max_viewing: number;
}

interface Stats {
  shows: number;
  views: number;
  reviews: number;
}

export default function RightPanel() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [stats, setStats] = useState<Stats | null>(null);
  const [folders, setFolders] = useState<FolderRow[]>([]);

  useEffect(() => {
    // 모바일/태블릿에선 숨겨지므로(hidden xl:flex) 불필요한 요청을 막는다
    if (!window.matchMedia('(min-width: 1280px)').matches) return;

    fetch('/api/posts')
      .then((r) => r.json())
      .then((d: { viewing_count: number; review_count: number }[]) => {
        if (!Array.isArray(d)) return;
        setStats({
          shows: d.length,
          views: d.reduce((s, p) => s + (Number(p.viewing_count) || 0), 0),
          reviews: d.reduce((s, p) => s + (Number(p.review_count) || 0), 0),
        });
      })
      .catch(() => {});

    fetch('/api/folders')
      .then((r) => r.json())
      .then((d) => setFolders(Array.isArray(d?.folders) ? d.folders.slice(0, 5) : []))
      .catch(() => {});
  }, []);

  function onSearch(e: FormEvent) {
    e.preventDefault();
    const t = q.trim();
    if (t) router.push(`/search?q=${encodeURIComponent(t)}`);
  }

  return (
    <aside className="hidden xl:flex flex-col w-[330px] shrink-0 h-screen sticky top-0 px-5 pt-3 pb-4 gap-4 overflow-y-auto">
      {/* 검색 */}
      <form
        onSubmit={onSearch}
        className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-900 rounded-full px-4 h-11 border border-transparent focus-within:border-sky-400 focus-within:bg-white dark:focus-within:bg-black transition"
      >
        <svg className="w-4 h-4 text-zinc-400 dark:text-zinc-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="공연·후기 검색"
          className="flex-1 min-w-0 bg-transparent outline-none text-[15px] text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500"
        />
      </form>

      {/* 관람 요약 */}
      {stats && (
        <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800/60 bg-zinc-50/60 dark:bg-zinc-900/40 overflow-hidden">
          <h2 className="px-4 pt-3.5 pb-2 text-zinc-900 dark:text-white font-extrabold text-[19px]">관람 요약</h2>
          <dl className="px-4 pb-3.5 flex flex-col gap-2.5">
            <SummaryRow label="기록한 공연" value={stats.shows} unit="개" />
            <SummaryRow label="총 관람" value={stats.views} unit="회" />
            <SummaryRow label="후기" value={stats.reviews} unit="개" />
          </dl>
        </div>
      )}

      {/* 작품 폴더 */}
      {folders.length > 0 && (
        <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800/60 bg-zinc-50/60 dark:bg-zinc-900/40 overflow-hidden">
          <h2 className="px-4 pt-3.5 pb-1.5 text-zinc-900 dark:text-white font-extrabold text-[19px]">작품 폴더</h2>
          {folders.map((f) => (
            <Link
              key={f.folder_name}
              href={`/folders/${encodeURIComponent(f.folder_name)}`}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-100 dark:hover:bg-white/[0.03] transition"
            >
              <span className="text-lg shrink-0">🎭</span>
              <span className="flex-1 min-w-0">
                <span className="block text-zinc-900 dark:text-white font-semibold text-[14px] truncate">{f.folder_name}</span>
                <span className="block text-zinc-500 text-[12px]">{f.post_count}번 관람 · 최근 {f.max_viewing}회차</span>
              </span>
            </Link>
          ))}
          <Link
            href="/folders"
            className="block px-4 py-2.5 text-sky-500 hover:bg-zinc-100 dark:hover:bg-white/[0.03] text-[14px] transition"
          >
            더 보기
          </Link>
        </div>
      )}
    </aside>
  );
}

function SummaryRow({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <div className="flex items-baseline justify-between">
      <dt className="text-zinc-500 dark:text-zinc-400 text-[14px]">{label}</dt>
      <dd className="text-zinc-900 dark:text-white">
        <span className="font-extrabold text-[18px]">{value.toLocaleString('ko-KR')}</span>
        <span className="text-zinc-400 dark:text-zinc-500 text-[13px] ml-0.5">{unit}</span>
      </dd>
    </div>
  );
}
