// 뒤로가기 복원: 캐시로 높이가 확보된 화면에서, 늦게 오는 스크롤 리셋을 최대 ~700ms 동안
// instant로 되돌린다. 사용자가 직접 스크롤하면 즉시 중단한다. (전역 scroll-behavior는 건드리지 않음)
export function restoreScroll(y: number) {
  if (y <= 0) return;
  let active = true;

  function cleanup() {
    window.removeEventListener('wheel', stop);
    window.removeEventListener('touchmove', stop);
    window.removeEventListener('keydown', stop);
  }
  function stop() { active = false; cleanup(); }

  window.addEventListener('wheel', stop, { passive: true });
  window.addEventListener('touchmove', stop, { passive: true });
  window.addEventListener('keydown', stop);

  const start = performance.now();
  function tick() {
    if (!active) return;
    if (Math.abs(window.scrollY - y) > 1) {
      window.scrollTo({ top: y, behavior: 'instant' as ScrollBehavior });
    }
    if (performance.now() - start < 700) requestAnimationFrame(tick);
    else stop();
  }
  requestAnimationFrame(tick);
}
