(() => {
  const root = document.getElementById('au-site');
  if (!root || window.__AU_REVIEW_STATIC__ || new URLSearchParams(location.search).get('static') === '1' || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const key = 'art-union-entry-v2';
  try { if (sessionStorage.getItem(key)) return; sessionStorage.setItem(key, 'seen'); } catch {}
  const entry = document.createElement('div');
  entry.className = 'au-entry'; entry.setAttribute('aria-hidden', 'true');
  entry.innerHTML = '<span class="au-brand au-entry-brand"></span>';
  document.body.append(entry);
  const logo = entry.querySelector('.au-entry-brand');
  const original = getComputedStyle(root.querySelector('.au-header .au-brand'));
  logo.style.maskImage = original.maskImage;
  logo.style.webkitMaskImage = original.webkitMaskImage;
  let frame = 0;
  const timers = [];
  const cleanup = () => {
    cancelAnimationFrame(frame);
    timers.forEach(clearTimeout);
    document.removeEventListener('pointerdown', cleanup);
    document.removeEventListener('keydown', cleanup);
    window.removeEventListener('resize', cleanup);
    entry.remove(); root.dataset.entryState = 'complete';
  };
  root.dataset.entryState = 'showing';
  let revealed = false;
  const reveal = () => {
    if (revealed || !entry.isConnected) return; revealed = true;
    const box = logo.getBoundingClientRect();
    // A transparent aperture cuts through the overlay, including the original O.
    // The logo stays still; no coloured element ever grows across the screen.
    const x = box.left + box.width * 0.79945;
    const y = box.top + box.height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)) + 4;
    root.dataset.entryState = 'revealing';
    const start = performance.now();
    const tick = now => {
      if (!entry.isConnected) return;
      const progress = Math.min(1, (now - start) / 1800);
      const eased = (1 - Math.cos(Math.PI * progress)) / 2;
      const r = radius * eased;
      const mask = `radial-gradient(circle at ${x}px ${y}px, transparent ${r}px, #000 ${r + 3}px)`;
      entry.style.maskImage = entry.style.webkitMaskImage = mask;
      if (progress < 1) frame = requestAnimationFrame(tick);
      else cleanup();
    };
    frame = requestAnimationFrame(tick);
  };
  const image = document.getElementById('hero-image');
  Promise.all([new Promise(resolve => timers.push(setTimeout(resolve, 1300))), image?.decode().catch(() => {})]).then(reveal);
  timers.push(setTimeout(reveal, 1600), setTimeout(cleanup, 3800));
  document.addEventListener('pointerdown', cleanup, { once: true });
  document.addEventListener('keydown', cleanup, { once: true });
  window.addEventListener('resize', cleanup, { once: true });
})();
