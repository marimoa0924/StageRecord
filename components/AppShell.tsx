'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/BottomNav';
import Sidebar from '@/components/Sidebar';
import RightPanel from '@/components/RightPanel';
import CreatePostModal from '@/components/CreatePostModal';
import Tutorial from '@/components/Tutorial';
import { useOwner } from '@/lib/useOwner';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [showModal, setShowModal] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const router = useRouter();
  const { isOwner, user, loading } = useOwner();

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
