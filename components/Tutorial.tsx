'use client';
import { useState } from 'react';

interface Props {
  userName?: string | null;
  userEmail: string;
  onDone: () => void;
}

function Step1({ userName }: { userName?: string | null }) {
  return (
    <div className="flex flex-col items-center text-center gap-5 py-4">
      <div className="text-7xl">🎭</div>
      <div>
        <p className="text-zinc-400 dark:text-zinc-500 text-sm mb-1">
          {userName ? `${userName} 님, ` : ''}환영해요!
        </p>
        <h2 className="text-zinc-900 dark:text-white font-bold text-xl leading-snug">
          주인장의 공연 기록을<br />함께 탐험해봐요
        </h2>
      </div>
      <div className="flex flex-col gap-2.5 w-full mt-1">
        {[
          { emoji: '📅', text: '관람한 모든 날의 기록' },
          { emoji: '📝', text: '생생한 스레드 후기' },
          { emoji: '❤️', text: '좋아요로 공감 표현' },
        ].map(({ emoji, text }) => (
          <div key={text} className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-900 rounded-2xl px-4 py-3">
            <span className="text-xl shrink-0">{emoji}</span>
            <span className="text-zinc-700 dark:text-zinc-300 text-[15px] font-medium">{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Step2() {
  const items = [
    {
      label: '홈',
      desc: '전체 피드',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      ),
    },
    {
      label: '캘린더',
      desc: '날짜별 현황',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      ),
    },
    {
      label: '폴더',
      desc: '극별 모아보기',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
        </svg>
      ),
    },
    {
      label: '검색',
      desc: '제목·후기 검색',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
      ),
    },
  ];

  return (
    <div className="flex flex-col items-center text-center gap-5 py-4">
      <div className="text-7xl">🗺️</div>
      <div>
        <p className="text-zinc-400 dark:text-zinc-500 text-sm mb-1">네 가지 방법으로</p>
        <h2 className="text-zinc-900 dark:text-white font-bold text-xl">원하는 기록을 찾아요</h2>
      </div>
      <div className="grid grid-cols-2 gap-2.5 w-full mt-1">
        {items.map(({ label, desc, icon }) => (
          <div key={label} className="flex flex-col items-center gap-2 bg-zinc-50 dark:bg-zinc-900 rounded-2xl px-4 py-4">
            <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-500 flex items-center justify-center">
              {icon}
            </div>
            <div>
              <p className="text-zinc-900 dark:text-white font-semibold text-sm">{label}</p>
              <p className="text-zinc-400 dark:text-zinc-500 text-xs mt-0.5">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Step3() {
  return (
    <div className="flex flex-col items-center text-center gap-5 py-4">
      <div className="text-7xl">❤️</div>
      <div>
        <p className="text-zinc-400 dark:text-zinc-500 text-sm mb-1">공감이 됐다면</p>
        <h2 className="text-zinc-900 dark:text-white font-bold text-xl">좋아요를 눌러보세요</h2>
      </div>
      <div className="w-full flex flex-col gap-2.5 mt-1">
        <div className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-900 rounded-2xl px-4 py-3">
          <div className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
          <span className="text-zinc-700 dark:text-zinc-300 text-[15px] font-medium text-left">각 게시물 하단의 하트를 탭하세요</span>
        </div>
        <div className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-900 rounded-2xl px-4 py-3">
          <div className="w-8 h-8 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center shrink-0 text-base">
            G
          </div>
          <span className="text-zinc-700 dark:text-zinc-300 text-[15px] font-medium text-left">구글 계정으로 로그인하면 저장돼요</span>
        </div>
      </div>
    </div>
  );
}

const STEPS = [Step1, Step2, Step3];

export default function Tutorial({ userName, userEmail, onDone }: Props) {
  const [step, setStep] = useState(0);
  const StepComponent = STEPS[step];
  const isLast = step === STEPS.length - 1;

  function handleDone() {
    try { localStorage.setItem(`tutorial_done_${userEmail}`, '1'); } catch {}
    onDone();
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-end sm:justify-center bg-black/70 backdrop-blur-sm px-4 pb-6 sm:pb-0">
      <div className="w-full max-w-sm bg-white dark:bg-zinc-950 rounded-3xl shadow-2xl overflow-hidden">
        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 pt-5">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-6 bg-sky-500' : 'w-1.5 bg-zinc-200 dark:bg-zinc-800'}`}
            />
          ))}
        </div>

        {/* Step content */}
        <div className="px-5 pt-5 pb-2">
          <StepComponent userName={userName} />
        </div>

        {/* Actions */}
        <div className="px-5 pb-4 flex gap-3 mt-2">
          {step > 0 && (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="w-12 py-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 font-medium transition hover:bg-zinc-50 dark:hover:bg-zinc-900 flex items-center justify-center"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
          )}
          {isLast ? (
            <button
              onClick={handleDone}
              className="flex-1 py-3.5 rounded-2xl bg-sky-500 hover:bg-sky-400 active:bg-sky-600 text-white font-bold text-[15px] transition"
            >
              시작하기 🎉
            </button>
          ) : (
            <button
              onClick={() => setStep((s) => s + 1)}
              className="flex-1 py-3.5 rounded-2xl bg-sky-500 hover:bg-sky-400 active:bg-sky-600 text-white font-bold text-[15px] transition"
            >
              다음
            </button>
          )}
        </div>

        <button onClick={handleDone} className="w-full pb-5 text-zinc-400 dark:text-zinc-600 text-sm text-center">
          건너뛰기
        </button>
      </div>
    </div>
  );
}
