'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { signIn, signOut } from 'next-auth/react';
import PostCard from '@/components/PostCard';
import { useOwner } from '@/lib/useOwner';
import Image from 'next/image';

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

export default function Home() {
  const { isOwner, user, loading: authLoading } = useOwner();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<'upload' | 'date'>('upload');
  const [refreshing, setRefreshing] = useState(false);
  const [pullProgress, setPullProgress] = useState(0); // 0→1 while pulling
  const rafId = useRef<number>(0);

  const fetchPosts = useCallback(async (currentSort = sort) => {
    try {
      const res = await fetch(`/api/posts${currentSort === 'date' ? '?sort=date' : ''}`);
      const data = await res.json();
      setPosts(Array.isArray(data) ? data : []);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [sort]);

  useEffect(() => { fetchPosts(sort); }, [fetchPosts, sort]);

  // Pull-to-refresh: track touch drag from the top of the page
  useEffect(() => {
    const THRESHOLD = 72; // px of pull needed to trigger refresh
    let pulling = false;
    let startY = 0;
    let lastDy = 0;

    function onTouchStart(e: TouchEvent) {
      if (window.scrollY > 0) return;
      startY = e.touches[0].clientY;
      pulling = true;
      lastDy = 0;
    }

    function onTouchMove(e: TouchEvent) {
      if (!pulling) return;
      const dy = e.touches[0].clientY - startY;
      if (dy <= 0) { lastDy = 0; setPullProgress(0); return; }
      lastDy = dy;
      cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(() => {
        setPullProgress(Math.min(dy / THRESHOLD, 1.4));
      });
    }

    function onTouchEnd() {
      if (!pulling) return;
      pulling = false;
      const dy = lastDy;
      lastDy = 0;
      setPullProgress(0);
      if (dy >= THRESHOLD) {
        setRefreshing(true);
        fetchPosts().finally(() => setRefreshing(false));
      }
    }

    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      cancelAnimationFrame(rafId.current);
    };
  }, [fetchPosts]);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-zinc-200/60 dark:border-zinc-800/60 px-4 h-14 flex items-center justify-between">
        <span className="text-zinc-900 dark:text-white font-bold text-[17px]">홈</span>
        <div className="flex items-center gap-2">
          {!authLoading && (
            user ? (
              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition min-h-[44px] px-1"
              >
                {user.image && (
                  <Image src={user.image} alt="프로필" width={30} height={30} className="rounded-full ring-1 ring-zinc-300 dark:ring-zinc-700" />
                )}
              </button>
            ) : (
              <button
                onClick={() => signIn('google')}
                className="text-sm font-medium text-zinc-400 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition min-h-[44px] px-2"
              >
                로그인
              </button>
            )
          )}
        </div>
      </header>

      {/* Sort tabs */}
      <div className="flex border-b border-zinc-200/80 dark:border-zinc-800/60">
        {(['upload', 'date'] as const).map((key) => {
          const label = key === 'upload' ? '업로드순' : '관람일순';
          const active = sort === key;
          return (
            <button
              key={key}
              onClick={() => setSort(key)}
              className={`flex-1 py-2.5 text-sm font-medium transition relative ${
                active
                  ? 'text-zinc-900 dark:text-white'
                  : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300'
              }`}
            >
              {label}
              {active && (
                <span className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-sky-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      <main className="flex-1">
        {/* Pull-to-refresh indicator */}
        <div
          className="flex justify-center items-center overflow-hidden transition-[height] duration-150"
          style={{ height: refreshing ? 48 : `${Math.min(pullProgress, 1) * 48}px` }}
        >
          <svg
            className={`w-5 h-5 transition-colors duration-150 ${pullProgress >= 1 || refreshing ? 'text-sky-500' : 'text-zinc-300 dark:text-zinc-700'} ${refreshing ? 'animate-spin' : ''}`}
            style={refreshing ? undefined : { transform: `rotate(${Math.min(pullProgress, 1) * 360}deg)` }}
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          >
            {refreshing
              ? <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              : <><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></>
            }
          </svg>
        </div>

        {loading && (
          <div className="flex flex-col gap-0">
            {[...Array(4)].map((_, i) => (
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

        {!loading && posts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-28 gap-4">
            <div className="text-5xl">🎭</div>
            <p className="text-zinc-600 dark:text-zinc-300 font-semibold text-base">아직 기록된 공연이 없습니다</p>
            {isOwner && (
              <p className="text-zinc-400 dark:text-zinc-600 text-sm">새 기록 버튼으로 첫 공연을 기록해보세요</p>
            )}
          </div>
        )}

        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            isOwner={isOwner}
            onDelete={fetchPosts}
          />
        ))}
      </main>
    </div>
  );
}
