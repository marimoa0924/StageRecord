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

function formatCreatedAt(iso: string) {
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
        <div className="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center text-white font-bold text-lg shrink-0">
          🎭
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white font-bold">StageRecord</span>
            <span className="text-zinc-500 text-sm">{formatCreatedAt(post.created_at)}</span>
            {isOwner && (
              <button
                onClick={handleDelete}
                className="ml-auto text-zinc-600 hover:text-red-500 text-xs transition p-1 min-h-[44px] flex items-center"
              >
                삭제
              </button>
            )}
          </div>

          <div className="mt-1">
            <span className="text-white text-base font-semibold">{post.title}</span>
          </div>

          <div className="flex gap-3 mt-1 text-sm text-zinc-400">
            <span>📅 {formatDate(post.performance_date)}</span>
            <span>👁 {post.viewing_count}회</span>
          </div>

          {post.casting_board && (
            <div className="mt-3 relative w-full rounded-2xl overflow-hidden border border-zinc-800" style={{ aspectRatio: '16/9' }}>
              <Image src={post.casting_board} alt="캐스팅보드" fill className="object-cover" />
            </div>
          )}

          <div className="mt-3 flex gap-5 text-zinc-500 text-sm">
            <span className="flex items-center gap-1">
              💬 <span>{post.review_count ?? 0}</span>
            </span>
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 transition min-h-[44px] px-1 -mx-1 ${liked ? 'text-pink-500' : 'hover:text-pink-400'}`}
            >
              {liked ? '❤️' : '🤍'} <span>{likeCount}</span>
            </button>
          </div>
        </div>
      </article>
    </Link>
  );
}
