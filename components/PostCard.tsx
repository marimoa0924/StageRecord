'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import ImageLightbox from '@/components/ImageLightbox';
import EditPostModal from '@/components/EditPostModal';

interface Post {
  id: number;
  title: string;
  performance_date: string;
  viewing_count: number;
  casting_board: string | null;
  created_at: string;
  review_count?: number;
  price?: number | null;
  actors?: string;
}

function parseActors(raw?: string | null): string[] {
  try { const v = JSON.parse(raw || '[]'); return Array.isArray(v) ? v : []; } catch { return []; }
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
  const [showLightbox, setShowLightbox] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('이 게시물을 삭제하시겠어요?')) return;
    await fetch(`/api/posts/${post.id}`, { method: 'DELETE' });
    onDelete?.();
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
              <div className="ml-auto flex items-center">
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowEdit(true); }}
                  className="text-zinc-400 dark:text-zinc-700 hover:text-sky-500 text-xs transition min-h-[44px] flex items-center px-2"
                >
                  수정
                </button>
                <button
                  onClick={handleDelete}
                  className="text-zinc-400 dark:text-zinc-700 hover:text-red-500 text-xs transition min-h-[44px] flex items-center pl-2"
                >
                  삭제
                </button>
              </div>
            )}
          </div>

          <p className="text-zinc-800 dark:text-[#e7e9ea] font-semibold text-[15px] leading-snug mt-0.5">{post.title}</p>

          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            <span className="inline-flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 text-xs rounded-full px-2.5 py-1 border border-zinc-200/80 dark:border-zinc-800/60">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              {formatDate(post.performance_date)}
            </span>
            <span className="inline-flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 text-xs rounded-full px-2.5 py-1 border border-zinc-200/80 dark:border-zinc-800/60">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              {post.viewing_count}회 관람
            </span>
            {post.price != null && (
              <span className="inline-flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 text-xs rounded-full px-2.5 py-1 border border-zinc-200/80 dark:border-zinc-800/60">
                ₩ {post.price.toLocaleString('ko-KR')}
              </span>
            )}
          </div>

          {parseActors(post.actors).length > 0 && (
            <div className="flex gap-1.5 mt-2 flex-wrap">
              {parseActors(post.actors).map((a) => (
                <span key={a} className="inline-flex items-center bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-300 text-xs rounded-full px-2.5 py-1">
                  {a}
                </span>
              ))}
            </div>
          )}

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

          {showEdit && (
            <EditPostModal
              post={post}
              onClose={() => setShowEdit(false)}
              onSaved={() => { setShowEdit(false); onDelete?.(); }}
            />
          )}

          <div className="mt-3 flex items-center gap-5">
            <span className="flex items-center gap-1.5 text-zinc-400 dark:text-zinc-500 text-[13px]">
              <svg className="w-[17px] h-[17px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              {post.review_count ?? 0}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
