'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useOwner } from '@/lib/useOwner';

interface NamedCount { name: string; count: number }
interface Stats {
  total_shows: number;
  total_works: number;
  first_date: string | null;
  latest_date: string | null;
  top_shows: NamedCount[];
  by_month: { month: string; count: number }[];
  price: { priced: number; total: number; avg: number; max: number | null; max_title: string | null };
  top_actors: NamedCount[];
  total_reviews: number;
}

function daysBetween(a: string, b: string) {
  return Math.round((new Date(b + 'T00:00:00').getTime() - new Date(a + 'T00:00:00').getTime()) / 86400000);
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800/60 bg-zinc-50/60 dark:bg-zinc-900/40 p-4">
      <h2 className="text-zinc-900 dark:text-white font-extrabold text-[17px] mb-3">{title}</h2>
      {children}
    </section>
  );
}

// 이름 + 값 가로 막대 (단일 색, 값 텍스트 병기 — 색만으로 정보 전달하지 않음)
function BarRow({ label, value, max, unit }: { label: string; value: number; max: number; unit: string }) {
  const pct = max > 0 ? Math.max(6, Math.round((value / max) * 100)) : 0;
  return (
    <div className="flex items-center gap-2 py-1">
      <span className="w-24 shrink-0 text-[13px] text-zinc-700 dark:text-zinc-300 truncate">{label}</span>
      <div className="flex-1 h-5 bg-zinc-200/70 dark:bg-zinc-800/70 rounded-full overflow-hidden">
        <div className="h-full bg-sky-500 rounded-full" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-14 shrink-0 text-right text-[13px] font-semibold text-zinc-900 dark:text-white tabular-nums">
        {value.toLocaleString('ko-KR')}{unit}
      </span>
    </div>
  );
}

