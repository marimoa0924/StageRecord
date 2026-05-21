'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/BottomNav';
import Sidebar from '@/components/Sidebar';
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
      <Sidebar onNewPost={() => setShowModal(true)} />

      <div className="lg:pl-[240px] xl:pl-[260px]">
        <div className="max-w-[598px] mx-auto lg:mx-0 border-x border-zinc-200 dark:border-zinc-800/50 min-h-screen relative pb-16 lg:pb-0">
          {children}
        </div>
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
