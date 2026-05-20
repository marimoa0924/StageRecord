'use client';
import { useState, useEffect, useCallback } from 'react';
import { signIn, signOut } from 'next-auth/react';
import PostCard from '@/components/PostCard';
import CreatePostModal from '@/components/CreatePostModal';
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
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    const res = await fetch('/api/posts');
    const data = await res.json();
    setPosts(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  return (
    <div className="flex flex-col min-h-screen pb-16">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
        <span className="text-white font-bold text-[17px]">홈</span>
        <div className="flex items-center gap-2">
          {!authLoading && (
            user ? (
              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 text-zinc-400 hover:text-white text-sm transition min-h-[44px] px-2"
              >
                {user.image && (
                  <Image src={user.image} alt="프로필" width={28} height={28} className="rounded-full" />
                )}
                <span className="hidden sm:inline text-xs">{isOwner ? '오너' : '방문자'}</span>
              </button>
            ) : (
              <button
                onClick={() => signIn('google')}
                className="text-zinc-400 hover:text-white text-sm transition min-h-[44px] px-2"
              >
                로그인
              </button>
            )
          )}
        </div>
      </header>

      {/* Feed */}
      <main className="flex-1">
        {loading && (
          <div className="flex justify-center items-center py-20 text-zinc-500 text-sm">
            불러오는 중...
          </div>
        )}
        {!loading && posts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-zinc-500">
            <span className="text-5xl">🎭</span>
            <p className="text-base font-medium">아직 기록된 공연이 없습니다</p>
            {isOwner && <p className="text-sm text-zinc-600">아래 버튼으로 첫 공연을 기록해보세요!</p>}
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

      {/* FAB (owner only) */}
      {isOwner && (
        <button
          onClick={() => setShowModal(true)}
          className="fixed bottom-20 right-4 z-30 w-14 h-14 bg-sky-500 hover:bg-sky-400 active:bg-sky-600 text-white rounded-full shadow-lg flex items-center justify-center text-2xl transition"
          aria-label="공연 기록 추가"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
          </svg>
        </button>
      )}

      {showModal && (
        <CreatePostModal
          onClose={() => setShowModal(false)}
          onCreated={fetchPosts}
        />
      )}
    </div>
  );
}
