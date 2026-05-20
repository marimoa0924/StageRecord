'use client';
import { useState, useEffect, useCallback } from 'react';
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

      <main className="flex-1">
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
