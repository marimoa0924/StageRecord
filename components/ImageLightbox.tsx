'use client';
import { useEffect, useCallback, useState } from 'react';
import Image from 'next/image';

interface Props {
  images: string[];
  initialIndex?: number;
  onClose: () => void;
}

export default function ImageLightbox({ images, initialIndex = 0, onClose }: Props) {
  const [current, setCurrent] = useState(initialIndex);
  const hasMultiple = images.length > 1;

  const prev = useCallback(
    () => setCurrent((i) => (i - 1 + images.length) % images.length),
    [images.length],
  );
  const next = useCallback(
    () => setCurrent((i) => (i + 1) % images.length),
    [images.length],
  );

  useEffect(() => {
    const saved = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    }
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.documentElement.style.overflow = saved;
    };
  }, [onClose, prev, next]);

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/95"
      onClick={onClose}
    >
      {/* Close */}
      <button
        onClick={onClose}
        aria-label="닫기"
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition z-10"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>

      {/* Counter */}
      {hasMultiple && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/70 text-sm bg-black/40 px-3 py-1 rounded-full pointer-events-none">
          {current + 1} / {images.length}
        </div>
      )}

      {/* Image */}
      <div
        className="relative w-full h-full px-14 py-16 sm:px-20"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={images[current]}
          alt=""
          fill
          className="object-contain"
          sizes="100vw"
          priority
          unoptimized
        />
      </div>

      {/* Prev arrow */}
      {hasMultiple && (
        <button
          onClick={(e) => { e.stopPropagation(); prev(); }}
          aria-label="이전 이미지"
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
      )}

      {/* Next arrow */}
      {hasMultiple && (
        <button
          onClick={(e) => { e.stopPropagation(); next(); }}
          aria-label="다음 이미지"
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      )}

      {/* Thumbnail strip for multiple images */}
      {hasMultiple && (
        <div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 px-4"
          onClick={(e) => e.stopPropagation()}
        >
          {images.map((url, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 transition shrink-0 ${
                i === current ? 'border-white' : 'border-white/30 hover:border-white/60'
              }`}
            >
              <Image src={url} alt="" fill className="object-cover" unoptimized />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
