// 뒤로가기 스크롤 복원: 캐시로 높이가 확보된 화면에서, 늦게 오는 프로그램적 리셋(Next 등)을
// 최대 ~700ms 동안 instant로 되돌린다. 사용자가 직접 스크롤하면 즉시 중단해 방해하지 않는다.
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
