'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import ReviewThread from '@/components/ReviewThread';
import { useOwner } from '@/lib/useOwner';

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
  const { isOwner } = useOwner();
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

  async function handleDelete() {
    if (!confirm('이 게시물을 삭제하시겠어요?')) return;
    await fetch(`/api/posts/${id}`, { method: 'DELETE' });
    router.push('/');
  }

  if (loading) {
    return <div className="flex justify-center items-center py-20 text-zinc-500">불러오는 중...</div>;
  }
  if (!post) return null;

  return (
    <div className="flex flex-col min-h-screen pb-16">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur border-b border-zinc-800 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => router.push('/')}
          className="text-white hover:text-zinc-400 text-xl transition min-w-[44px] min-h-[44px] flex items-center"
        >
          ←
        </button>
        <h1 className="text-white font-bold text-base">스레드</h1>
      </header>

      {/* Main post — same avatar-column layout as thread items */}
      <article className="flex gap-3 px-4 pt-4">
        <div className="flex flex-col items-center shrink-0">
          <div className="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center text-white text-lg shrink-0">
            🎭
          </div>
          {/* Thread line connecting down to reviews */}
          <div className="w-0.5 flex-1 bg-zinc-800 mt-1 min-h-[20px]" />
        </div>

        <div className="flex-1 min-w-0 pb-4">
          <div className="flex items-baseline gap-1.5">
            <span className="text-white font-bold">StageRecord</span>
            <span className="text-zinc-700 text-sm">·</span>
            <span className="text-zinc-500 text-sm">{formatCreatedAt(post.created_at)}</span>
            {isOwner && (
              <button
                onClick={handleDelete}
                className="ml-auto text-zinc-700 hover:text-red-500 text-xs transition min-h-[44px] flex items-center pl-2"
              >
                삭제
              </button>
            )}
          </div>

          <p className="text-white text-[17px] font-semibold leading-snug mt-0.5">{post.title}</p>

          <div className="flex gap-2 mt-2 flex-wrap">
            <span className="bg-zinc-800 text-zinc-300 text-xs rounded-full px-2.5 py-1">
              📅 {formatDate(post.performance_date)}
            </span>
            <span className="bg-zinc-800 text-zinc-300 text-xs rounded-full px-2.5 py-1">
              👁 {post.viewing_count}회 관람
            </span>
          </div>

          {post.casting_board && (
            <div className="mt-3 relative w-full rounded-2xl overflow-hidden border border-zinc-800" style={{ aspectRatio: '16/9' }}>
              <Image
                src={post.casting_board}
                alt="캐스팅보드"
                fill
                className="object-contain bg-zinc-900"
              />
            </div>
          )}
        </div>
      </article>

      <ReviewThread postId={post.id} isOwner={isOwner} />
    </div>
  );
}
