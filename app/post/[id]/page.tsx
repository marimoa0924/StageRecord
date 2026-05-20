'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import ReviewThread from '@/components/ReviewThread';

interface Post {
  id: number;
  title: string;
  performance_date: string;
  viewing_count: number;
  casting_board: string | null;
  created_at: string;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
}

function formatCreatedAt(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function PostPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPost = useCallback(async () => {
    const res = await fetch(`/api/posts/${id}`);
    if (!res.ok) { router.push('/'); return; }
    const data = await res.json();
    setPost(data);
    setLoading(false);
  }, [id, router]);

  useEffect(() => { fetchPost(); }, [fetchPost]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 text-zinc-500">불러오는 중...</div>
    );
  }

  if (!post) return null;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur border-b border-zinc-800 px-4 py-3 flex items-center gap-4">
        <button
          onClick={() => router.push('/')}
          className="text-white hover:text-zinc-400 text-xl transition"
        >
          ←
        </button>
        <h1 className="text-white font-bold">공연 상세</h1>
      </header>

      {/* Main post */}
      <article className="px-4 py-5 border-b border-zinc-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center text-white font-bold text-lg">
            🎭
          </div>
          <div>
            <p className="text-white font-bold">StageRecord</p>
            <p className="text-zinc-500 text-sm">@stagerecord</p>
          </div>
        </div>

        <h2 className="text-white text-2xl font-bold mb-3">{post.title}</h2>

        <div className="flex flex-wrap gap-3 mb-4 text-sm">
          <span className="bg-zinc-800 text-zinc-300 rounded-full px-3 py-1">
            📅 {formatDate(post.performance_date)}
          </span>
          <span className="bg-zinc-800 text-zinc-300 rounded-full px-3 py-1">
            👁 {post.viewing_count}회 관람
          </span>
        </div>

        {post.casting_board && (
          <div className="relative w-full rounded-2xl overflow-hidden border border-zinc-800 mb-4" style={{ aspectRatio: '16/9' }}>
            <Image
              src={post.casting_board}
              alt="캐스팅보드"
              fill
              className="object-contain bg-zinc-900"
            />
          </div>
        )}

        <p className="text-zinc-500 text-sm border-t border-zinc-800 pt-3">
          {formatCreatedAt(post.created_at)}
        </p>
      </article>

      {/* Reviews */}
      <ReviewThread postId={post.id} />
    </div>
  );
}
