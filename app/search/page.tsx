'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
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
}

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQ = searchParams.get('q') ?? '';

  const [query, setQuery] = useState(initialQ);
  const [results, setResults] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const { isOwner } = useOwner();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      setSearched(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setResults(Array.isArray(data) ? data : []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
        setSearched(true);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-zinc-200/60 dark:border-zinc-800/60 px-4 h-14 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition min-w-[44px] min-h-[44px] flex items-center shrink-0"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
        </button>

        <div className="flex-1 flex items-center gap-2 bg-zinc-100 dark:bg-zinc-900 rounded-full px-4 h-9 border border-zinc-200 dark:border-zinc-800 focus-within:border-sky-400 transition">
          <svg className="w-4 h-4 text-zinc-400 dark:text-zinc-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="공연 제목, 후기 내용 검색..."
            className="flex-1 bg-transparent outline-none text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 text-[15px]"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition shrink-0"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>
      </header>

      {/* Results */}
      <main className="flex-1">
        {/* Loading skeleton */}
        {loading && (
          <div className="flex flex-col">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-3 px-4 py-4 border-b border-zinc-200/60 dark:border-zinc-800/60 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 shrink-0" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="h-3.5 bg-zinc-200 dark:bg-zinc-800 rounded-full w-1/3" />
                  <div className="h-3.5 bg-zinc-200 dark:bg-zinc-800 rounded-full w-2/3" />
                  <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded-full w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty query */}
        {!loading && !query && (
          <div className="flex flex-col items-center justify-center py-28 gap-3">
            <svg className="w-12 h-12 text-zinc-300 dark:text-zinc-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <p className="text-zinc-400 dark:text-zinc-600 text-sm">공연 제목이나 후기 내용을 검색하세요</p>
          </div>
        )}

        {/* No results */}
        {!loading && searched && results.length === 0 && query && (
          <div className="flex flex-col items-center justify-center py-28 gap-3">
            <div className="text-4xl">🔍</div>
            <p className="text-zinc-600 dark:text-zinc-400 font-semibold text-base">검색 결과가 없습니다</p>
            <p className="text-zinc-400 dark:text-zinc-600 text-sm">"{query}"에 해당하는 기록이 없어요</p>
          </div>
        )}

        {/* Results */}
        {!loading && results.map((post) => (
          <PostCard key={post.id} post={post} isOwner={isOwner} />
        ))}
      </main>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchContent />
    </Suspense>
  );
}
