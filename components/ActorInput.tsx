'use client';
import { useState } from 'react';

// 배우 이름을 칩으로 입력 (Enter/쉼표로 추가, 백스페이스로 마지막 삭제). 생성·수정 공용
export default function ActorInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [text, setText] = useState('');

  function add(raw: string) {
    const names = raw.split(',').map((s) => s.trim()).filter(Boolean);
    if (names.length === 0) return;
    const merged = [...value];
    for (const n of names) if (!merged.includes(n) && merged.length < 20) merged.push(n);
    onChange(merged);
    setText('');
  }

  return (
    <div className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-2 py-2 flex flex-wrap gap-1.5 focus-within:border-sky-500 transition">
      {value.map((a) => (
        <span key={a} className="inline-flex items-center gap-1 bg-sky-100 dark:bg-sky-500/15 text-sky-700 dark:text-sky-300 text-sm rounded-full pl-3 pr-1.5 py-1">
          {a}
          <button
            type="button"
            onClick={() => onChange(value.filter((x) => x !== a))}
            className="hover:text-sky-900 dark:hover:text-white"
            aria-label={`${a} 삭제`}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </span>
      ))}
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.nativeEvent.isComposing) return; // 한글 조합 중이면 IME에 맡김 (Enter 가로채면 영어로 리셋됨)
          if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(text); }
          else if (e.key === 'Backspace' && !text && value.length) onChange(value.slice(0, -1));
        }}
        onBlur={() => add(text)}
        placeholder={value.length ? '' : '배우 이름 입력 후 Enter'}
        className="flex-1 min-w-[120px] bg-transparent outline-none text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 px-2 py-1 text-sm"
      />
    </div>
  );
}
