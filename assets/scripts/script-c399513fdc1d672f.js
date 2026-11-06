(() => {
  const root = document.getElementById('au-site');
  if (!root || window.__AU_REVIEW_STATIC__ || new URLSearchParams(location.search).get('static') === '1' || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const key = 'art-union-entry-v1';
  try { if (sessionStorage.getItem(key)) return; sessionStorage.setItem(key, 'seen'); } catch {}
  const entry = document.createElement('div');
  entry.className = 'au-entry'; entry.setAttribute('aria-hidden', 'true');
  entry.innerHTML = '<span class="au-entry-disc"></span><span class="au-brand au-entry-brand"></span>';
  document.body.append(entry);
  const logo = entry.querySelector('.au-entry-brand'), disc = entry.querySelector('.au-entry-disc');
  const original = getComputedStyle(root.querySelector('.au-header .au-brand'));
  logo.style.maskImage = original.maskImage;
  logo.style.webkitMaskImage = original.webkitMaskImage;
  const cleanup = () => { entry.remove(); root.dataset.entryState = 'complete'; };
  root.dataset.entryState = 'showing';
  let revealed = false;
  const reveal = () => {
    if (revealed || !entry.isConnected) return; revealed = true;
    const box = logo.getBoundingClientRect();
    const diameter = box.width * 0.1367;
    disc.style.width = disc.style.height = diameter + 'px';
    disc.style.left = (box.left + box.width * 0.79945 - diameter / 2) + 'px';
    disc.style.top = (box.top + box.height / 2 - diameter / 2) + 'px';
    const scale = Math.hypot(innerWidth, innerHeight) * 2 / diameter;
    root.dataset.entryState = 'revealing';
    logo.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 170, fill: 'forwards' });
    disc.animate([{ transform: 'scale(1)' }, { transform: 'scale(' + scale + ')' }], { duration: 520, easing: 'cubic-bezier(.65,0,.25,1)', fill: 'forwards' });
    setTimeout(() => entry.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 220, fill: 'forwards' }).finished.then(cleanup).catch(cleanup), 430);
  };
  const image = document.getElementById('hero-image');
  Promise.all([new Promise(resolve => setTimeout(resolve, 450)), image?.decode().catch(() => {})]).then(reveal);
  setTimeout(reveal, 900);
  setTimeout(cleanup, 1800);
  document.addEventListener('pointerdown', cleanup, { once: true });
  document.addEventListener('keydown', cleanup, { once: true });
})();
