'use client';
import Link from 'next/link';
import Image from 'next/image';

interface Post {
  id: number;
  title: string;
  performance_date: string;
  viewing_count: number;
  casting_board: string | null;
  created_at: string;
  review_count?: number;
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
  onDelete?: () => void;
  showDelete?: boolean;
}

export default function PostCard({ post, onDelete, showDelete }: Props) {
  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('이 게시물을 삭제하시겠어요?')) return;
    await fetch(`/api/posts/${post.id}`, { method: 'DELETE' });
    onDelete?.();
  }

  return (
    <Link href={`/post/${post.id}`} className="block">
      <article className="flex gap-3 px-4 py-4 border-b border-zinc-800 hover:bg-zinc-900/50 transition cursor-pointer">
        <div className="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center text-white font-bold text-lg shrink-0">
          🎭
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white font-bold">StageRecord</span>
            <span className="text-zinc-500 text-sm">{formatCreatedAt(post.created_at)}</span>
            {showDelete && (
              <button
                onClick={handleDelete}
                className="ml-auto text-zinc-600 hover:text-red-500 text-xs transition"
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
            <span>👁 {post.viewing_count}회 관람</span>
          </div>

          {post.casting_board && (
            <div className="mt-3 relative w-full rounded-2xl overflow-hidden border border-zinc-800" style={{ aspectRatio: '16/9' }}>
              <Image
                src={post.casting_board}
                alt="캐스팅보드"
                fill
                className="object-cover"
              />
            </div>
          )}

          <div className="mt-3 flex gap-6 text-zinc-500 text-sm">
            <span className="hover:text-sky-400 transition flex items-center gap-1">
              💬 <span>{post.review_count ?? 0}</span>
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
