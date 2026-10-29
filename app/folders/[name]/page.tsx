'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
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

const CHIKMUK = '찍먹극';

export default function FolderDetailPage() {
  const { name } = useParams<{ name: string }>();
  const router = useRouter();
  const { isOwner } = useOwner();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const title = decodeURIComponent(name);

  const fetchPosts = useCallback(async () => {
    try {
      const res = await fetch(`/api/folders/${encodeURIComponent(title)}`);
      const data = await res.json();
      setPosts(Array.isArray(data) ? data : []);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [title]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const isChinkmuk = title === CHIKMUK;

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-zinc-200/60 dark:border-zinc-800/60 px-4 h-14 flex items-center gap-2">
        <button
          onClick={() => router.back()}
          className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition min-w-[44px] min-h-[44px] flex items-center shrink-0"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
        </button>
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-lg">{isChinkmuk ? '⚡' : '🎭'}</span>
          <h1 className="text-zinc-900 dark:text-white font-bold text-[17px] truncate">{title}</h1>
        </div>
        {!loading && posts.length > 0 && (
          <span className="ml-auto text-zinc-400 dark:text-zinc-600 text-sm shrink-0">
            {isChinkmuk
              ? `${posts.length}개 작품`
              : `${posts.length}번 관람`}
          </span>
        )}
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

        {!loading && posts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-28 gap-3">
            <div className="text-5xl">📭</div>
            <p className="text-zinc-500 dark:text-zinc-500 text-sm">기록이 없습니다</p>
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
