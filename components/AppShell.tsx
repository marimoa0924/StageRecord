'use client';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import BottomNav from '@/components/BottomNav';
import Sidebar from '@/components/Sidebar';
import RightPanel from '@/components/RightPanel';
import CreatePostModal from '@/components/CreatePostModal';
import Tutorial from '@/components/Tutorial';
import { useOwner } from '@/lib/useOwner';
import { restoreScroll } from '@/lib/scrollRestore';

// 링크를 누른 순간 각 화면(URL)의 스크롤 위치 — 뒤로가기로 돌아오면 복원 (새로고침하면 초기화)
const scrollByUrl = new Map<string, number>();
let poppedBack = false;

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [showModal, setShowModal] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { isOwner, user, loading } = useOwner();

  useEffect(() => {
    const onPop = () => { poppedBack = true; };
    const onClick = (e: MouseEvent) => {
      if ((e.target as Element | null)?.closest?.('a[href]')) {
        scrollByUrl.set(location.pathname + location.search, window.scrollY);
      }
    };
    window.addEventListener('popstate', onPop);
    document.addEventListener('click', onClick, true);
    return () => {
      window.removeEventListener('popstate', onPop);
      document.removeEventListener('click', onClick, true);
    };
  }, []);

  useEffect(() => {
    if (!poppedBack) return;
    poppedBack = false;
    if (pathname === '/') return; // 홈은 자체 캐시로 복원
    const y = scrollByUrl.get(location.pathname + location.search);
    if (y) restoreScroll(y);
  }, [pathname]);

  useEffect(() => {
    if (loading || !user || isOwner) return;
    try {
      const key = `tutorial_done_${user.email}`;
      if (!localStorage.getItem(key)) setShowTutorial(true);
    } catch {}
  }, [loading, user, isOwner]);

  function handleCreated() {
    setShowModal(false);
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="mx-auto flex justify-center max-w-[1290px]">
        <Sidebar onNewPost={() => setShowModal(true)} />

        <div className="w-full max-w-[598px] border-x border-zinc-200 dark:border-zinc-800/50 min-h-screen relative pb-16 lg:pb-0">
          {children}
        </div>

        <RightPanel />
      </div>

      <BottomNav onNewPost={() => setShowModal(true)} />

      {showModal && (
        <CreatePostModal
          onClose={() => setShowModal(false)}
          onCreated={handleCreated}
        />
      )}

      {showTutorial && user?.email && (
        <Tutorial
          userName={user.name}
          userEmail={user.email}
          onDone={() => setShowTutorial(false)}
        />
      )}
    </div>
  );
}
