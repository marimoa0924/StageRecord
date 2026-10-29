'use client';
import { useState } from 'react';

// 캐스팅보드 이미지에서 배우를 추출해 기존 태그에 합쳐준다 (저장 전 확인용 보조)
export default function ScanCastButton({
  imageUrl,
  onExtracted,
}: {
  imageUrl: string | null;
  onExtracted: (names: string[]) => void;
}) {
  const [loading, setLoading] = useState(false);
  if (!imageUrl) return null;

  async function scan() {
    setLoading(true);
    try {
      const res = await fetch('/api/extract-cast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: imageUrl }),
      });
      const data = await res.json();
      if (Array.isArray(data.actors) && data.actors.length) onExtracted(data.actors);
      else alert(data.error ?? '배우를 찾지 못했어요. 직접 입력해주세요.');
    } catch {
      alert('추출 중 오류가 발생했어요.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={scan}
      disabled={loading}
      className="mt-1.5 inline-flex items-center gap-1.5 text-sky-500 hover:text-sky-400 text-[13px] font-medium disabled:opacity-50 transition"
    >
      {loading ? '추출 중…' : '✨ 캐스팅보드에서 배우 추출'}
    </button>
  );
}
