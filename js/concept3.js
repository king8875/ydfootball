(() => {
  'use strict';
  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];
  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');

  const menuButton = $('.menu-button');
  const navigation = $('.site-nav');
  const setMenu = (open) => {
    navigation.classList.toggle('is-open', open);
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.textContent = open ? 'CLOSE' : 'MENU';
    document.body.classList.toggle('is-menu-open', open);
  };
  menuButton.addEventListener('click', () => setMenu(!navigation.classList.contains('is-open')));
  navigation.addEventListener('click', (event) => { if (event.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') setMenu(false); });

  const sceneProgress = (section) => {
    const rect = section.getBoundingClientRect();
    const travel = section.offsetHeight - innerHeight;
    return travel > 0 ? clamp(-rect.top / travel) : 0;
  };
  const hero = $('[data-scene="hero"]');
  const ground = $('[data-scene="ground"]');
  const spaces = $('[data-scene="spaces"]');
  const heroTitle = $('.hero-title');
  const heroBg = $('.hero-bg');
  const heroWindows = $$('.hero-window');
  const heroCopy = $('.hero-copy');
  const groundFrame = $('.ground-frame');
  const groundImage = $('.ground-frame img');
  const groundIntro = $('.ground-intro');
  const groundWords = $$('.ground-words span');
  const spacesTrack = $('.spaces-track');
  const spacesCurrent = $('.spaces-current');
  let frame = 0;

  const render = () => {
    frame = 0;
    if (reduceMotion.matches) return;
    const hp = sceneProgress(hero);
    heroTitle.style.transform = `translate3d(0, ${-hp * 24}vh, 0)`;
    heroTitle.style.opacity = String(clamp(1 - hp * 1.35));
    heroBg.style.transform = `translate3d(0, ${hp * 3}%, 0) scale(${1.08 + hp * .08})`;
    heroWindows.forEach((window, index) => {
      const startY = index === 1 ? -42 : -50;
      const shift = [10, 14, 8][index];
      const growth = [.65, 1.25, .85][index];
      window.style.transform = `translate(-50%, ${startY - hp * shift}%) scale(${1 + hp * growth})`;
      window.style.opacity = String(clamp(1 - Math.max(0, hp - .78) * 4.5));
    });
    heroCopy.style.opacity = String(clamp(1 - hp * 2));

    const gp = sceneProgress(ground);
    // 스크롤 끝(gp = 1)에서 너비 100vw · 높이 100vh로 화면 전체를 채움
    const frameWidth = innerWidth < 681 ? 58 + gp * 42 : 34 + gp * 66;
    groundFrame.style.width = `${frameWidth}vw`;
    groundFrame.style.height = `${76 + gp * 24}vh`;
    groundImage.style.transform = `translate3d(0, ${-gp * 10}%, 0) scale(${1.08 - gp * .08})`;
    groundWords[0].style.transform = `translate3d(${-gp * 12}vw, 0, 0)`;
    groundWords[1].style.transform = `translate3d(${gp * 13}vw, 0, 0)`;
    groundWords[2].style.transform = `translate3d(${gp * 8}vw, 0, 0)`;
    const introProgress = clamp((gp - .58) / .22);
    groundIntro.style.opacity = String(introProgress);
    groundIntro.style.transform = `translate3d(0, ${(1 - introProgress) * 30}px, 0)`;

    const sp = sceneProgress(spaces);
    const available = Math.max(0, spacesTrack.scrollWidth - (innerWidth * (innerWidth < 681 ? 1 : .7)) + 20);
    spacesTrack.style.transform = `translate3d(${-sp * available}px, 0, 0)`;
    spacesCurrent.textContent = String(Math.min(6, Math.floor(sp * 6) + 1)).padStart(2, '0');
  };
  const requestRender = () => { if (!frame) frame = requestAnimationFrame(render); };
  addEventListener('scroll', requestRender, { passive: true });
  addEventListener('resize', requestRender);
  reduceMotion.addEventListener('change', () => {
    if (reduceMotion.matches) {
      [heroTitle, heroBg, heroCopy, groundFrame, groundImage, groundIntro, spacesTrack, ...heroWindows, ...groundWords].forEach((el) => { el.style.cssText = ''; });
    }
    requestRender();
  });
  document.fonts?.ready.then(requestRender);
  requestRender();

  $$('.guide-list details').forEach((details) => {
    const summary = $('summary', details);
    let animation;
    let targetOpen = details.open;
    const finish = () => {
      if (animation) { animation.onfinish = null; animation.cancel(); animation = null; }
      details.open = targetOpen;
      details.style.height = '';
      details.style.overflow = '';
    };
    summary.addEventListener('click', (event) => {
      if (!details.animate || reduceMotion.matches) return;
      event.preventDefault();
      targetOpen = !targetOpen;
      if (animation) { animation.onfinish = null; animation.cancel(); }
      const start = details.getBoundingClientRect().height;
      details.style.height = '';
      details.open = targetOpen;
      const end = details.getBoundingClientRect().height;
      details.open = true;
      details.style.height = `${start}px`;
      details.style.overflow = 'hidden';
      animation = details.animate({ height: [`${start}px`, `${end}px`] }, { duration: 320, easing: 'cubic-bezier(.2,.7,.2,1)' });
      animation.onfinish = finish;
    });
  });

  const toast = $('.toast');
  let toastTimer;
  $('.copy-address').addEventListener('click', async (event) => {
    const address = event.currentTarget.dataset.address;
    try { await navigator.clipboard.writeText(address); toast.textContent = '주소를 복사했습니다.'; }
    catch { toast.textContent = address; }
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2600);
  });
  $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

  // 맨 위로 버튼: 첫 화면을 지나면 나타남
  const toTop = $('.to-top');
  const updateToTop = () => toTop.classList.toggle('is-visible', scrollY > innerHeight * .8);
  addEventListener('scroll', updateToTop, { passive: true });
  updateToTop();
})();
