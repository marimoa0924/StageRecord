'use client';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import ActorInput from '@/components/ActorInput';
import ScanCastButton from '@/components/ScanCastButton';

export interface EditableFields {
  id: number;
  performance_date: string;
  viewing_count: number;
  casting_board: string | null;
  price?: number | null;
  actors?: string;
}

function parseActors(raw?: string | null): string[] {
  try { const v = JSON.parse(raw || '[]'); return Array.isArray(v) ? v : []; } catch { return []; }
}

export default function EditPostModal({
  post,
  onClose,
  onSaved,
}: {
  post: EditableFields;
  onClose: () => void;
  onSaved: (updated: EditableFields) => void;
}) {
  const [date, setDate] = useState(post.performance_date.slice(0, 10));
  const [viewingCount, setViewingCount] = useState(post.viewing_count);
  const [price, setPrice] = useState(post.price != null ? String(post.price) : '');
  const [actors, setActors] = useState<string[]>(parseActors(post.actors));
  const [saving, setSaving] = useState(false);

  const changed =
    date !== post.performance_date.slice(0, 10) ||
    viewingCount !== post.viewing_count ||
    price !== (post.price != null ? String(post.price) : '') ||
    JSON.stringify(actors) !== JSON.stringify(parseActors(post.actors));

  async function save() {
    if (!date || !changed) return;
    setSaving(true);
    const res = await fetch(`/api/posts/${post.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        performance_date: date,
        viewing_count: viewingCount,
        price: price === '' ? null : Number(price),
        actors,
      }),
    });
    if (res.ok) {
      const updated = await res.json();
      onSaved(updated);
    }
    setSaving(false);
  }

  const modal = (
    /* Mobile: full-screen  /  Desktop: centered dialog. 카드(Link) 안에서 열려도
       클릭이 Link로 전파되지 않도록 portal로 body에 렌더 */
    <div
      className="fixed inset-0 z-50 flex flex-col sm:items-center sm:justify-center sm:bg-black/60 sm:backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="flex flex-col w-full h-full sm:h-auto sm:max-w-sm sm:rounded-2xl sm:shadow-2xl sm:border sm:border-zinc-200 dark:sm:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between px-5 h-14 border-b border-zinc-200 dark:border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition min-w-[44px] min-h-[44px] flex items-center justify-start text-[15px]"
          >
            취소
          </button>
          <h2 className="text-zinc-900 dark:text-white font-bold text-[16px]">정보 수정</h2>
          <button
            type="button"
            onClick={save}
            disabled={!changed || !date || saving}
            className="text-sky-500 font-bold text-[15px] disabled:opacity-40 min-h-[44px] px-1 transition hover:text-sky-400"
          >
            {saving ? '저장 중…' : '저장'}
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-5 py-6 space-y-5">
          <div>
            <label className="text-zinc-500 dark:text-zinc-400 text-xs font-medium block mb-1.5 uppercase tracking-wide">관람 날짜</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full h-[46px] bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 text-zinc-900 dark:text-white focus:outline-none focus:border-sky-500 dark:focus:border-sky-500 transition"
            />
          </div>

          <div>
            <label className="text-zinc-500 dark:text-zinc-400 text-xs font-medium block mb-1.5 uppercase tracking-wide">관람 횟수</label>
            <div className="flex items-center h-[46px] bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden focus-within:border-sky-500 transition">
              <button
                type="button"
                onClick={() => setViewingCount((v) => Math.max(1, v - 1))}
                className="w-14 h-full flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white text-xl transition"
              >−</button>
              <span className="flex-1 text-center text-zinc-900 dark:text-white font-semibold text-lg">{viewingCount}</span>
              <button
                type="button"
                onClick={() => setViewingCount((v) => Math.min(9999, v + 1))}
                className="w-14 h-full flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white text-xl transition"
              >+</button>
            </div>
          </div>

          <div>
            <label className="text-zinc-500 dark:text-zinc-400 text-xs font-medium block mb-1.5 uppercase tracking-wide">관람 가격 (원)</label>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="예: 140000 (선택)"
              className="w-full h-[46px] bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-sky-500 transition"
            />
          </div>

          <div>
            <label className="text-zinc-500 dark:text-zinc-400 text-xs font-medium block mb-1.5 uppercase tracking-wide">출연 배우</label>
            {post.casting_board && (
              <div className="relative w-full rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 mb-2" style={{ aspectRatio: '16/9' }}>
                <Image src={post.casting_board} alt="캐스팅보드" fill className="object-contain" />
              </div>
            )}
            <ActorInput value={actors} onChange={setActors} />
            <ScanCastButton
              imageUrl={post.casting_board}
              onExtracted={(names) => setActors((prev) => [...new Set([...prev, ...names])].slice(0, 20))}
            />
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modal, document.body) : null;
}
