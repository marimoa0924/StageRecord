'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/BottomNav';
import Sidebar from '@/components/Sidebar';
import CreatePostModal from '@/components/CreatePostModal';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  function handleCreated() {
    setShowModal(false);
    router.refresh();
  }

  return (
    <div className="min-h-screen">
      <Sidebar onNewPost={() => setShowModal(true)} />

      <div className="lg:pl-[240px] xl:pl-[260px]">
        <div className="max-w-[598px] mx-auto lg:mx-0 border-x border-zinc-800/50 min-h-screen relative pb-16 lg:pb-0">
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
    </div>
  );
}