export default function StatsPage() {
  const router = useRouter();
  const { isOwner } = useOwner();
  const [s, setS] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [batch, setBatch] = useState<{ running: boolean; done: number; remaining: number | null }>({ running: false, done: 0, remaining: null });

  useEffect(() => {
    fetch('/api/stats')
      .then((r) => r.json())
      .then((d) => { if (!d?.error) setS(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // 캐스팅보드가 있고 배우가 비어있는 기록을 몇 개씩 반복 호출로 처리
  async function runBatch() {
    if (batch.running) return;
    setBatch({ running: true, done: 0, remaining: null });
    let done = 0;
    for (;;) {
      let data: { processed?: number; remaining?: number; error?: string } | null = null;
      try {
        const res = await fetch('/api/extract-cast/batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ limit: 2 }),
        });
        data = await res.json();
      } catch { break; }
      if (!data || data.error) break;
      done += data.processed ?? 0;
      setBatch({ running: true, done, remaining: data.remaining ?? null });
      if (!data.remaining || (data.processed ?? 0) === 0) break; // 완료 또는 더 진행 불가
    }
    setBatch((b) => ({ ...b, running: false }));
    fetch('/api/stats').then((r) => r.json()).then((d) => { if (!d?.error) setS(d); }).catch(() => {});
  }

  const span = s?.first_date && s?.latest_date ? daysBetween(s.first_date, s.latest_date) : 0;
  const avgGap = s && s.total_shows > 1 ? Math.round(span / (s.total_shows - 1)) : 0;
  const maxShow = s?.top_shows[0]?.count ?? 0;
  const maxMonth = s ? Math.max(1, ...s.by_month.map((m) => m.count)) : 1;
  const maxActor = s?.top_actors[0]?.count ?? 0;

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-zinc-200/60 dark:border-zinc-800/60 px-4 h-14 flex items-center gap-2">
        <button
          onClick={() => router.back()}
          className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition min-w-[44px] min-h-[44px] flex items-center shrink-0"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
        </button>
        <h1 className="text-zinc-900 dark:text-white font-bold text-[17px]">결산</h1>
      </header>

      <main className="flex-1 p-4 space-y-4">
        {loading && <p className="text-zinc-400 dark:text-zinc-600 text-sm text-center py-20">불러오는 중…</p>}

        {!loading && (!s || s.total_shows === 0) && (
          <div className="flex flex-col items-center justify-center py-28 gap-3">
            <div className="text-5xl">📊</div>
            <p className="text-zinc-600 dark:text-zinc-400 font-semibold">아직 결산할 기록이 없습니다</p>
          </div>
        )}

        {!loading && s && s.total_shows > 0 && (
          <>
            {/* Hero */}
            <section className="rounded-2xl p-5 bg-gradient-to-br from-sky-500 to-indigo-500 text-white">
              <p className="text-white/80 text-sm font-medium">지금까지</p>
              <p className="text-3xl font-extrabold mt-1">공연 {s.total_shows.toLocaleString('ko-KR')}회</p>
              <p className="text-white/90 mt-1">작품 {s.total_works.toLocaleString('ko-KR')}편 · 후기 {s.total_reviews.toLocaleString('ko-KR')}개</p>
            </section>

            {/* 소유자: 캐스팅보드 배우 일괄 추출 */}
            {isOwner && (
              <section className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800/60 bg-zinc-50/60 dark:bg-zinc-900/40 p-4">
                <h2 className="text-zinc-900 dark:text-white font-extrabold text-[17px]">캐스팅보드 배우 자동 채우기</h2>
                <p className="text-zinc-500 dark:text-zinc-400 text-[13px] mt-1">배우가 비어있는 기록의 캐스팅보드를 Gemini로 스캔해 배우를 채웁니다.</p>
                <button
                  onClick={runBatch}
                  disabled={batch.running}
                  className="mt-3 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white font-bold rounded-full px-4 py-2 text-sm transition"
                >
                  {batch.running
                    ? `처리 중… ${batch.done}개${batch.remaining != null ? ` (남은 ${batch.remaining})` : ''}`
                    : '일괄 추출 시작'}
                </button>
                {!batch.running && batch.done > 0 && (
                  <p className="text-emerald-600 dark:text-emerald-400 text-[13px] mt-2">완료 — {batch.done}개 기록에 배우를 채웠어요.</p>
                )}
              </section>
            )}

            {/* 관극 기간 */}
            {s.first_date && s.latest_date && (
              <Card title="관극 기간">
                <p className="text-zinc-700 dark:text-zinc-300 text-sm">
                  {s.first_date} ~ {s.latest_date}
                </p>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
                  총 {span.toLocaleString('ko-KR')}일{avgGap > 0 && ` · 평균 ${avgGap}일마다 한 번`}
                </p>
              </Card>
            )}

            {/* 최다 관람 작품 */}
            {s.top_shows.length > 0 && (
              <Card title="최다 관람 작품">
                {s.top_shows.map((row) => (
                  <BarRow key={row.name} label={row.name} value={row.count} max={maxShow} unit="회" />
                ))}
              </Card>
            )}

            {/* 최다 관극 배우 */}
            {s.top_actors.length > 0 && (
              <Card title="최다 관극 배우">
                {s.top_actors.map((row) => (
                  <BarRow key={row.name} label={row.name} value={row.count} max={maxActor} unit="회" />
                ))}
              </Card>
            )}

            {/* 월별 관람 */}
            {s.by_month.length > 0 && (
              <Card title="월별 관람">
                {s.by_month.map((m) => (
                  <BarRow key={m.month} label={m.month} value={m.count} max={maxMonth} unit="회" />
                ))}
              </Card>
            )}

            {/* 지출 */}
            {s.price.priced > 0 && (
              <Card title="관람 지출">
                <div className="grid grid-cols-2 gap-3">
                  <Stat label="총 지출" value={`₩${s.price.total.toLocaleString('ko-KR')}`} />
                  <Stat label="평균 티켓가" value={`₩${s.price.avg.toLocaleString('ko-KR')}`} />
                  {s.price.max != null && (
                    <Stat label="최고가" value={`₩${s.price.max.toLocaleString('ko-KR')}`} sub={s.price.max_title ?? undefined} />
                  )}
                  <Stat label="가격 입력된 기록" value={`${s.price.priced}개`} />
                </div>
              </Card>
            )}

            <p className="text-center text-zinc-400 dark:text-zinc-600 text-xs pt-2">
              가격·배우를 기록할수록 통계가 풍부해져요 · <Link href="/folders" className="text-sky-500">폴더</Link>
            </p>
          </>
        )}
      </main>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl bg-white dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/60 p-3">
      <p className="text-zinc-500 dark:text-zinc-400 text-xs">{label}</p>
      <p className="text-zinc-900 dark:text-white font-extrabold text-lg mt-0.5 tabular-nums">{value}</p>
      {sub && <p className="text-zinc-400 dark:text-zinc-600 text-xs mt-0.5 truncate">{sub}</p>}
    </div>
  );
}
