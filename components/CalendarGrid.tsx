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

export default function CalendarGrid() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1); // 1-based
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/posts/calendar?year=${year}&month=${month}`)
      .then((r) => r.json())
      .then((data) => { setPosts(data); setLoading(false); });
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

  // Build calendar grid
  const firstDay = new Date(year, month - 1, 1).getDay(); // 0=Sun
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
    <div>
      {/* Month navigation */}
      <div className="flex items-center justify-between px-4 py-3">
        <button onClick={prevMonth} className="text-white text-2xl min-w-[44px] min-h-[44px] flex items-center justify-center hover:text-sky-400 transition">‹</button>
        <h2 className="text-white font-bold text-lg">
          {year}년 {month}월
        </h2>
        <button onClick={nextMonth} className="text-white text-2xl min-w-[44px] min-h-[44px] flex items-center justify-center hover:text-sky-400 transition">›</button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 px-2">
        {DAY_NAMES.map((d, i) => (
          <div key={d} className={`text-center text-xs py-2 font-medium ${i === 0 ? 'text-red-400' : i === 6 ? 'text-sky-400' : 'text-zinc-500'}`}>
            {d}
          </div>
        ))}
      </div>

      {/* Calendar cells */}
      {loading ? (
        <div className="text-center py-10 text-zinc-500">불러오는 중...</div>
      ) : (
        <div className="grid grid-cols-7 gap-px bg-zinc-800 border-t border-zinc-800 mx-2 rounded-xl overflow-hidden">
          {cells.map((day, idx) => {
            if (!day) return <div key={idx} className="bg-black aspect-square" />;
            const ds = dateStr(day);
            const hasPosts = postDateMap.has(ds);
            const isToday = ds === todayStr;
            const isSelected = ds === selectedDate;
            const isSun = idx % 7 === 0;
            const isSat = idx % 7 === 6;

            return (
              <button
                key={idx}
                onClick={() => setSelectedDate(ds === selectedDate ? null : ds)}
                className={`bg-black aspect-square flex flex-col items-center justify-start pt-1.5 gap-1 transition relative
                  ${isSelected ? 'bg-zinc-800' : 'hover:bg-zinc-900'}`}
              >
                <span className={`text-xs font-medium w-7 h-7 flex items-center justify-center rounded-full
                  ${isToday ? 'bg-sky-500 text-white' : isSelected ? 'text-white' : isSun ? 'text-red-400' : isSat ? 'text-sky-400' : 'text-zinc-300'}`}>
                  {day}
                </span>
                {hasPosts && (
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Selected date posts */}
      {selectedDate && (
        <div className="mt-4 px-4">
          <p className="text-zinc-400 text-sm mb-3">
            {new Date(selectedDate + 'T00:00:00').toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}의 공연
          </p>
          {selectedPosts.length === 0 ? (
            <p className="text-zinc-600 text-sm">공연 기록이 없습니다.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {selectedPosts.map((p) => (
                <Link key={p.id} href={`/post/${p.id}`} className="flex items-center gap-3 bg-zinc-900 rounded-2xl px-4 py-3 hover:bg-zinc-800 transition">
                  <span className="text-2xl">🎭</span>
                  <div>
                    <p className="text-white font-semibold text-sm">{p.title}</p>
                    <p className="text-zinc-500 text-xs">👁 {p.viewing_count}회 관람</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
