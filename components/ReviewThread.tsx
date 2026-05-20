'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';

interface Review {
  id: number;
  post_id: number;
  content: string;
  images: string;
  created_at: string;
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

function parseImages(raw: string): string[] {
  try { return JSON.parse(raw) || []; } catch { return []; }
}

function ReviewImages({ images }: { images: string[] }) {
  if (images.length === 0) return null;
  if (images.length === 1) {
    return (
      <div className="mt-2 relative w-full rounded-2xl overflow-hidden border border-zinc-800 aspect-video bg-zinc-900">
        <Image src={images[0]} alt="" fill className="object-cover" />
      </div>
    );
  }
  return (
    <div className={`mt-2 grid gap-0.5 rounded-2xl overflow-hidden ${images.length <= 2 ? 'grid-cols-2' : 'grid-cols-2'}`}>
      {images.slice(0, 4).map((url, i) => (
        <div key={i} className="relative aspect-square bg-zinc-900">
          <Image src={url} alt="" fill className="object-cover" />
          {i === 3 && images.length > 4 && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-lg">
              +{images.length - 4}
            </div>
          )}
        </div>
      ))}
    </div>
  );
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

  const hasContent = content.trim().length > 0 || pendingImages.length > 0;

  return (
    <div className={isOwner ? 'pb-36' : 'pb-4'}>
      {reviews.length === 0 && !isOwner && (
        <p className="text-zinc-600 text-center py-10 text-sm">아직 후기가 없습니다.</p>
      )}

      {reviews.map((review, idx) => {
        const images = parseImages(review.images);
        const isLast = idx === reviews.length - 1;
        const showLine = !isLast || isOwner;

        return (
          <article key={review.id} className="flex gap-3 px-4 pt-4">
            <div className="flex flex-col items-center shrink-0">
              <div className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center text-white shrink-0">
                🎭
              </div>
              {showLine && (
                <div className="w-0.5 flex-1 bg-zinc-800 mt-1 min-h-[16px]" />
              )}
            </div>

            <div className={`flex-1 min-w-0 pb-4 ${isLast && !isOwner ? 'border-b border-zinc-800' : ''}`}>
              <div className="flex items-baseline gap-1.5">
                <span className="text-white font-bold text-sm">StageRecord</span>
                <span className="text-zinc-700 text-[13px]">·</span>
                <span className="text-zinc-500 text-[13px]">{formatTime(review.created_at)}</span>
                {isOwner && (
                  <button
                    onClick={() => handleDelete(review.id)}
                    className="ml-auto text-zinc-700 hover:text-red-500 text-xs transition min-h-[44px] flex items-center pl-2"
                  >
                    삭제
                  </button>
                )}
              </div>
              {review.content && (
                <p className="text-white text-[15px] leading-relaxed whitespace-pre-wrap mt-0.5">
                  {review.content}
                </p>
              )}
              <ReviewImages images={images} />
            </div>
          </article>
        );
      })}

      {/* Twitter-style compose bar — fixed above bottom nav */}
      {isOwner && (
        <div className="fixed bottom-14 left-0 right-0 z-30 flex justify-center pointer-events-none">
          <div className="w-full max-w-xl pointer-events-auto bg-zinc-950 border-t border-zinc-800">

            {pendingImages.length > 0 && (
              <div className="flex gap-2 px-4 pt-3 overflow-x-auto">
                {pendingImages.map((url, i) => (
                  <div key={i} className="relative w-16 h-16 shrink-0 rounded-xl overflow-hidden border border-zinc-700">
                    <Image src={url} alt="" fill className="object-cover" />
                    <button
                      type="button"
                      onClick={() => setPendingImages((p) => p.filter((_, j) => j !== i))}
                      className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/80 rounded-full flex items-center justify-center text-white text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-3 px-4 py-2.5">
              <div className="w-9 h-9 rounded-full bg-sky-500 shrink-0 flex items-center justify-center text-white text-sm">
                🎭
              </div>
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => { setContent(e.target.value); autoResize(); }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                    e.preventDefault();
                    if (hasContent) handleSubmit(e as unknown as React.FormEvent);
                  }
                }}
                placeholder={reviews.length === 0 ? '첫 번째 후기를 남겨보세요...' : '스레드에 추가...'}
                rows={1}
                className="flex-1 bg-transparent outline-none text-white text-[15px] placeholder-zinc-600 resize-none leading-normal max-h-32 overflow-y-auto py-2"
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="text-sky-400 hover:bg-sky-400/10 rounded-full w-9 h-9 flex items-center justify-center transition text-lg shrink-0"
                aria-label="사진 첨부"
              >
                {uploading ? '⏳' : '📷'}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageChange}
              />
              <button
                onClick={handleSubmit}
                disabled={submitting || !hasContent}
                className="bg-sky-500 hover:bg-sky-400 active:bg-sky-600 disabled:opacity-40 text-white font-bold rounded-full px-4 py-1.5 text-sm transition shrink-0 min-h-[36px]"
              >
                {submitting ? '...' : '게시'}
              </button>
            </div>
            <div className="pb-safe" />
          </div>
        </div>
      )}
    </div>
  );
}
