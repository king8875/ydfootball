/* 용두그린풋살장 — interactions
   기본 기능(메뉴, 헤더, 현재 섹션 표시, 주소 복사, 바로가기)은 순수 JS.
   스크롤 연출은 GSAP + ScrollTrigger:
     - 데스크톱(≥1024px, hover 가능): 히어로 패럴랙스, 갤러리 가로 스크롤(pin),
       예약 단계 진행선, 사진 패럴랙스, 제목·목록 등장
     - 모바일: 제목·목록 등장만 짧게
     - 모션 감소 설정: 연출 없음
   부드러운 스크롤은 Lenis(휠 입력만 보간, 터치는 기본 스크롤 유지).
   GSAP·Lenis 로드에 실패해도 모든 콘텐츠와 기본 스크롤은 그대로 동작합니다. */
(() => {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const hasIO = 'IntersectionObserver' in window;
  const mobileNavQuery = matchMedia('(max-width: 1023px)');

  const header = $('#header');
  const nav = $('#nav');
  const menuBtn = $('.menu-btn');
  const menuLabel = $('.menu-btn__label');
  const quick = $('.quick');

  /* ---------- Lenis: 부드러운 스크롤 ---------- */
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const lenis = window.Lenis && !reduceMotion
    // lerp를 조금 높여(0.1→0.14) 입력을 덜 끌고, 휠 한 칸당 이동량은 약간 줄임
    ? new window.Lenis({ lerp: 0.14, wheelMultiplier: 0.85, smoothWheel: true })
    : null;

  /* ---------- 모바일 메뉴 ---------- */
  const setMenu = (open) => {
    nav.classList.toggle('is-open', open);
    header.classList.toggle('is-menu-open', open);
    if (open) header.classList.remove('is-hidden');
    menuBtn.setAttribute('aria-expanded', String(open));
    menuLabel.textContent = open ? '닫기' : '메뉴';
    // 스크롤 잠금은 html에 걸어야 scrollbar-gutter가 적용돼 레이아웃이 밀리지 않음
    document.documentElement.style.overflow = open ? 'hidden' : '';
    if (lenis) { if (open) lenis.stop(); else lenis.start(); }
    if (open) setTimeout(() => $('a', nav).focus(), 60);
  };

  menuBtn.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
  nav.addEventListener('click', (e) => { if (e.target.closest('a') && mobileNavQuery.matches) setMenu(false); });
  document.addEventListener('keydown', (e) => {
    if (!nav.classList.contains('is-open')) return;
    if (e.key === 'Escape') { setMenu(false); menuBtn.focus(); return; }
    if (e.key !== 'Tab') return;
    // 메뉴가 열려 있을 때 포커스를 메뉴 안에 가둠
    const items = [menuBtn, ...$$('a', nav)];
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  mobileNavQuery.addEventListener('change', (e) => { if (!e.matches) setMenu(false); });

  /* ---------- 현재 섹션 메뉴 표시 ---------- */
  const navLinks = $$('.nav__list a');
  if (hasIO) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((a) => {
          const on = a.getAttribute('href') === `#${entry.target.id}`;
          a.classList.toggle('is-active', on);
          if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    navLinks.map((a) => $(a.getAttribute('href'))).filter(Boolean).forEach((s) => spy.observe(s));
  }

  /* ---------- 스크롤: 헤더 상태 · 바로가기 TOP 표시 ---------- */
  // 헤더 숨김/표시는 같은 방향으로 HEADER_THRESHOLD 이상 움직였을 때만 바꿈.
  // (위치가 그대로인 프레임이나 1~2px 흔들림에는 반응하지 않음 → Lenis 감속 구간에서 깜빡임 방지)
  const HEADER_THRESHOLD = 12;
  let lastY = window.scrollY;
  let travel = 0;              // 같은 방향으로 이어서 움직인 거리 (+아래, -위)
  let anchorScrolling = false; // 메뉴 링크로 이동하는 동안은 헤더를 고정 표시
  let ticking = false;
  const onScroll = () => {
    const y = window.scrollY;
    const dy = y - lastY;
    lastY = y;
    ticking = false;
    header.classList.toggle('is-scrolled', y > 40);
    quick.classList.toggle('is-scrolled', y > window.innerHeight * 0.6);

    if (nav.classList.contains('is-open') || anchorScrolling) return;
    if (y < window.innerHeight) {          // 첫 화면에서는 항상 표시
      header.classList.remove('is-hidden');
      travel = 0;
      return;
    }
    if (dy === 0) return;
    if (Math.sign(dy) !== Math.sign(travel)) travel = 0;  // 방향이 바뀌면 다시 셈
    travel += dy;
    if (travel > HEADER_THRESHOLD) header.classList.add('is-hidden');
    else if (travel < -HEADER_THRESHOLD) header.classList.remove('is-hidden');
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  /* ---------- 페이지 안 링크(#id) 이동 ---------- */
  // 스크롤이 끝나면 키보드 포커스도 이동한 곳으로 옮김
  const focusTarget = (el) => {
    if (!el.hasAttribute('tabindex') && !el.matches('a, button, input, select, textarea')) el.setAttribute('tabindex', '-1');
    el.focus({ preventScroll: true });
  };
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const hash = a.getAttribute('href');
    const target = hash.length > 1 && document.getElementById(hash.slice(1));
    if (!target) return;
    const isTop = hash === '#top';
    const done = () => focusTarget(isTop ? $('.logo') : target);
    if (!lenis) {
      if (isTop) setTimeout(done, 500);
      return; // 기본 동작(CSS smooth scroll + scroll-padding) 사용
    }
    e.preventDefault();
    // #top은 주소창에 남기지 않음
    if (isTop) history.replaceState(null, '', location.pathname + location.search);
    else history.pushState(null, '', hash);
    // 이동하는 동안 헤더를 보이게 고정 (도착 위치가 헤더 바로 아래로 맞춰져 있음)
    anchorScrolling = true;
    header.classList.remove('is-hidden');
    const release = () => { anchorScrolling = false; travel = 0; lastY = window.scrollY; };
    const guard = setTimeout(release, 1600); // 사용자가 도중에 스크롤하면 onComplete가 안 올 수 있음
    // 헤더 높이만큼의 여백은 html의 scroll-padding-top을 Lenis가 그대로 반영함
    lenis.scrollTo(isTop ? 0 : target, {
      duration: 1.2,
      onComplete: () => { clearTimeout(guard); release(); done(); },
    });
  });

  /* ---------- 주소 복사 ---------- */
  const toast = $('.toast');
  let toastTimer;
  const showToast = (msg) => {
    toast.textContent = msg;
    toast.classList.add('is-show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-show'), 2200);
  };
  $$('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const text = btn.dataset.copy;
      try {
        await navigator.clipboard.writeText(text);
        showToast('주소를 복사했습니다');
      } catch {
        showToast(text);
      }
    });
  });

  /* ---------- 연도 ---------- */
  $$('[data-year]').forEach((el) => { el.textContent = String(new Date().getFullYear()); });

  /* =========================================================
     GSAP 스크롤 연출
     ========================================================= */
  const { gsap, ScrollTrigger } = window;
  const hasGsap = Boolean(gsap && ScrollTrigger);

  // Lenis를 GSAP 타이머에 묶어 ScrollTrigger와 같은 프레임에 갱신
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);
  if (lenis && hasGsap) {
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  } else if (lenis) {
    const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }

  if (!hasGsap) return;

  // 히어로 사이트명: 글자 단위로 감싸기 (스크린리더는 원문을 읽음)
  const brand = $('.hero__brand');
  const brandText = brand.textContent.trim();
  brand.innerHTML = `<span class="sr-only">${brandText}</span><span aria-hidden="true">${
    [...brandText].map((c) => `<span class="char-mask"><span class="char">${c}</span></span>`).join('')
  }</span>`;

  // 모든 섹션이 같은 구조(.section-head)라 선택자도 하나로 통일
  const HEADS = '.section-head';
  const ROWS = '.section-body .info-table > div, .fee__table tr, .refund__table tbody tr, .rental__list li, .rules li, .faq__list details';

  // 목록 행: 화면에 들어올 때 순서대로 등장
  const batchRows = (y, stagger) => {
    const rows = $$(ROWS);
    gsap.set(rows, { y, autoAlpha: 0 });
    ScrollTrigger.batch(rows, {
      start: 'top 92%',
      once: true,
      onEnter: (batch) => gsap.to(batch, { y: 0, autoAlpha: 1, duration: 0.6, ease: 'power2.out', stagger, overwrite: true }),
    });
  };

  const heroIntro = (dur) => {
    gsap.timeline({ defaults: { ease: 'power3.out' } })
      .from('.hero .char', { yPercent: 110, duration: dur, stagger: 0.04 })
      .from('.hero__slogan, .hero__desc, .hero .actions', { y: 24, autoAlpha: 0, duration: dur * 0.8, stagger: 0.1 }, '-=0.5')
      .from('.hero__specs dl > div', { y: 16, autoAlpha: 0, duration: dur * 0.7, stagger: 0.08 }, '-=0.5');
  };

  const mm = gsap.matchMedia();

  /* ----- 데스크톱 ----- */
  mm.add('(min-width: 1024px) and (hover: hover) and (prefers-reduced-motion: no-preference)', () => {
    heroIntro(0.9);

    // 히어로: 스크롤하면 사진은 천천히, 글은 조금 빠르게 올라가며 흐려짐
    const heroST = { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true };
    gsap.to('.hero__media img', { yPercent: 10, ease: 'none', scrollTrigger: heroST });
    gsap.to('.hero__content', { y: -80, autoAlpha: 0.2, ease: 'none', scrollTrigger: heroST });

    // 섹션 제목
    $$(HEADS).forEach((h) => {
      gsap.from(h, { y: 40, autoAlpha: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: h, start: 'top 85%', once: true } });
    });

    batchRows(24, 0.07);

    // 사진 패럴랙스 (프레임 안에서 사진만 움직임)
    ['.about__media img'].forEach((sel) => {
      gsap.fromTo(sel, { yPercent: -6, scale: 1.12 }, {
        yPercent: 6, scale: 1.12, ease: 'none',
        scrollTrigger: { trigger: $(sel).parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    });
    gsap.fromTo('.location__map svg', { scale: 1.15 }, {
      scale: 1, ease: 'none',
      scrollTrigger: { trigger: '.location', start: 'top bottom', end: 'center center', scrub: true },
    });

    // 갤러리: 세로 스크롤로 사진 트랙을 가로로 넘김
    const gallery = $('.gallery');
    const track = $('.gallery__grid');
    gallery.classList.add('is-track');

    // 가로로 밀려 있는 사진은 lazy 로딩이 이동 중에 시작돼 끊김이 생김
    // → 바로 앞 섹션(요금 · 예약)에 들어서면 미리 받아서 디코딩까지 끝내 둠
    ScrollTrigger.create({
      trigger: '#booking', start: 'top bottom', once: true,
      onEnter: () => $$('img', track).forEach((img) => {
        img.loading = 'eager';
        if (img.decode) img.decode().catch(() => {});
      }),
    });

    const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
    gsap.to(track, {
      x: () => -distance(),
      ease: 'none',
      force3D: true,
      scrollTrigger: {
        trigger: gallery, start: 'top top', end: () => `+=${distance()}`,
        // Lenis가 이미 스크롤을 보간하므로 scrub 지연은 두지 않음(이중 보간 방지)
        pin: true, scrub: true, invalidateOnRefresh: true,
      },
    });

    // 예약 단계: 진행선이 채워지면서 단계 번호가 켜짐
    const timeline = $('.timeline');
    const steps = $$('li', timeline);
    const bar = document.createElement('span');
    bar.className = 'timeline__bar';
    bar.setAttribute('aria-hidden', 'true');
    timeline.prepend(bar);
    timeline.classList.add('is-live');
    gsap.fromTo(bar, { scaleX: 0 }, {
      scaleX: 1, ease: 'none',
      scrollTrigger: {
        trigger: timeline, start: 'top 80%', end: 'bottom 50%', scrub: true,
        onUpdate: (self) => steps.forEach((li, i) => li.classList.toggle('is-on', self.progress >= i / steps.length + 0.02)),
      },
    });

    return () => {
      gallery.classList.remove('is-track');
      timeline.classList.remove('is-live');
      steps.forEach((li) => li.classList.remove('is-on'));
      bar.remove();
    };
  });

  /* ----- 모바일 · 태블릿 ----- */
  mm.add('(max-width: 1023px) and (prefers-reduced-motion: no-preference)', () => {
    heroIntro(0.6);
    $$(HEADS).forEach((h) => {
      gsap.from(h, { y: 16, autoAlpha: 0, duration: 0.5, ease: 'power2.out', scrollTrigger: { trigger: h, start: 'top 90%', once: true } });
    });
    batchRows(12, 0.04);
  });

  // 웹폰트 적용 후 위치 재계산
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
})();
