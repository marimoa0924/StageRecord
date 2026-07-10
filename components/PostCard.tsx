'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import ImageLightbox from '@/components/ImageLightbox';

interface Post {
  id: number;
  title: string;
  performance_date: string;
  viewing_count: number;
  casting_board: string | null;
  created_at: string;
  is_private?: boolean;
  review_count?: number;
  like_count?: number;
  liked_by_me?: number;
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

interface Props {
  post: Post;
  isOwner?: boolean;
  onDelete?: () => void;
}

export default function PostCard({ post, isOwner, onDelete }: Props) {
  const { data: session } = useSession();
  const [liked, setLiked] = useState(!!post.liked_by_me);
  const [likeCount, setLikeCount] = useState(post.like_count ?? 0);
  const [liking, setLiking] = useState(false);
  const [showLoginHint, setShowLoginHint] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('이 게시물을 삭제하시겠어요?')) return;
    await fetch(`/api/posts/${post.id}`, { method: 'DELETE' });
    onDelete?.();
  }

  async function handleLike(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (liking) return;

    if (!session?.user) {
      setShowLoginHint(true);
      setTimeout(() => setShowLoginHint(false), 3000);
      return;
    }

    setLiking(true);
    const res = await fetch(`/api/posts/${post.id}/like`, { method: 'POST' });
    if (res.status === 401) {
      setShowLoginHint(true);
      setTimeout(() => setShowLoginHint(false), 3000);
      setLiking(false);
      return;
    }
    const data = await res.json();
    setLiked(data.liked);
    setLikeCount(data.count);
    setLiking(false);
  }

  return (
    <Link href={`/post/${post.id}`} className="block">
      <article className="feed-card flex gap-3 px-4 py-4 border-b border-zinc-200/80 dark:border-zinc-800/60 cursor-pointer hover:bg-zinc-50 dark:hover:bg-white/[0.02]">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center text-white text-lg shrink-0 mt-0.5 shadow-sm">
          🎭
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-1.5">
            <span className="text-zinc-900 dark:text-white font-bold text-[15px]">주인장</span>
            <span className="text-zinc-300 dark:text-zinc-700 text-[13px]">·</span>
            <span className="text-zinc-400 dark:text-zinc-500 text-[13px]">{formatTime(post.created_at)}</span>
            {isOwner && (
              <button
                onClick={handleDelete}
                className="ml-auto text-zinc-400 dark:text-zinc-700 hover:text-red-500 text-xs transition min-h-[44px] flex items-center pl-3"
              >
                삭제
              </button>
            )}
          </div>

          <p className="text-zinc-800 dark:text-[#e7e9ea] font-semibold text-[15px] leading-snug mt-0.5 flex items-center gap-1.5">
            {post.title}
            {post.is_private && (
              <svg className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            )}
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

          {post.casting_board && (
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowLightbox(true); }}
              className="mt-3 relative w-full rounded-xl overflow-hidden border border-zinc-200/80 dark:border-zinc-800/60 bg-zinc-50 dark:bg-zinc-950 cursor-zoom-in block"
              style={{ aspectRatio: '16/9' }}
            >
              <Image src={post.casting_board} alt="캐스팅보드" fill className="object-contain" />
            </button>
          )}

          {showLightbox && post.casting_board && (
            <ImageLightbox
              images={[post.casting_board]}
              onClose={() => setShowLightbox(false)}
            />
          )}

          <div className="mt-3 flex items-center gap-5">
            <span className="flex items-center gap-1.5 text-zinc-400 dark:text-zinc-500 text-[13px]">
              <svg className="w-[17px] h-[17px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              {post.review_count ?? 0}
            </span>

            <div className="relative">
              <button
                onClick={handleLike}
                className={`flex items-center gap-1.5 text-[13px] transition -my-2 py-2 ${liked ? 'text-pink-500' : 'text-zinc-400 dark:text-zinc-500 hover:text-pink-400'}`}
              >
                {liked ? (
                  <svg className="w-[17px] h-[17px]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                ) : (
                  <svg className="w-[17px] h-[17px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                )}
                {likeCount}
              </button>

              {showLoginHint && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs rounded-lg px-3 py-2 shadow-lg pointer-events-none z-10">
                  <button
                    className="pointer-events-auto underline underline-offset-2"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); signIn('google'); }}
                  >
                    로그인
                  </button>
                  {' '}후 좋아요를 누를 수 있어요
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-900 dark:border-t-zinc-100" />
                </div>
              )}
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
