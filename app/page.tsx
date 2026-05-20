'use client';
import { useState, useEffect, useCallback } from 'react';
import PostCard from '@/components/PostCard';
import CreatePostModal from '@/components/CreatePostModal';

interface Post {
  id: number;
  title: string;
  performance_date: string;
  viewing_count: number;
  casting_board: string | null;
  created_at: string;
  review_count: number;
}

export default function Home() {
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
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎭</span>
          <h1 className="text-white font-bold text-lg">StageRecord</h1>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-sky-500 hover:bg-sky-400 text-white font-bold rounded-full px-4 py-2 text-sm transition"
        >
          + 공연 기록
        </button>
      </header>

      {/* Feed */}
      <main className="flex-1">
        {loading && (
          <div className="flex justify-center items-center py-20 text-zinc-500">
            불러오는 중...
          </div>
        )}
        {!loading && posts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-zinc-500">
            <span className="text-5xl">🎭</span>
            <p className="text-lg font-medium">아직 기록된 공연이 없습니다</p>
            <p className="text-sm">상단의 버튼으로 첫 공연을 기록해보세요!</p>
          </div>
        )}
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onDelete={fetchPosts}
            showDelete
          />
        ))}
      </main>

      {showModal && (
        <CreatePostModal
          onClose={() => setShowModal(false)}
          onCreated={fetchPosts}
        />
      )}
    </div>
  );
}
