'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import ImageLightbox from '@/components/ImageLightbox';

function parseBulkThread(raw: string): string[] {
  const lines = raw.split('\n');
  const results: string[] = [];
  let current: string[] = [];
  let i = 0;

  while (i < lines.length) {
    // Detect 4-line Twitter header: Name / @handle / · / date
    const isHeader =
      i + 3 < lines.length &&
      lines[i].trim() !== '' &&
      !lines[i].startsWith('@') &&
      lines[i].trim() !== '·' &&
      lines[i + 1].startsWith('@') &&
      lines[i + 2].trim() === '·' &&
      lines[i + 3].trim() !== '';

    if (isHeader) {
      const text = current.join('\n').trim();
      if (text) results.push(text);
      current = [];
      i += 4;
    } else {
      current.push(lines[i]);
      i++;
    }
  }

  const text = current.join('\n').trim();
  if (text) results.push(text);

  return results;
}

interface Review {
  id: number;
  post_id: number;
  content: string;
  images: string;
  created_at: string;
  like_count?: number;
  liked_by_me?: number;
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
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (images.length === 0) return null;

  return (
    <>
      {images.length === 1 ? (
        <button
          type="button"
          onClick={() => setLightboxIndex(0)}
          className="mt-2 relative w-full rounded-xl overflow-hidden border border-zinc-200/80 dark:border-zinc-800/60 aspect-video bg-zinc-50 dark:bg-zinc-950 cursor-zoom-in block"
        >
          <Image src={images[0]} alt="" fill className="object-cover" />
        </button>
      ) : (
        <div className="mt-2 grid grid-cols-2 gap-0.5 rounded-xl overflow-hidden">
          {images.slice(0, 4).map((url, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setLightboxIndex(i)}
              className="relative aspect-square bg-zinc-100 dark:bg-zinc-950 cursor-zoom-in"
            >
              <Image src={url} alt="" fill className="object-cover" />
              {i === 3 && images.length > 4 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold pointer-events-none">
                  +{images.length - 4}
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {lightboxIndex !== null && (
        <ImageLightbox
          images={images}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  );
}

function ReviewLikeButton({
  postId, reviewId, initialCount, likedByMe,
}: {
  postId: number; reviewId: number; initialCount: number; likedByMe: boolean;
}) {
  const [liked, setLiked] = useState(likedByMe);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    if (loading) return;
    setLoading(true);
    const res = await fetch(`/api/posts/${postId}/reviews/${reviewId}/like`, { method: 'POST' });
    const data = await res.json();
    setLiked(data.liked);
    setCount(data.count);
    setLoading(false);
  }

  return (
    <button
      onClick={toggle}
      className={`flex items-center gap-1.5 text-[13px] transition min-h-[36px] ${liked ? 'text-pink-500' : 'text-zinc-400 dark:text-zinc-600 hover:text-pink-400'}`}
    >
      {liked ? (
        <svg className="w-[15px] h-[15px]" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      ) : (
        <svg className="w-[15px] h-[15px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      )}
      {count > 0 && <span>{count}</span>}
    </button>
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
  const [showBulk, setShowBulk] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [bulkSubmitting, setBulkSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Hide BottomNav while soft keyboard is open (works on both iOS and Android)
  useEffect(() => {
    if (!isOwner) return;
    return () => {
      window.dispatchEvent(new CustomEvent('compose-keyboard-close'));
    };
  }, [isOwner]);

  const fetchReviews = useCallback(async () => {
    const res = await fetch(`/api/posts/${postId}/reviews`);
    const data = await res.json();
    setReviews(Array.isArray(data) ? data : []);
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
      if (data.url) urls.push(data.url);
      else alert(`업로드 실패: ${data.error ?? '알 수 없는 오류'}`);
    }
    setPendingImages((prev) => [...prev, ...urls]);
    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
  }

  async function handleSubmit() {
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

  async function handleBulkSubmit() {
    const entries = parseBulkThread(bulkText);
    if (!entries.length) return;
    setBulkSubmitting(true);
    for (const entry of entries) {
      await fetch(`/api/posts/${postId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: entry, images: [] }),
      });
    }
    setBulkText('');
    setShowBulk(false);
    setBulkSubmitting(false);
    fetchReviews();
  }

  const hasContent = content.trim().length > 0 || pendingImages.length > 0;

  return (
    <div className={isOwner ? 'pb-24' : 'pb-4'}>
      {reviews.length === 0 && !isOwner && (
        <p className="text-zinc-400 dark:text-zinc-700 text-center py-10 text-sm">아직 후기가 없습니다.</p>
      )}

      {reviews.map((review, idx) => {
        const images = parseImages(review.images);
        const isLast = idx === reviews.length - 1;
        const showLine = !isLast || isOwner;

        return (
          <article key={review.id} className="flex gap-3 px-4 pt-4">
            {/* w-10 matches the avatar column width so thread lines stay aligned */}
            <div className="flex flex-col items-center shrink-0 w-10">
              <div className={`w-0.5 bg-zinc-200 dark:bg-zinc-800 ${showLine ? 'flex-1 min-h-full' : 'h-3'}`} />
            </div>

            <div className={`flex-1 min-w-0 pb-4 ${isLast && !isOwner ? 'border-b border-zinc-200/80 dark:border-zinc-800/60' : ''}`}>
              <div className="flex items-baseline gap-1.5">
                <span className="text-zinc-900 dark:text-white font-bold text-sm">주인장</span>
                <span className="text-zinc-300 dark:text-zinc-700 text-[13px]">·</span>
                <span className="text-zinc-400 dark:text-zinc-500 text-[13px]">{formatTime(review.created_at)}</span>
                {isOwner && (
                  <button
                    onClick={() => handleDelete(review.id)}
                    className="ml-auto text-zinc-400 dark:text-zinc-700 hover:text-red-500 text-xs transition min-h-[44px] flex items-center pl-3"
                  >
                    삭제
                  </button>
                )}
              </div>

              {review.content && (
                <p className="text-zinc-700 dark:text-[#e7e9ea] text-[15px] leading-relaxed whitespace-pre-wrap mt-0.5">
                  {review.content}
                </p>
              )}

              <ReviewImages images={images} />

              <div className="mt-2">
                <ReviewLikeButton
                  postId={postId}
                  reviewId={review.id}
                  initialCount={review.like_count ?? 0}
                  likedByMe={!!review.liked_by_me}
                />
              </div>
            </div>
          </article>
        );
      })}

      {showBulk && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm px-4 pb-6 sm:pb-0 sm:items-center">
          <div className="w-full max-w-[598px] bg-white dark:bg-zinc-950 rounded-3xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 pt-5 pb-2">
              <h2 className="font-bold text-zinc-900 dark:text-white text-[15px]">스레드 일괄 입력</h2>
              <button
                onClick={() => { setShowBulk(false); setBulkText(''); }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <p className="px-5 text-[13px] text-zinc-400 dark:text-zinc-500 mb-3">
              트위터 스레드를 그대로 붙여넣으면 트윗별로 나눠서 등록해요.
            </p>
            <textarea
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              placeholder={'진진\n@jin0_ojin\n·\nNov 5, 2025\n후기 내용...'}
              className="w-full px-5 py-3 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white text-sm resize-none outline-none h-44 border-t border-zinc-100 dark:border-zinc-800"
            />
            {bulkText.trim() && (() => {
              const parsed = parseBulkThread(bulkText);
              return parsed.length > 0 ? (
                <div className="px-5 py-3 border-t border-zinc-100 dark:border-zinc-800">
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-2">{parsed.length}개 항목 인식됨</p>
                  <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto">
                    {parsed.map((e, i) => (
                      <p key={i} className="text-xs text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900 rounded-xl px-3 py-2 whitespace-pre-wrap line-clamp-2">
                        {e}
                      </p>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="px-5 py-3 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-400 dark:text-zinc-500">
                  헤더(이름 / @핸들 / · / 날짜)를 인식하지 못했어요. 트위터에서 복사한 텍스트를 그대로 붙여넣어보세요.
                </p>
              );
            })()}
            <div className="px-5 py-4 flex gap-3">
              <button
                onClick={() => { setShowBulk(false); setBulkText(''); }}
                className="flex-1 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 font-medium text-[15px] transition hover:bg-zinc-50 dark:hover:bg-zinc-900"
              >
                취소
              </button>
              <button
                onClick={handleBulkSubmit}
                disabled={bulkSubmitting || parseBulkThread(bulkText).length === 0}
                className="flex-1 py-3 rounded-2xl bg-sky-500 hover:bg-sky-400 active:bg-sky-600 disabled:opacity-40 text-white font-bold text-[15px] transition"
              >
                {bulkSubmitting ? '등록 중...' : `${parseBulkThread(bulkText).length}개 게시`}
              </button>
            </div>
          </div>
        </div>
      )}

      {isOwner && (
        <div className="px-4">
          {/* Thread connector from last review */}
          <div className="flex gap-3">
            <div className="w-10 flex justify-center">
              <div className="w-0.5 h-3 bg-zinc-200 dark:bg-zinc-800" />
            </div>
          </div>

          {/* Compose row — avatar + textarea */}
          <div className="flex gap-3 pt-1">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center text-white text-lg shrink-0 shadow-sm">
              🎭
            </div>

            <div className="flex-1 min-w-0 pt-1.5">
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => { setContent(e.target.value); autoResize(); }}
                onFocus={() => window.dispatchEvent(new CustomEvent('compose-keyboard-open'))}
                onBlur={() => window.dispatchEvent(new CustomEvent('compose-keyboard-close'))}
                enterKeyHint="enter"
                placeholder={reviews.length === 0 ? '첫 번째 후기를 남겨보세요...' : '스레드에 추가...'}
                rows={2}
                className="w-full bg-transparent outline-none text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 resize-none leading-relaxed text-[17px]"
              />

              {pendingImages.length > 0 && (
                <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
                  {pendingImages.map((url, i) => (
                    <div key={i} className="relative w-20 h-20 shrink-0 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700">
                      <Image src={url} alt="" fill className="object-cover" />
                      <button
                        type="button"
                        onClick={() => setPendingImages((p) => p.filter((_, j) => j !== i))}
                        className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/70 rounded-full flex items-center justify-center text-white text-xs"
                      >✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action bar — media buttons left, 게시 button right */}
          <div className="flex gap-3 mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-900">
            <div className="w-10 shrink-0" />
            <div className="flex items-center flex-1 gap-0.5">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="text-sky-500 hover:bg-sky-500/10 rounded-full w-9 h-9 flex items-center justify-center transition"
                aria-label="사진 첨부"
              >
                {uploading ? (
                  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowBulk(true)}
                className="text-sky-500 hover:bg-sky-500/10 rounded-full w-9 h-9 flex items-center justify-center transition"
                aria-label="일괄 입력"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
                  <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
                </svg>
              </button>

              <div className="flex-1" />

              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || !hasContent}
                className="bg-sky-500 hover:bg-sky-400 active:bg-sky-600 disabled:opacity-40 text-white font-bold rounded-full px-5 py-2 text-[15px] transition"
              >
                {submitting ? '...' : '게시'}
              </button>
            </div>
          </div>

          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} />
        </div>
      )}
    </div>
  );
}
