/* Concept 02 — native interactions, no animation dependencies. */
(() => {
  'use strict';
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const menu = $('.navigation');
  const menuToggle = $('.menu-toggle');
  const mobile = matchMedia('(max-width: 900px)');
  function setMenu(open, restoreFocus = false) {
    menu.classList.toggle('is-open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.innerHTML = open ? '닫기 <span aria-hidden="true">×</span>' : '메뉴 <span aria-hidden="true">☰</span>';
    if (restoreFocus) menuToggle.focus();
  }
  menuToggle.addEventListener('click', () => setMenu(menuToggle.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('click', (e) => { if (!e.target.closest('.header')) setMenu(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) setMenu(false, true);
  });
  document.addEventListener('focusin', (e) => { if (!e.target.closest('.header')) setMenu(false); });
  mobile.addEventListener('change', () => setMenu(false));

  // Native fragment navigation retains history; focus follows keyboard navigation.
  $$('a[href^="#"]').forEach((link) => link.addEventListener('click', () => {
    const target = document.getElementById(link.hash.slice(1));
    if (!target) return;
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  }));

  const heroPhoto = $('.hero-photo');
  let scheduled = false;
  function updateScroll() {
    scheduled = false;
    if (!reducedMotion.matches && innerWidth > 650 && scrollY < innerHeight) {
      heroPhoto.style.transform = `translateY(${Math.min(scrollY * .13, 75)}px) scale(1.15)`;
    } else {
      heroPhoto.style.transform = '';
    }
  }
  window.addEventListener('scroll', () => { if (!scheduled) { scheduled = true; requestAnimationFrame(updateScroll); } }, { passive: true });
  window.addEventListener('resize', updateScroll);
  reducedMotion.addEventListener('change', updateScroll);
  updateScroll();

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.remove('is-pending');
        observer.unobserve(entry.target);
      });
    }, { threshold: .08 });
    if (!reducedMotion.matches) $$('.reveal').forEach((el) => { el.classList.add('is-pending'); observer.observe(el); });
    reducedMotion.addEventListener('change', () => {
      if (reducedMotion.matches) $$('.reveal').forEach((el) => el.classList.remove('is-pending'));
    });
    const links = $$('.navigation a');
    const spy = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((link) => {
        if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }), { rootMargin: '-20% 0px -55% 0px' });
    links.forEach((link) => { const section = document.getElementById(link.hash.slice(1)); if (section) spy.observe(section); });
  }

  // Animate native details while retaining keyboard and no-JS behavior.
  $$('.guide-details details').forEach((details) => {
    const summary = details.querySelector('summary');
    let animation = null;
    let expanded = details.open;
    const settle = () => {
      if (animation) {
        animation.onfinish = null;
        animation.cancel();
        animation = null;
      }
      details.open = expanded;
      details.style.height = '';
      details.style.overflow = '';
      summary.setAttribute('aria-expanded', String(expanded));
    };
    summary.addEventListener('click', (event) => {
      if (!details.animate) return;
      event.preventDefault();
      expanded = !expanded;
      const start = details.getBoundingClientRect().height;
      if (animation) {
        animation.onfinish = null;
        animation.cancel();
      }
      if (reducedMotion.matches) { settle(); return; }
      details.style.height = '';
      details.open = expanded;
      const end = details.getBoundingClientRect().height;
      // Keep the answer rendered until a closing animation has finished.
      details.open = true;
      details.style.height = `${start}px`;
      details.style.overflow = 'hidden';
      summary.setAttribute('aria-expanded', String(expanded));
      animation = details.animate(
        { height: [`${start}px`, `${end}px`] },
        { duration: 300, easing: 'cubic-bezier(.2,.7,.2,1)' }
      );
      animation.onfinish = settle;
    });
    window.addEventListener('resize', () => { if (animation) settle(); });
    reducedMotion.addEventListener('change', () => { if (animation) settle(); });
  });

  const photos = [
    { key: 'pitch', name: '그라운드', alt: '그늘막 아래 넓은 인조잔디 구장 전경', description: '함께 뛰는 즐거움이 시작되는 곳.' },
    { key: 'walkway', name: '구장 옆 통로', alt: '그물망 너머로 구장이 보이는 옆 통로', description: '경기를 준비하며 그라운드로 향하는 길.' },
    { key: 'entrance', name: '입구', alt: '용두그린풋살 간판이 있는 입구', description: '용두그린풋살 간판을 찾아오세요.' },
    { key: 'lounge', name: '대기실', alt: '창가에 나무 벤치가 놓인 대기실', description: '경기 전후, 팀원들과 잠시 쉬어가는 공간.' },
    { key: 'restroom', name: '화장실', alt: '세면대가 있는 화장실 내부', description: '남·여 분리 화장실. 샤워 시설은 없습니다.' },
    { key: 'parking', name: '주차장', alt: '풋살장 앞 넓은 주차 공간', description: '최대 100대, 무료로 이용하는 주차 공간.' },
  ];
  const options = $$('.gallery-option');
  const dialog = $('.lightbox');
  let current = 0;
  let suppressClickUntil = 0;
  function selectPhoto(index) {
    current = (index + photos.length) % photos.length;
    const photo = photos[current];
    const src = `assets/images/gallery-${photo.key}-1600.webp`;
    $('#gallery-image').src = src;
    $('#gallery-image').alt = photo.alt;
    $('#gallery-description').textContent = photo.description;
    $('#gallery-count').textContent = `${String(current + 1).padStart(2, '0')} / 06`;
    options.forEach((option, i) => {
      option.classList.toggle('is-active', i === current);
      option.setAttribute('aria-pressed', String(i === current));
    });
    if (dialog.open) updateLightbox();
  }
  function updateLightbox() {
    const photo = photos[current];
    $('#lightbox-image').src = `assets/images/gallery-${photo.key}-1600.webp`;
    $('#lightbox-image').alt = photo.alt;
    $('#lightbox-title').textContent = `${String(current + 1).padStart(2, '0')} / 06 — ${photo.name}`;
  }
  options.forEach((option, index) => option.addEventListener('click', () => selectPhoto(index)));
  $('#gallery-prev').addEventListener('click', () => selectPhoto(current - 1));
  $('#gallery-next').addEventListener('click', () => selectPhoto(current + 1));
  $('.gallery-zoom').addEventListener('click', () => {
    if (Date.now() < suppressClickUntil) return;
    if (typeof dialog.showModal !== 'function') {
      window.open(`assets/images/gallery-${photos[current].key}-1600.webp`, '_blank', 'noopener');
      return;
    }
    updateLightbox();
    dialog.showModal();
    document.body.style.overflow = 'hidden';
  });
  $('.lightbox-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => { document.body.style.overflow = ''; $('.gallery-zoom').focus({ preventScroll: true }); });
  dialog.addEventListener('click', (e) => { if (e.target === dialog) { const r = dialog.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close(); } });
  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); selectPhoto(current + (e.key === 'ArrowRight' ? 1 : -1)); }
  });
  $('#lightbox-prev').addEventListener('click', () => selectPhoto(current - 1));
  $('#lightbox-next').addEventListener('click', () => selectPhoto(current + 1));
  let touchStart;
  $('.gallery-zoom').addEventListener('touchstart', (e) => { touchStart = { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY }; }, { passive: true });
  $('.gallery-zoom').addEventListener('touchend', (e) => {
    if (!touchStart) return;
    const dx = e.changedTouches[0].clientX - touchStart.x;
    const dy = e.changedTouches[0].clientY - touchStart.y;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy)) {
      selectPhoto(current + (dx < 0 ? 1 : -1));
      suppressClickUntil = Date.now() + 500;
    }
    touchStart = null;
  }, { passive: true });

  $$('input[name="slot"]').forEach((radio) => radio.addEventListener('change', () => {
    const late = radio.value === 'late';
    $('#price').textContent = late ? '140,000' : '120,000';
    $('#price-note').textContent = late ? '2시간 기준 · 심야 추가 요금 포함 · 부가세 별도' : '2시간 기준 · 부가세 별도';
  }));

  const toast = $('.toast');
  let toastTimer;
  function notify(message) {
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 4500);
  }
  $('.copy-address').addEventListener('click', async () => {
    const address = '경기도 고양시 덕양구 화랑로286번길 30';
    try { await navigator.clipboard.writeText(address); notify('주소를 복사했습니다. 지도 앱에 붙여넣어 주세요.'); }
    catch { notify(`자동 복사가 지원되지 않습니다. 주소: ${address}`); }
  });
  $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
})();
