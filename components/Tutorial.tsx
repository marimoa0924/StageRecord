'use client';
import { useState } from 'react';

interface Props {
  userEmail: string;
  onDone: () => void;
}

const STEPS = [
  {
    emoji: '🎭',
    title: '환영합니다!',
    desc: '이 사이트는 주인장의 공연 관람 기록을 모아둔 아카이브예요.\n기록된 후기와 캐스팅보드를 자유롭게 둘러보세요.',
  },
  {
    emoji: '🗂️',
    title: '이렇게 탐색해요',
    desc: '홈에서 전체 피드를, 캘린더에서 날짜별 관람 현황을,\n폴더에서 극별로 묶인 기록을, 검색으로 내용을 찾을 수 있어요.',
  },
  {
    emoji: '❤️',
    title: '좋아요로 공감해요',
    desc: '마음에 드는 기록에 좋아요를 눌러보세요.\n구글 계정으로 로그인하면 좋아요가 저장돼요.',
  },
];

export default function Tutorial({ userEmail, onDone }: Props) {
  const [step, setStep] = useState(0);

  function handleDone() {
    try { localStorage.setItem(`tutorial_done_${userEmail}`, '1'); } catch {}
    onDone();
  }

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-end sm:justify-center bg-black/70 backdrop-blur-sm px-4 pb-8 sm:pb-0">
      <div className="w-full max-w-sm bg-white dark:bg-zinc-950 rounded-3xl shadow-2xl overflow-hidden">
        {/* Progress bar */}
        <div className="flex gap-1.5 px-6 pt-5">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= step ? 'bg-sky-500' : 'bg-zinc-200 dark:bg-zinc-800'}`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="px-6 py-8 flex flex-col items-center text-center gap-4">
          <div className="text-6xl">{current.emoji}</div>
          <h2 className="text-zinc-900 dark:text-white font-bold text-xl">{current.title}</h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-[15px] leading-relaxed whitespace-pre-line">
            {current.desc}
          </p>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex gap-3">
          {step > 0 && (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="flex-1 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 font-medium text-[15px] transition hover:bg-zinc-50 dark:hover:bg-zinc-900"
            >
              이전
            </button>
          )}
          {isLast ? (
            <button
              onClick={handleDone}
              className="flex-1 py-3 rounded-2xl bg-sky-500 hover:bg-sky-400 active:bg-sky-600 text-white font-bold text-[15px] transition"
            >
              시작하기
            </button>
          ) : (
            <button
              onClick={() => setStep((s) => s + 1)}
              className="flex-1 py-3 rounded-2xl bg-sky-500 hover:bg-sky-400 active:bg-sky-600 text-white font-bold text-[15px] transition"
            >
              다음
            </button>
          )}
        </div>

        {/* Skip */}
        <button
          onClick={handleDone}
          className="w-full pb-5 text-zinc-400 dark:text-zinc-600 text-sm text-center"
        >
          건너뛰기
        </button>
      </div>
    </div>
  );
}
