import CalendarGrid from '@/components/CalendarGrid';

export default function CalendarPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-zinc-800/60 px-4 h-14 flex items-center justify-center">
        <h1 className="text-white font-bold text-[17px]">캘린더</h1>
      </header>
      <main className="flex-1">
        <CalendarGrid />
      </main>
    </div>
  );
}
