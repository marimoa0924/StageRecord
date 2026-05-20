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
    return (
      <div className="flex flex-col min-h-screen">
        <header className="sticky top-0 z-40 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-zinc-200/60 dark:border-zinc-800/60 px-4 h-14 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          <div className="h-4 w-16 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
        </header>
        <div className="flex gap-3 px-4 pt-5 animate-pulse">
          <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 shrink-0" />
          <div className="flex-1 space-y-3 pt-1">
            <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded-full w-1/3" />
            <div className="h-5 bg-zinc-200 dark:bg-zinc-800 rounded-full w-3/4" />
            <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded-full w-1/2" />
          </div>
        </div>
      </div>
    );
  }
  if (!post) return null;

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-zinc-200/60 dark:border-zinc-800/60 px-4 h-14 flex items-center gap-2">
        <button
          onClick={() => router.back()}
          className="text-zinc-700 dark:text-white hover:text-zinc-400 transition min-w-[44px] min-h-[44px] flex items-center"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
        </button>
        <h1 className="text-zinc-900 dark:text-white font-bold text-[17px]">스레드</h1>
      </header>

      <article className="flex gap-3 px-4 pt-4">
        <div className="flex flex-col items-center shrink-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center text-white text-lg shrink-0 shadow-sm">
            🎭
          </div>
          <div className="w-0.5 flex-1 bg-zinc-200 dark:bg-zinc-800 mt-1.5 min-h-[24px]" />
        </div>

        <div className="flex-1 min-w-0 pb-4">
          <div className="flex items-baseline gap-1.5">
            <span className="text-zinc-900 dark:text-white font-bold text-[15px]">주인장</span>
            <span className="text-zinc-300 dark:text-zinc-700 text-[13px]">·</span>
            <span className="text-zinc-400 dark:text-zinc-500 text-[13px]">{formatCreatedAt(post.created_at)}</span>
            {isOwner && (
              <button
                onClick={handleDelete}
                className="ml-auto text-zinc-400 dark:text-zinc-700 hover:text-red-500 text-xs transition min-h-[44px] flex items-center pl-3"
              >
                삭제
              </button>
            )}
          </div>

          <p className="text-zinc-800 dark:text-[#e7e9ea] font-semibold text-[17px] leading-snug mt-0.5">{post.title}</p>

          <div className="flex gap-2 mt-2.5 flex-wrap">
            <span className="inline-flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 text-xs rounded-full px-2.5 py-1 border border-zinc-200/80 dark:border-zinc-800/60">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              {formatDate(post.performance_date)}
            </span>
            <span className="inline-flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 text-xs rounded-full px-2.5 py-1 border border-zinc-200/80 dark:border-zinc-800/60">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              {post.viewing_count}회 관람
            </span>
          </div>

          {post.casting_board && (
            <div className="mt-3 relative w-full rounded-xl overflow-hidden border border-zinc-200/80 dark:border-zinc-800/60 bg-zinc-50 dark:bg-zinc-950" style={{ aspectRatio: '16/9' }}>
              <Image src={post.casting_board} alt="캐스팅보드" fill className="object-contain" />
            </div>
          )}
        </div>
      </article>

      <ReviewThread postId={post.id} isOwner={isOwner} />
    </div>
  );
}
