import CalendarGrid from '@/components/CalendarGrid';

export default function CalendarPage() {
  return (
    <div className="flex flex-col min-h-screen pb-16">
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur border-b border-zinc-800 px-4 py-3">
        <h1 className="text-white font-bold text-lg text-center">캘린더</h1>
      </header>
      <main className="flex-1">
        <CalendarGrid />
      </main>
    </div>
  );
}
