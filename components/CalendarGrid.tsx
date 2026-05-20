'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Post {
  id: number;
  title: string;
  performance_date: string;
  viewing_count: number;
  casting_board: string | null;
}

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

// "0824 차미 자아홉 자막" → "차미"
function showName(title: string) {
  const parts = title.split(' ');
  return parts.length >= 2 ? parts[1] : title;
}

export default function CalendarGrid() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/posts/calendar?year=${year}&month=${month}`)
      .then((r) => r.json())
      .then((data) => { setPosts(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [year, month]);

  function prevMonth() {
    if (month === 1) { setYear((y) => y - 1); setMonth(12); }
    else setMonth((m) => m - 1);
    setSelectedDate(null);
  }

  function nextMonth() {
    if (month === 12) { setYear((y) => y + 1); setMonth(1); }
    else setMonth((m) => m + 1);
    setSelectedDate(null);
  }

  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();

  const postDateMap = new Map<string, Post[]>();
  for (const p of posts) {
    const d = p.performance_date.slice(0, 10);
    if (!postDateMap.has(d)) postDateMap.set(d, []);
    postDateMap.get(d)!.push(p);
  }

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  function dateStr(day: number) {
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  const selectedPosts = selectedDate ? (postDateMap.get(selectedDate) ?? []) : [];

  return (
    <div className="pb-4">
      {/* Month nav */}
      <div className="flex items-center justify-between px-4 py-3">
        <button
          onClick={prevMonth}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <h2 className="text-zinc-900 dark:text-white font-bold text-[16px]">{year}년 {month}월</h2>
        <button
          onClick={nextMonth}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 px-2 mb-1">
        {DAY_NAMES.map((d, i) => (
          <div
            key={d}
            className={`text-center text-xs py-1.5 font-medium ${i === 0 ? 'text-red-400' : i === 6 ? 'text-sky-500' : 'text-zinc-400 dark:text-zinc-600'}`}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      {loading ? (
        <div className="grid grid-cols-7 gap-1 px-2">
          {[...Array(35)].map((_, i) => (
            <div key={i} className="min-h-[60px] rounded-lg bg-zinc-100 dark:bg-zinc-900/40 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-1 px-2">
          {cells.map((day, idx) => {
            if (!day) return <div key={idx} className="min-h-[60px]" />;
            const ds = dateStr(day);
            const dayPosts = postDateMap.get(ds) ?? [];
            const hasPosts = dayPosts.length > 0;
            const isToday = ds === todayStr;
            const isSelected = ds === selectedDate;
            const isSun = idx % 7 === 0;
            const isSat = idx % 7 === 6;

            return (
              <button
                key={idx}
                onClick={() => setSelectedDate(ds === selectedDate ? null : ds)}
                className={`flex flex-col items-start p-1.5 min-h-[60px] rounded-lg transition text-left
                  ${isSelected && hasPosts
                    ? 'bg-sky-500'
                    : isSelected
                    ? 'bg-zinc-100 dark:bg-zinc-800'
                    : hasPosts
                    ? 'bg-sky-50 dark:bg-sky-950/60 border border-sky-200/60 dark:border-sky-800/40'
                    : 'hover:bg-zinc-50 dark:hover:bg-zinc-900/60'}`}
              >
                <span className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full shrink-0
                  ${isToday && !(isSelected && hasPosts)
                    ? 'bg-sky-500 text-white font-bold'
                    : isSelected && hasPosts
                    ? 'text-white font-bold'
                    : isSelected
                    ? 'text-zinc-900 dark:text-white font-semibold'
                    : isSun
                    ? 'text-red-400'
                    : isSat
                    ? 'text-sky-500'
                    : 'text-zinc-600 dark:text-zinc-300'}`}
                >
                  {day}
                </span>
                {hasPosts && (
                  <span
                    className={`text-[9px] leading-tight w-full mt-0.5 font-semibold break-keep
                      ${isSelected ? 'text-white/90' : 'text-sky-600 dark:text-sky-400'}`}
                  >
                    {showName(dayPosts[0].title)}
                    {dayPosts.length > 1 && (
                      <span className="opacity-70"> +{dayPosts.length - 1}</span>
                    )}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Selected date panel */}
      {selectedDate && (
        <div className="mt-5 px-4">
          <p className="text-zinc-400 dark:text-zinc-500 text-xs font-medium uppercase tracking-wide mb-3">
            {new Date(selectedDate + 'T00:00:00').toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}의 공연
          </p>
          {selectedPosts.length === 0 ? (
            <p className="text-zinc-400 dark:text-zinc-700 text-sm text-center py-6">공연 기록이 없습니다.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {selectedPosts.map((p) => (
                <Link
                  key={p.id}
                  href={`/post/${p.id}`}
                  className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800/60 rounded-2xl px-4 py-3 transition"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center text-white text-base shrink-0">
                    🎭
                  </div>
                  <div className="min-w-0">
                    <p className="text-zinc-900 dark:text-white font-semibold text-sm truncate">{p.title}</p>
                    <p className="text-zinc-500 text-xs mt-0.5">{p.viewing_count}회 관람</p>
                  </div>
                  <svg className="w-4 h-4 text-zinc-400 dark:text-zinc-700 shrink-0 ml-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
