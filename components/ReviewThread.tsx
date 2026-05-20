'use client';
import { useState, useEffect, useCallback } from 'react';

interface Review {
  id: number;
  post_id: number;
  content: string;
  created_at: string;
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
  postId: number;
}

export default function ReviewThread({ postId }: Props) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchReviews = useCallback(async () => {
    const res = await fetch(`/api/posts/${postId}/reviews`);
    const data = await res.json();
    setReviews(data);
  }, [postId]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    await fetch(`/api/posts/${postId}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });
    setContent('');
    setSubmitting(false);
    fetchReviews();
  }

  async function handleDelete(reviewId: number) {
    if (!confirm('이 후기를 삭제하시겠어요?')) return;
    await fetch(`/api/posts/${postId}/reviews`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviewId }),
    });
    fetchReviews();
  }

  return (
    <div>
      {/* Reply input */}
      <div className="flex gap-3 px-4 py-4 border-b border-zinc-800">
        <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center text-white font-bold shrink-0">
          ✍️
        </div>
        <form onSubmit={handleSubmit} className="flex-1">
          <textarea
            className="w-full bg-transparent text-white placeholder-zinc-600 text-lg resize-none outline-none min-h-[80px]"
            placeholder="후기를 남겨보세요..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
          />
          <div className="flex justify-end mt-2">
            <button
              type="submit"
              disabled={submitting || !content.trim()}
              className="bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-white font-bold rounded-full px-5 py-2 text-sm transition"
            >
              {submitting ? '게시 중...' : '답글'}
            </button>
          </div>
        </form>
      </div>

      {/* Reviews */}
      <div>
        {reviews.length === 0 && (
          <p className="text-zinc-600 text-center py-10">아직 후기가 없습니다. 첫 번째 후기를 남겨보세요!</p>
        )}
        {reviews.map((review, idx) => (
          <article key={review.id} className="flex gap-3 px-4 py-4 border-b border-zinc-800 hover:bg-zinc-900/30 transition">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center text-white font-bold shrink-0">
                {(idx + 1)}
              </div>
              {idx < reviews.length - 1 && (
                <div className="w-0.5 flex-1 bg-zinc-700 mt-1 min-h-[20px]" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-white font-bold">후기 #{idx + 1}</span>
                <span className="text-zinc-500 text-sm">{formatCreatedAt(review.created_at)}</span>
                <button
                  onClick={() => handleDelete(review.id)}
                  className="ml-auto text-zinc-600 hover:text-red-500 text-xs transition"
                >
                  삭제
                </button>
              </div>
              <p className="text-white mt-1 whitespace-pre-wrap leading-relaxed">{review.content}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
