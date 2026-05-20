'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useOwner } from '@/lib/useOwner';

interface MatchingReview {
  id: number;
  content: string;
  created_at: string;
}

interface SearchPost {
  id: number;
  title: string;
  performance_date: string;
  viewing_count: number;
  casting_board: string | null;
  created_at: string;
  review_count: number;
  like_count: number;
  liked_by_me: number;
  matching_reviews: MatchingReview[];
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
}

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = (now.getTime() - d.getTime()) / 1000;
  if (diff < 60) return '방금 전';
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  return d.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });
}

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="bg-yellow-200 dark:bg-yellow-500/30 text-inherit rounded px-0.5 not-italic">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

function SearchResultCard({ post, query }: { post: SearchPost; query: string }) {
  const reviews = Array.isArray(post.matching_reviews) ? post.matching_reviews : [];
  const hasMatchingReviews = reviews.length > 0;

  return (
    <Link href={`/post/${post.id}`} className="block">
      <article className="feed-card px-4 py-4 border-b border-zinc-200/80 dark:border-zinc-800/60 hover:bg-zinc-50 dark:hover:bg-white/[0.02] cursor-pointer">
        {/* Post header row */}
        <div className="flex gap-3">
          <div className="flex flex-col items-center shrink-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center text-white text-lg shadow-sm">
              🎭
            </div>
            {hasMatchingReviews && (
              <div className="w-0.5 flex-1 bg-zinc-200 dark:bg-zinc-800 mt-1.5 min-h-[16px]" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-1.5">
              <span className="text-zinc-900 dark:text-white font-bold text-[15px]">주인장</span>
              <span className="text-zinc-300 dark:text-zinc-700 text-[13px]">·</span>
              <span className="text-zinc-400 dark:text-zinc-500 text-[13px]">{formatTime(post.created_at)}</span>
            </div>

            <p className="text-zinc-800 dark:text-[#e7e9ea] font-semibold text-[15px] leading-snug mt-0.5">
              <Highlight text={post.title} query={query} />
            </p>

            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <span className="inline-flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 text-xs rounded-full px-2.5 py-1 border border-zinc-200/80 dark:border-zinc-800/60">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                {formatDate(post.performance_date)}
              </span>
              <span className="inline-flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 text-xs rounded-full px-2.5 py-1 border border-zinc-200/80 dark:border-zinc-800/60">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                {post.viewing_count}회 관람
              </span>
            </div>

            {post.casting_board && !hasMatchingReviews && (
              <div className="mt-3 relative w-full rounded-xl overflow-hidden border border-zinc-200/80 dark:border-zinc-800/60 bg-zinc-50 dark:bg-zinc-950" style={{ aspectRatio: '16/9' }}>
                <Image src={post.casting_board} alt="캐스팅보드" fill className="object-contain" />
              </div>
            )}
          </div>
        </div>

        {/* Matching review threads */}
        {hasMatchingReviews && reviews.map((review, idx) => {
          const isLast = idx === reviews.length - 1;
          return (
            <div key={review.id} className="flex gap-3 mt-0">
              {/* Thread connector */}
              <div className="flex flex-col items-center shrink-0 w-10">
                <div className={`w-0.5 bg-zinc-200 dark:bg-zinc-800 ${isLast ? 'h-4' : 'flex-1 min-h-full'}`} />
              </div>

              <div className={`flex-1 min-w-0 pt-3 ${isLast ? 'pb-1' : 'pb-3'}`}>
                <div className="flex items-baseline gap-1.5 mb-1">
                  <span className="text-zinc-600 dark:text-zinc-400 font-semibold text-xs">주인장</span>
                  <span className="text-zinc-300 dark:text-zinc-700 text-[11px]">·</span>
                  <span className="text-zinc-400 dark:text-zinc-500 text-[11px]">{formatTime(review.created_at)}</span>
                </div>
                <p className="text-zinc-600 dark:text-zinc-300 text-[14px] leading-relaxed whitespace-pre-wrap line-clamp-3">
                  <Highlight text={review.content} query={query} />
                </p>
              </div>
            </div>
          );
        })}

        {/* Actions */}
        <div className="mt-3 flex items-center gap-5 pl-[52px]">
          <span className="flex items-center gap-1.5 text-zinc-400 dark:text-zinc-500 text-[13px]">
            <svg className="w-[17px] h-[17px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            {post.review_count}
          </span>
          <span className={`flex items-center gap-1.5 text-[13px] ${post.liked_by_me ? 'text-pink-500' : 'text-zinc-400 dark:text-zinc-500'}`}>
            <svg className="w-[17px] h-[17px]" viewBox="0 0 24 24" fill={post.liked_by_me ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.75">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            {post.like_count}
          </span>
        </div>
      </article>
    </Link>
  );
}

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQ = searchParams.get('q') ?? '';

  const [query, setQuery] = useState(initialQ);
  const [results, setResults] = useState<SearchPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    const q = query.trim();
    if (!q) { setResults([]); setSearched(false); setLoading(false); return; }
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

      <main className="flex-1">
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

        {!loading && !query && (
          <div className="flex flex-col items-center justify-center py-28 gap-3">
            <svg className="w-12 h-12 text-zinc-300 dark:text-zinc-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <p className="text-zinc-400 dark:text-zinc-600 text-sm">공연 제목이나 후기 내용을 검색하세요</p>
          </div>
        )}

        {!loading && searched && results.length === 0 && query && (
          <div className="flex flex-col items-center justify-center py-28 gap-3">
            <div className="text-4xl">🔍</div>
            <p className="text-zinc-600 dark:text-zinc-400 font-semibold text-base">검색 결과가 없습니다</p>
            <p className="text-zinc-400 dark:text-zinc-600 text-sm">"{query}"에 해당하는 기록이 없어요</p>
          </div>
        )}

        {!loading && results.map((post) => (
          <SearchResultCard key={post.id} post={post} query={query} />
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
