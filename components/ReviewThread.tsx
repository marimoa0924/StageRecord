'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';

interface Review {
  id: number;
  post_id: number;
  content: string;
  images: string; // JSON string
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

function parseImages(raw: string): string[] {
  try { return JSON.parse(raw) || []; } catch { return []; }
}

interface Props {
  postId: number;
  isOwner: boolean;
}

export default function ReviewThread({ postId, isOwner }: Props) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [content, setContent] = useState('');
  const [pendingImages, setPendingImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchReviews = useCallback(async () => {
    const res = await fetch(`/api/posts/${postId}/reviews`);
    const data = await res.json();
    setReviews(data);
  }, [postId]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  function autoResize() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    const urls: string[] = [];
    for (const file of files) {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      urls.push(data.url);
    }
    setPendingImages((prev) => [...prev, ...urls]);
    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() && pendingImages.length === 0) return;
    setSubmitting(true);
    await fetch(`/api/posts/${postId}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, images: pendingImages }),
    });
    setContent('');
    setPendingImages([]);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
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
    <div className="flex flex-col">
      {/* Reviews list */}
      <div className={isOwner ? 'pb-40' : 'pb-4'}>
        {reviews.length === 0 && (
          <p className="text-zinc-600 text-center py-10">
            {isOwner ? '첫 번째 후기를 남겨보세요!' : '아직 후기가 없습니다.'}
          </p>
        )}
        {reviews.map((review, idx) => {
          const images = parseImages(review.images);
          return (
            <article key={review.id} className="flex gap-3 px-4 py-4 border-b border-zinc-800">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center text-white font-bold shrink-0 text-sm">
                  {idx + 1}
                </div>
                {idx < reviews.length - 1 && (
                  <div className="w-0.5 flex-1 bg-zinc-700 mt-1 min-h-[20px]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-white font-bold text-sm">후기 #{idx + 1}</span>
                  <span className="text-zinc-500 text-xs">{formatCreatedAt(review.created_at)}</span>
                  {isOwner && (
                    <button
                      onClick={() => handleDelete(review.id)}
                      className="ml-auto text-zinc-600 hover:text-red-500 text-xs transition min-h-[44px] flex items-center px-1"
                    >
                      삭제
                    </button>
                  )}
                </div>
                {review.content && (
                  <p className="text-white mt-1 whitespace-pre-wrap leading-relaxed text-[15px]">
                    {review.content}
                  </p>
                )}
                {images.length > 0 && (
                  <div className={`mt-2 grid gap-2 ${images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                    {images.map((url, i) => (
                      <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-zinc-800">
                        <Image src={url} alt={`후기 이미지 ${i + 1}`} fill className="object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {/* Fixed bottom input (owner only) */}
      {isOwner && (
        <div className="fixed bottom-14 left-0 right-0 z-30 flex justify-center pointer-events-none">
          <div className="w-full max-w-xl pointer-events-auto">
            <form
              onSubmit={handleSubmit}
              className="bg-zinc-950 border-t border-zinc-800 px-4 pt-3 pb-safe"
            >
              {/* Image previews */}
              {pendingImages.length > 0 && (
                <div className="flex gap-2 mb-2 overflow-x-auto pb-1">
                  {pendingImages.map((url, i) => (
                    <div key={i} className="relative w-16 h-16 shrink-0 rounded-xl overflow-hidden border border-zinc-700">
                      <Image src={url} alt="첨부 이미지" fill className="object-cover" />
                      <button
                        type="button"
                        className="absolute top-0.5 right-0.5 bg-black/70 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                        onClick={() => setPendingImages((p) => p.filter((_, j) => j !== i))}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-end gap-2">
                {/* Camera button */}
                <button
                  type="button"
                  className="text-zinc-400 hover:text-sky-400 transition flex-shrink-0 mb-1 min-w-[44px] min-h-[44px] flex items-center justify-center"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? '⏳' : '📷'}
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  capture="environment"
                  className="hidden"
                  onChange={handleImageChange}
                />

                {/* Auto-growing textarea */}
                <textarea
                  ref={textareaRef}
                  className="flex-1 bg-zinc-900 border border-zinc-700 rounded-2xl px-4 py-3 text-white placeholder-zinc-600 resize-none outline-none focus:border-sky-500 text-[15px] leading-relaxed max-h-40 overflow-y-auto"
                  placeholder="후기를 남겨보세요..."
                  value={content}
                  rows={1}
                  onChange={(e) => { setContent(e.target.value); autoResize(); }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                      e.preventDefault();
                      if (content.trim() || pendingImages.length > 0) handleSubmit(e as unknown as React.FormEvent);
                    }
                  }}
                />

                <button
                  type="submit"
                  disabled={submitting || (!content.trim() && pendingImages.length === 0)}
                  className="bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-white font-bold rounded-full px-4 py-2.5 text-sm transition shrink-0 min-h-[44px]"
                >
                  {submitting ? '...' : '답글'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
