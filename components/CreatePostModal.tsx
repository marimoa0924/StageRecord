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
    setImageUrl(data.url);
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
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-black border border-zinc-700 rounded-2xl p-6 mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <button onClick={onClose} className="text-white hover:text-zinc-400 text-xl font-bold">✕</button>
          <h2 className="text-white font-bold text-lg">공연 기록 추가</h2>
          <div className="w-6" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-zinc-400 text-sm block mb-1">극 제목 *</label>
            <input
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-sky-500"
              placeholder="뮤지컬 이름을 입력하세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-zinc-400 text-sm block mb-1">관람 날짜 *</label>
              <input
                type="date"
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sky-500"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="w-36">
              <label className="text-zinc-400 text-sm block mb-1">관람 횟수</label>
              <input
                type="number"
                min={1}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sky-500"
                value={viewingCount}
                onChange={(e) => setViewingCount(Number(e.target.value))}
              />
            </div>
          </div>

          <div>
            <label className="text-zinc-400 text-sm block mb-1">캐스팅보드</label>
            <div
              className="w-full bg-zinc-900 border border-zinc-700 border-dashed rounded-xl p-4 text-center cursor-pointer hover:border-sky-500 transition"
              onClick={() => fileRef.current?.click()}
            >
              {imageUrl ? (
                <div className="relative w-full aspect-video">
                  <Image src={imageUrl} alt="캐스팅보드" fill className="object-contain rounded-lg" />
                </div>
              ) : (
                <span className="text-zinc-500 text-sm">
                  {uploading ? '업로드 중...' : '이미지를 클릭해서 업로드하세요'}
                </span>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </div>

          <button
            type="submit"
            disabled={submitting || !title || !date}
            className="w-full bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-white font-bold rounded-full py-3 transition"
          >
            {submitting ? '저장 중...' : '게시하기'}
          </button>
        </form>
      </div>
    </div>
  );
}
