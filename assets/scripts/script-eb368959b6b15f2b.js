(() => {
  'use strict';
  const root = document.getElementById('au-site');
  const data = window.ART_UNION;
  if (!root || !data?.featured?.length) return;
  const featured = data.featured;
  const hero = root.querySelector('.hero');
  const layer = root.querySelector('.hero-video');
  const image = root.querySelector('#hero-image');
  const title = root.querySelector('#hero-title');
  const progress = root.querySelector('.hero-progress > span');
  const film = root.querySelector('.film-section');
  const query = new URLSearchParams(location.search);
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const staticMode = window.__AU_REVIEW_STATIC__ === true || query.get('static') === '1';
  const saveData = navigator.connection?.saveData === true;
  const routes = { dary_2: ['case', 'project-dary_2.html'], zenit: ['zenit', 'project-zenit.html'], ovsyasha: ['ovsyasha', 'project-ovsyasha.html'], creamzy: ['creamzy', 'project-creamzy.html'], nexemezin: ['nexemezin', 'project-nexemezin.html'] };
  const slots = new Map();
  const interval = data.interval || 6000;
  let active = -1, selection = 0, elapsed = 0, raf = 0, lastTime = 0;
  let paused = staticMode || motion.matches || saveData;
  let inView = true, hovered = false, readyToCount = false;
  let warmTimer, fallbackTimer, sdkPromise;

  function sdk() {
    if (window.Vimeo) return Promise.resolve(window.Vimeo);
    if (sdkPromise) return sdkPromise;
    sdkPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      const timer = setTimeout(() => reject(new Error('Vimeo timeout')), 12000);
      script.src = 'https://player.vimeo.com/api/player.js';
      script.onload = () => { clearTimeout(timer); window.Vimeo ? resolve(window.Vimeo) : reject(new Error('Vimeo unavailable')); };
      script.onerror = () => { clearTimeout(timer); reject(new Error('Vimeo unavailable')); };
      document.head.append(script);
    }).catch(error => { sdkPromise = null; throw error; });
    return sdkPromise;
  }
  function canPlay() { return !paused && inView && !document.hidden; }
  function stopCycle() { cancelAnimationFrame(raf); raf = 0; lastTime = 0; }
  function tick(now) {
    if (!canPlay() || hovered || !readyToCount) { stopCycle(); return; }
    if (lastTime) elapsed += now - lastTime;
    lastTime = now;
    progress.style.transform = 'scaleX(' + Math.min(1, elapsed / interval) + ')';
    if (elapsed >= interval) { select((active + 1) % featured.length); return; }
    raf = requestAnimationFrame(tick);
  }
  function cycle() { if (canPlay() && !hovered && readyToCount && !raf) raf = requestAnimationFrame(tick); }
  function fit() {
    const width = layer.clientWidth, height = layer.clientHeight;
    if (!width || !height) return;
    for (const slot of slots.values()) {
      const w = Math.max(width, height * slot.aspect) * 1.025;
      slot.frame.style.width = w + 'px';
      slot.frame.style.height = (w / slot.aspect) + 'px';
    }
  }
  new ResizeObserver(fit).observe(layer);
  function dispose(slot) {
    slot.disposed = true;
    slots.delete(slot.index);
    slot.frame.remove();
    if (slot.player) slot.player.destroy().catch(() => {});
  }
  function retain(indices) {
    for (const slot of slots.values()) if (!indices.includes(slot.index)) dispose(slot);
  }
  function reveal(slot) {
    if (slot.disposed || slot.index !== active || !canPlay()) return;
    slot.frame.classList.add('is-visible');
    root.dataset.videoState = 'playing';
    if (!readyToCount) {
      root.dataset.videoStartDelay = String(Math.round(performance.now() - slot.selectedAt));
      clearTimeout(fallbackTimer);
      readyToCount = true;
      cycle();
      scheduleWarmup();
    }
  }
  async function park(slot) {
    if (slot.parking || slot.warmed || slot.disposed) return;
    slot.parking = true;
    await slot.player.pause().catch(() => {});
    if (slot.disposed) return;
    if (slot.index !== active) await slot.player.setCurrentTime(0).catch(() => {});
    slot.warmed = true;
    slot.parking = false;
    slot.frame.dataset.prepared = 'true';
    if (slot.index === active && canPlay()) slot.player.play().catch(() => {});
  }
  function ensure(index) {
    if (slots.has(index)) return slots.get(index);
    const project = featured[index], frame = document.createElement('iframe');
    const url = new URL(project.video.embedUrl);
    const mobile = matchMedia('(max-width: 600px)').matches;
    const initial = mobile ? '540p' : '720p';
    const ceiling = mobile ? '720p' : '1080p';
    for (const [key, value] of Object.entries({ autoplay: '0', muted: '1', controls: '0', autopause: '0', playsinline: '1', title: '0', byline: '0', portrait: '0', dnt: '1', preload: 'auto', initial_quality: initial, min_quality: '540p', max_quality: ceiling })) url.searchParams.set(key, value);
    frame.src = url.href;
    frame.title = project.name + ' — превью';
    frame.allow = 'autoplay; fullscreen; picture-in-picture';
    frame.tabIndex = -1;
    frame.setAttribute('aria-hidden', 'true');
    frame.dataset.project = project.id;
    const slot = { index, frame, aspect: 16 / 9, player: null, disposed: false, warmed: false, parking: false, selectedAt: performance.now() };
    slots.set(index, slot);
    layer.append(frame);
    fit();
    slot.ready = sdk().then(async Vimeo => {
      if (slot.disposed) return;
      const player = slot.player = new Vimeo.Player(frame);
      player.on('timeupdate', event => {
        if (slot.disposed) return;
        if (slot.index === active) {
          root.dataset.videoTime = String(event.seconds);
          if (event.seconds > 0.05) reveal(slot);
        } else if (event.seconds > 0.15) park(slot);
      });
      player.on('ended', () => { if (slot.index === active && canPlay() && !hovered) select((active + 1) % featured.length); });
      player.on('error', () => {
        if (slot.index !== active || slot.disposed) return;
        slot.frame.classList.remove('is-visible');
        root.dataset.videoState = 'poster';
        readyToCount = true;
        cycle();
      });
      await player.ready();
      if (slot.disposed) return;
      Promise.all([player.getVideoWidth(), player.getVideoHeight()]).then(([w, h]) => { if (!slot.disposed && w && h) { slot.aspect = w / h; fit(); } }).catch(() => {});
      await player.setMuted(true);
      if (slot.disposed) return;
      if (canPlay() && (slot.index === active || !saveData)) await player.play().catch(() => {});
    }).catch(() => {});
    return slot;
  }
  function scheduleWarmup() {
    clearTimeout(warmTimer);
    if (saveData || !canPlay()) return;
    warmTimer = setTimeout(() => {
      if (!canPlay()) return;
      const next = (active + 1) % featured.length;
      retain([active, next]);
      ensure(next);
    }, 1000);
  }
  function updateCopy(index) {
    const project = featured[index];
    image.src = project.cover;
    title.replaceChildren();
    const parts = project.id === 'dary_2' ? ['Дары', 'Кубани 2'] : project.id === 'zenit' ? ['Банк', 'Зенит'] : ['', project.name];
    if (parts[0]) { const line = document.createElement('span'); line.textContent = parts[0]; title.append(line); }
    const last = document.createElement('span'); last.className = 'hero-last-line'; last.append(document.createTextNode(parts[1] + ' '));
    const link = document.createElement('a'); link.className = 'project-dot';
    const route = routes[project.id]; link.dataset.reviewPage = route[0]; link.href = '' + route[1]; link.setAttribute('aria-label', 'О проекте ' + project.name);
    link.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M6 18 18 6M6 6h12v12"/></svg>';
    last.append(link); title.append(last);
    root.querySelectorAll('[data-slide]').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.slide) === index)));
    root.dataset.activeProject = project.id;
  }
  async function select(index) {
    index = (index + featured.length) % featured.length;
    if (index === active) return;
    const token = ++selection;
    stopCycle(); clearTimeout(warmTimer); clearTimeout(fallbackTimer);
    elapsed = 0; readyToCount = false; progress.style.transform = 'scaleX(0)';
    for (const slot of slots.values()) {
      slot.frame.classList.remove('is-visible');
      if (slot.index !== index && slot.player) slot.player.pause().catch(() => {});
    }
    active = index;
    retain([active]);
    updateCopy(index);
    root.dataset.videoState = 'poster'; delete root.dataset.videoTime;
    if (!canPlay()) return;
    root.dataset.videoState = 'loading';
    const slot = ensure(index); slot.selectedAt = performance.now();
    fallbackTimer = setTimeout(() => {
      if (token !== selection) return;
      root.dataset.videoState = 'poster'; readyToCount = true; cycle();
    }, 8000);
    await slot.ready;
    if (token !== selection || slot.disposed || !canPlay() || !slot.player) return;
    await slot.player.play().catch(() => {});
  }
  function suspendOrResume() {
    if (!canPlay()) {
      stopCycle(); clearTimeout(warmTimer);
      for (const slot of slots.values()) slot.player?.pause().catch(() => {});
    } else {
      const slot = slots.get(active) || ensure(active);
      slot.ready.then(() => { if (!slot.disposed && slot.index === active && canPlay()) slot.player?.play().catch(() => {}); });
      cycle(); scheduleWarmup();
    }
  }
  root.querySelectorAll('[data-slide]').forEach(button => button.addEventListener('click', () => select(Number(button.dataset.slide))));
  film.addEventListener('pointerenter', () => { hovered = true; stopCycle(); });
  film.addEventListener('pointerleave', () => { hovered = false; cycle(); });
  film.addEventListener('focusin', () => { hovered = true; stopCycle(); });
  film.addEventListener('focusout', event => { if (!film.contains(event.relatedTarget)) { hovered = false; cycle(); } });
  document.addEventListener('visibilitychange', suspendOrResume);
  new IntersectionObserver(entries => { inView = entries[0].isIntersecting; suspendOrResume(); }, { threshold: 0 }).observe(hero);
  motion.addEventListener('change', () => { paused = staticMode || motion.matches || saveData; film.classList.toggle('is-paused', paused); suspendOrResume(); });
  let pointer;
  hero.addEventListener('pointerdown', event => { if (!event.target.closest('a,button')) pointer = { x: event.clientX, y: event.clientY }; });
  hero.addEventListener('pointerup', event => { if (!pointer) return; const dx = event.clientX - pointer.x, dy = event.clientY - pointer.y; pointer = null; if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.3) select(active + (dx < 0 ? 1 : -1)); });
  hero.addEventListener('pointercancel', () => { pointer = null; });
  document.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey || !inView || event.target.closest('input,textarea,select')) return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); select(active + (event.key === 'ArrowRight' ? 1 : -1)); }
  });
  film.classList.toggle('is-paused', paused);
  const initial = featured.findIndex(project => project.id === query.get('project'));
  select(initial >= 0 ? initial : 0);
})();
