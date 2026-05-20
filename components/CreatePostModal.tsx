'use client';
import { useState, useRef } from 'react';
import Image from 'next/image';

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

export default function CreatePostModal({ onClose, onCreated }: Props) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [viewingCount, setViewingCount] = useState(1);
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    const data = await res.json();
    if (data.url) {
      setImageUrl(data.url);
    } else {
      alert(`업로드 실패: ${data.error ?? '알 수 없는 오류'}`);
    }
    setUploading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !date) return;
    setSubmitting(true);
    await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        performance_date: date,
        viewing_count: viewingCount,
        casting_board: imageUrl || null,
      }),
    });
    setSubmitting(false);
    onCreated();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg bg-zinc-950 border border-zinc-800 rounded-t-3xl sm:rounded-2xl mx-0 sm:mx-4 max-h-[92dvh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-9 h-1 bg-zinc-700 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800">
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition min-w-[44px] min-h-[44px] flex items-center justify-start"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          <h2 className="text-white font-bold text-[16px]">공연 기록 추가</h2>
          <div className="w-11" />
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-5 space-y-4">
          {/* Title */}
          <div>
            <label className="text-zinc-400 text-xs font-medium block mb-1.5 uppercase tracking-wide">극 제목 *</label>
            <input
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-sky-500 text-[15px] transition"
              placeholder="뮤지컬 제목을 입력하세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>

          {/* Date + Viewing count */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-zinc-400 text-xs font-medium block mb-1.5 uppercase tracking-wide">관람 날짜 *</label>
              <input
                type="date"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sky-500 text-[15px] transition"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="w-28">
              <label className="text-zinc-400 text-xs font-medium block mb-1.5 uppercase tracking-wide">관람 횟수</label>
              <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden focus-within:border-sky-500 transition">
                <button
                  type="button"
                  onClick={() => setViewingCount((v) => Math.max(1, v - 1))}
                  className="w-10 h-[50px] flex items-center justify-center text-zinc-400 hover:text-white text-xl transition"
                >−</button>
                <span className="flex-1 text-center text-white font-medium text-[15px]">{viewingCount}</span>
                <button
                  type="button"
                  onClick={() => setViewingCount((v) => v + 1)}
                  className="w-10 h-[50px] flex items-center justify-center text-zinc-400 hover:text-white text-xl transition"
                >+</button>
              </div>
            </div>
          </div>

          {/* Casting board */}
          <div>
            <label className="text-zinc-400 text-xs font-medium block mb-1.5 uppercase tracking-wide">캐스팅보드</label>
            <div
              className="w-full bg-zinc-900 border border-zinc-800 border-dashed rounded-xl cursor-pointer hover:border-sky-500 transition overflow-hidden"
              onClick={() => fileRef.current?.click()}
            >
              {imageUrl ? (
                <div className="relative w-full aspect-video">
                  <Image src={imageUrl} alt="캐스팅보드" fill className="object-contain" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition flex items-center justify-center">
                    <span className="text-white text-sm font-medium">변경</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 py-8 text-zinc-600">
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                  <span className="text-sm">{uploading ? '업로드 중...' : '탭하여 사진 업로드'}</span>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </div>

          <button
            type="submit"
            disabled={submitting || !title || !date}
            className="w-full bg-sky-500 hover:bg-sky-400 active:bg-sky-600 disabled:opacity-40 text-white font-bold rounded-full py-4 transition text-[15px]"
          >
            {submitting ? '저장 중...' : '게시하기'}
          </button>
        </form>
      </div>
    </div>
  );
}
