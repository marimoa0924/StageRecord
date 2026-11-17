// 뒤로가기 스크롤 복원. 목록이 비동기로 로드되는 화면은 높이가 충분해질 때까지(최대 3초) 기다린 뒤
// 이동하고, 자리 잡은 뒤 ~700ms 동안 늦게 오는 스크롤 리셋을 instant로 되돌린다.
// 사용자가 직접 스크롤하면 즉시 중단한다. (전역 scroll-behavior는 건드리지 않음)
export function restoreScroll(y: number) {
  if (y <= 0) return;
  let active = true;
  let placedAt = 0;

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
    const now = performance.now();
    if (document.documentElement.scrollHeight - window.innerHeight >= y - 1) {
      if (Math.abs(window.scrollY - y) > 1) {
        window.scrollTo({ top: y, behavior: 'instant' as ScrollBehavior });
      }
      if (!placedAt) placedAt = now;
    }
    const keepGoing = (placedAt ? now - placedAt < 700 : true) && now - start < 3000;
    if (keepGoing) requestAnimationFrame(tick);
    else stop();
  }
  requestAnimationFrame(tick);
}
