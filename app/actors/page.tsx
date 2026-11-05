'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Post {
  id: number;
  title: string;
  performance_date: string;
  actors?: string;
}

function parseActors(raw?: string | null): string[] {
  try { const v = JSON.parse(raw || '[]'); return Array.isArray(v) ? v : []; } catch { return []; }
}

function formatDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function ActorsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    try {
      const res = await fetch('/api/posts');
      const data = await res.json();
      setPosts(Array.isArray(data) ? data : []);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  // 배우 → 출연 기록
  const actorMap = useMemo(() => {
    const m = new Map<string, Post[]>();
    for (const p of posts) {
      for (const a of parseActors(p.actors)) {
        if (!m.has(a)) m.set(a, []);
        m.get(a)!.push(p);
      }
    }
    return m;
  }, [posts]);

  const q = query.trim();
  const results = useMemo(() => {
    if (!q) return [];
    return [...actorMap.keys()].filter((n) => n.includes(q)).sort((a, b) => a.localeCompare(b, 'ko'));
  }, [actorMap, q]);

  // ── 배우 상세: 극 이름 + 날짜만, 클릭 시 스레드로 ──
  if (selected) {
    const list = (actorMap.get(selected) ?? []).slice().sort((a, b) => a.performance_date.localeCompare(b.performance_date));
    return (
      <div className="flex flex-col min-h-screen">
        <header className="sticky top-0 z-40 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-zinc-200/60 dark:border-zinc-800/60 px-4 h-14 flex items-center gap-2">
          <button
            onClick={() => setSelected(null)}
            className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition min-w-[44px] min-h-[44px] flex items-center shrink-0"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
          </button>
          <h1 className="text-zinc-900 dark:text-white font-bold text-[17px] truncate">{selected}</h1>
          <span className="ml-auto text-zinc-400 dark:text-zinc-600 text-sm shrink-0">{list.length}편</span>
        </header>
        <main className="flex-1">
          {list.map((p) => (
            <Link
              key={p.id}
              href={`/post/${p.id}`}
              className="flex items-center justify-between gap-3 px-4 py-3.5 border-b border-zinc-200/60 dark:border-zinc-800/60 hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition"
            >
              <span className="text-zinc-900 dark:text-white font-medium truncate">{p.title}</span>
              <span className="text-zinc-400 dark:text-zinc-500 text-[13px] shrink-0">{formatDate(p.performance_date)}</span>
            </Link>
          ))}
        </main>
      </div>
    );
  }

  // ── 검색 ──
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-zinc-200/60 dark:border-zinc-800/60 px-4 h-14 flex items-center gap-2">
        <button
          onClick={() => router.back()}
          className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition min-w-[44px] min-h-[44px] flex items-center shrink-0 lg:hidden"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
        </button>
        <h1 className="text-zinc-900 dark:text-white font-bold text-[17px]">배우 검색</h1>
      </header>

      <div className="px-4 py-3 border-b border-zinc-200/60 dark:border-zinc-800/60">
        <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-900 rounded-full px-4 h-10 border border-zinc-200 dark:border-zinc-800 focus-within:border-sky-400 transition">
          <svg className="w-4 h-4 text-zinc-400 dark:text-zinc-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="배우 이름 검색"
            className="flex-1 min-w-0 bg-transparent outline-none text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500"
          />
        </div>
      </div>

      <main className="flex-1">
        {loading && <p className="text-zinc-400 dark:text-zinc-600 text-sm text-center py-16">불러오는 중…</p>}

        {!loading && !q && (
          <div className="flex flex-col items-center justify-center py-28 gap-3">
            <svg className="w-12 h-12 text-zinc-300 dark:text-zinc-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <p className="text-zinc-400 dark:text-zinc-600 text-sm">배우 이름을 검색하세요</p>
          </div>
        )}

        {!loading && q && results.length === 0 && (
          <p className="text-zinc-400 dark:text-zinc-600 text-sm text-center py-16">"{q}" 검색 결과가 없어요</p>
        )}

        {!loading && results.map((name) => (
          <button
            key={name}
            onClick={() => setSelected(name)}
            className="w-full flex items-center justify-between gap-3 px-4 py-3 border-b border-zinc-200/60 dark:border-zinc-800/60 hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition text-left"
          >
            <span className="text-zinc-900 dark:text-white font-medium truncate">{name}</span>
            <span className="text-zinc-400 dark:text-zinc-600 text-sm shrink-0">{actorMap.get(name)!.length}편</span>
          </button>
        ))}
      </main>
    </div>
  );
}
