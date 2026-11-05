'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import PostCard from '@/components/PostCard';
import { useOwner } from '@/lib/useOwner';

interface Post {
  id: number;
  title: string;
  performance_date: string;
  viewing_count: number;
  casting_board: string | null;
  created_at: string;
  review_count: number;
  like_count: number;
  liked_by_me: number;
  price?: number | null;
  actors?: string;
}

function parseActors(raw?: string | null): string[] {
  try { const v = JSON.parse(raw || '[]'); return Array.isArray(v) ? v : []; } catch { return []; }
}

export default function ActorsPage() {
  const router = useRouter();
  const { isOwner } = useOwner();
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

  // 배우 → 출연 기록 목록
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

  const names = useMemo(
    () => [...actorMap.keys()].sort((a, b) => a.localeCompare(b, 'ko')),
    [actorMap],
  );
  const q = query.trim();
  const filtered = q ? names.filter((n) => n.includes(q)) : names;

  // ── 배우 상세 ──
  if (selected) {
    const list = actorMap.get(selected) ?? [];
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
          {list.map((post) => (
            <PostCard key={post.id} post={post} isOwner={isOwner} onDelete={fetchPosts} />
          ))}
        </main>
      </div>
    );
  }

  // ── 배우 목록 ──
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
        <h1 className="text-zinc-900 dark:text-white font-bold text-[17px]">배우</h1>
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
        {loading && (
          <div className="flex flex-col">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="px-4 py-3 border-b border-zinc-200/60 dark:border-zinc-800/60 animate-pulse">
                <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded-full w-1/3" />
              </div>
            ))}
          </div>
        )}

        {!loading && names.length === 0 && (
          <div className="flex flex-col items-center justify-center py-28 gap-3">
            <div className="text-5xl">🎭</div>
            <p className="text-zinc-600 dark:text-zinc-400 font-semibold">아직 기록된 배우가 없어요</p>
            <p className="text-zinc-400 dark:text-zinc-600 text-sm">기록에 배우를 추가하면 여기 모입니다</p>
          </div>
        )}

        {!loading && names.length > 0 && filtered.length === 0 && (
          <p className="text-zinc-400 dark:text-zinc-600 text-sm text-center py-16">"{q}" 검색 결과가 없어요</p>
        )}

        {!loading && filtered.map((name) => (
          <button
            key={name}
            onClick={() => setSelected(name)}
            className="w-full flex items-center justify-between gap-3 px-4 py-3 border-b border-zinc-200/60 dark:border-zinc-800/60 hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition text-left"
          >
            <span className="flex items-center gap-3 min-w-0">
              <span className="w-9 h-9 rounded-full bg-sky-100 dark:bg-sky-500/15 text-sky-700 dark:text-sky-300 flex items-center justify-center text-sm font-bold shrink-0">
                {name[0]}
              </span>
              <span className="text-zinc-900 dark:text-white font-medium truncate">{name}</span>
            </span>
            <span className="text-zinc-400 dark:text-zinc-600 text-sm shrink-0">{actorMap.get(name)!.length}편</span>
          </button>
        ))}
      </main>
    </div>
  );
}
