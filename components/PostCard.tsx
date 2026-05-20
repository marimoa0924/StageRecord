'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

interface Post {
  id: number;
  title: string;
  performance_date: string;
  viewing_count: number;
  casting_board: string | null;
  created_at: string;
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
  const [liked, setLiked] = useState(!!post.liked_by_me);
  const [likeCount, setLikeCount] = useState(post.like_count ?? 0);
  const [liking, setLiking] = useState(false);

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
    setLiking(true);
    const res = await fetch(`/api/posts/${post.id}/like`, { method: 'POST' });
    const data = await res.json();
    setLiked(data.liked);
    setLikeCount(data.count);
    setLiking(false);
  }

  return (
    <Link href={`/post/${post.id}`} className="block">
      <article className="flex gap-3 px-4 py-4 border-b border-zinc-800 hover:bg-zinc-900/50 active:bg-zinc-900 transition cursor-pointer">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center text-white text-lg shrink-0 mt-0.5">
          🎭
        </div>

        <div className="flex-1 min-w-0">
          {/* Name row */}
          <div className="flex items-baseline gap-1.5">
            <span className="text-white font-bold text-sm leading-tight">StageRecord</span>
            <span className="text-zinc-700 text-[13px]">·</span>
            <span className="text-zinc-500 text-[13px]">{formatTime(post.created_at)}</span>
            {isOwner && (
              <button
                onClick={handleDelete}
                className="ml-auto text-zinc-700 hover:text-red-500 text-xs transition min-h-[44px] flex items-center pl-2"
              >
                삭제
              </button>
            )}
          </div>

          {/* Title */}
          <p className="text-white font-semibold text-[15px] leading-snug mt-0.5">{post.title}</p>

          {/* Badges */}
          <div className="flex gap-2 mt-1.5 flex-wrap">
            <span className="text-zinc-500 text-[13px]">📅 {formatDate(post.performance_date)}</span>
            <span className="text-zinc-500 text-[13px]">·</span>
            <span className="text-zinc-500 text-[13px]">👁 {post.viewing_count}회</span>
          </div>

          {/* Casting board */}
          {post.casting_board && (
            <div className="mt-3 relative w-full rounded-2xl overflow-hidden border border-zinc-800" style={{ aspectRatio: '16/9' }}>
              <Image src={post.casting_board} alt="캐스팅보드" fill className="object-cover" />
            </div>
          )}

          {/* Actions */}
          <div className="mt-3 flex gap-5 text-zinc-500 text-sm">
            <span className="flex items-center gap-1.5 text-[13px]">
              <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              {post.review_count ?? 0}
            </span>
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 text-[13px] transition min-h-[44px] -my-3 ${liked ? 'text-pink-500' : 'hover:text-pink-400'}`}
            >
              {liked ? (
                <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              ) : (
                <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              )}
              {likeCount}
            </button>
          </div>
        </div>
      </article>
    </Link>
  );
}
