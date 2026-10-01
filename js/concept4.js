/* 시안 4 — 인터랙션 전용 스크립트
   마크업은 index4.html에 정적 HTML로 들어 있습니다(검색엔진이 JS 없이 내용을 읽을 수 있도록).
   이 파일은 이미 있는 요소에 동작만 붙입니다. 문구 · 사진 수정은 index4.html에서 하세요. */
(() => {
"use strict";

function icon(name, size = 20) {
  const common = `width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"`;
  const filled = `width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"`;
  const icons = {
    phone: `<svg ${common}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z"></path></svg>`,
    kakao: `<svg ${filled}><path d="M12 3C6.9 3 3 6.25 3 10.32c0 2.55 1.58 4.8 4.02 6.12-.16.62-.57 2.23-.66 2.59-.1.42.15.47.42.28.21-.15 2.27-1.55 3.18-2.18.66.1 1.34.16 2.04.16 5.1 0 9-3.25 9-7.29C21 6.25 17.1 3 12 3Z"></path></svg>`,
    arrowRight: `<svg ${common}><path d="M5 12h14"></path><path d="m13 6 6 6-6 6"></path></svg>`,
    arrowLeft: `<svg ${common}><path d="M19 12H5"></path><path d="m11 18-6-6 6-6"></path></svg>`,
    menu: `<svg ${common}><path d="M4 7h16"></path><path d="M4 12h16"></path><path d="M4 17h16"></path></svg>`,
    x: `<svg ${common}><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>`,
    play: `<svg ${filled}><path d="M8 5v14l11-7-11-7Z"></path></svg>`,
    pause: `<svg ${filled}><rect x="6" y="5" width="4" height="14" rx="1"></rect><rect x="14" y="5" width="4" height="14" rx="1"></rect></svg>`,
    chevronDown: `<svg ${common}><path d="m6 9 6 6 6-6"></path></svg>`,
    chevronUp: `<svg ${common}><path d="m18 15-6-6-6 6"></path></svg>`,
    map: `<svg ${common}><path d="M14.5 4.5 9.5 2 4 4.5v17l5.5-2.5 5 2.5 5.5-2.5v-17l-5.5 2.5Z"></path><path d="M9.5 2v17"></path><path d="M14.5 4.5v17"></path></svg>`,
    top: `<svg ${common}><path d="m18 15-6-6-6 6"></path><path d="M12 9v11"></path><path d="M5 4h14"></path></svg>`,
    route: `<svg ${common}><circle cx="6" cy="19" r="2"></circle><circle cx="18" cy="5" r="2"></circle><path d="M8 19h4a4 4 0 0 0 0-8h-1a4 4 0 0 1 0-8h5"></path></svg>`,
    parking: `<svg ${common}><path d="M8 20V4h6a4 4 0 0 1 0 8H8"></path></svg>`,
    store: `<svg ${common}><path d="M4 10h16l-1-5H5l-1 5Z"></path><path d="M6 10v10h12V10"></path><path d="M9 20v-6h6v6"></path></svg>`,
    bag: `<svg ${common}><path d="M6 8h12l1 13H5L6 8Z"></path><path d="M9 8a3 3 0 0 1 6 0"></path></svg>`,
    shower: `<svg ${common}><path d="M4 20h16"></path><path d="M7 20v-9a5 5 0 0 1 10 0"></path><path d="M14 11h5"></path><path d="M14 15h5"></path></svg>`,
    ball: `<svg ${common}><circle cx="12" cy="12" r="8"></circle><path d="m12 7 4 3-1.5 5h-5L8 10l4-3Z"></path><path d="M8 10 5 9"></path><path d="m16 10 3-1"></path><path d="m9.5 15-2 3"></path><path d="m14.5 15 2 3"></path></svg>`,
    football: `<svg ${common}><ellipse cx="12" cy="12" rx="8" ry="5" transform="rotate(-25 12 12)"></ellipse><path d="m9 13 6-3"></path><path d="m10 10 1 2"></path><path d="m13 9 1 2"></path></svg>`,
    vest: `<svg ${common}><path d="M8 4 5 7v13h14V7l-3-3-2.2 2h-3.6L8 4Z"></path><path d="M9 12h6"></path></svg>`,
    shoe: `<svg ${common}><path d="M4 15c3.2.5 6.2.2 8-2.5l1.5-3 2.5 1.5 4 4v3H4v-3Z"></path><path d="M8 15v3"></path><path d="M12 14v4"></path></svg>`,
    sock: `<svg ${common}><path d="M8 3h8v9l-2 3v5H8v-5l2-3V3Z"></path><path d="M8 7h8"></path></svg>`,
    glove: `<svg ${common}><path d="M7 13V6a2 2 0 0 1 4 0v5"></path><path d="M11 11V5a2 2 0 0 1 4 0v7"></path><path d="M15 12V8a2 2 0 0 1 4 0v7a6 6 0 0 1-12 0v-2"></path></svg>`,
    pump: `<svg ${common}><path d="M8 5h8"></path><path d="M12 5v5"></path><path d="M8 10h8v10H8V10Z"></path><path d="M16 15h3v4"></path></svg>`,
    med: `<svg ${common}><rect x="4" y="7" width="16" height="13" rx="2"></rect><path d="M9 7V5h6v2"></path><path d="M12 10v7"></path><path d="M8.5 13.5h7"></path></svg>`,
    towel: `<svg ${common}><path d="M7 4h10a2 2 0 0 1 2 2v3H7a3 3 0 0 0 0 6h12v3a2 2 0 0 1-2 2H7a5 5 0 0 1 0-10h12"></path><path d="M9 7h6"></path><path d="M9 17h6"></path></svg>`,
    cone: `<svg ${common}><path d="m12 4 5 15H7l5-15Z"></path><path d="M9 13h6"></path><path d="M6 20h12"></path></svg>`,
  };
  return icons[name] || icons.ball;
}

function initLoader() {
  const loader = document.querySelector(".loader");
  if (!loader) return;
  setTimeout(() => loader.classList.add("is-hidden"), 2200);
  setTimeout(() => loader.remove(), 3100);
}

function initDrawer() {
  const drawer = document.querySelector(".mobile-drawer");
  const scrim = document.querySelector(".drawer-scrim");
  const openButtons = document.querySelectorAll("[data-menu-open]");
  const closeTargets = document.querySelectorAll(
    "[data-menu-close], [data-menu-link]",
  );

  const setOpen = (open) => {
    document.body.classList.toggle("drawer-open", open);
    drawer?.classList.toggle("open", open);
    scrim?.classList.toggle("open", open);
    drawer?.setAttribute("aria-hidden", String(!open));
  };

  openButtons.forEach((button) =>
    button.addEventListener("click", () => setOpen(true)),
  );
  closeTargets.forEach((target) =>
    target.addEventListener("click", () => setOpen(false)),
  );
}

function initHero() {
 const video=document.querySelector('.hero-video');
 const mobile=matchMedia('(max-width:860px)').matches;
 video.poster=`assets/video/hero-poster-${mobile?'mobile':'desktop'}.jpg`;
 video.src=`assets/video/hero-${mobile?'mobile':'desktop'}.mp4`;
 const autoplay=!matchMedia('(prefers-reduced-motion: reduce)').matches;
 if(autoplay) video.play().catch(()=>{});
 // 고정(sticky) hero가 뒤 섹션 아래에 계속 깔려 있으면, 모바일에서 빠르게 스크롤할 때
 // 섹션이 그려지기 전 hero가 비쳐 보임 → 한 화면 이상 벗어나면 숨기고 영상도 멈춤
 const hero=document.querySelector('.video-hero');
 let hidden=false;
 const update=()=>{
  const next=scrollY>hero.offsetHeight+innerHeight;
  if(next===hidden) return;
  hidden=next;
  hero.classList.toggle('is-offscreen',hidden);
  if(hidden) video.pause(); else if(autoplay) video.play().catch(()=>{});
 };
 addEventListener('scroll',update,{passive:true});
 addEventListener('resize',update);
 update();
}

function initGallery() {
 const cards=[...document.querySelectorAll('[data-gallery-image]')]; let active=0,dialog,opener;
 const show=(index)=>{active=(index+cards.length)%cards.length;const card=cards[active];dialog.querySelector('img').src=card.dataset.galleryImage;dialog.querySelector('img').alt=card.dataset.galleryLabel;dialog.querySelector('figcaption').textContent=`${card.dataset.galleryLabel} · ${active+1} / ${cards.length}`;};
 const FADE_MS=matchMedia('(prefers-reduced-motion: reduce)').matches?0:300;
 // 닫기: .is-visible을 떼서 페이드 아웃 → 끝난 뒤 dialog 제거 (중복 클릭 방지)
 const close=()=>{if(!dialog||dialog.dataset.closing)return;const d=dialog;d.dataset.closing='1';d.classList.remove('is-visible');setTimeout(()=>{d.close();d.remove();if(dialog===d)dialog=null;document.body.style.overflow='';opener?.focus();},FADE_MS);};
 cards.forEach((card,index)=>card.addEventListener('click',()=>{
 opener=card;dialog=document.createElement('dialog');dialog.className='lightbox gallery-dialog';dialog.setAttribute('aria-label','풋살장 사진 크게 보기');
 dialog.innerHTML=`<button class="lightbox-close" aria-label="미리보기 닫기">${icon('x',22)}</button><button class="gallery-prev" aria-label="이전 사진">${icon('arrowLeft',26)}</button><figure><img alt=""><figcaption aria-live="polite"></figcaption></figure><button class="gallery-next" aria-label="다음 사진">${icon('arrowRight',26)}</button>`;
 document.body.append(dialog);show(index);dialog.showModal();document.body.style.overflow='hidden';
 // 열기: 투명 상태(opacity 0)를 먼저 확정한 뒤 .is-visible을 붙여 페이드 인 (프레임 타이밍에 의존하지 않음)
 getComputedStyle(dialog).opacity;dialog.classList.add('is-visible');
 dialog.querySelector('.lightbox-close').onclick=close;dialog.querySelector('.gallery-prev').onclick=()=>show(active-1);dialog.querySelector('.gallery-next').onclick=()=>show(active+1);
 dialog.addEventListener('cancel',e=>{e.preventDefault();close();});dialog.addEventListener('click',e=>{if(e.target===dialog)close();});
 dialog.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();show(active-1);}if(e.key==='ArrowRight'){e.preventDefault();show(active+1);}});
 }));
}

function initFaq() {
  document.querySelectorAll(".faq-item").forEach((item) => {
    const button = item.querySelector("[data-faq-button]");
    const toggle = item.querySelector(".faq-toggle");
    button?.addEventListener("click", () => {
      const open = item.classList.toggle("open");
      button.setAttribute("aria-expanded", String(open));
      if (toggle) toggle.textContent = open ? "-" : "+";
    });
  });
}

function initMobileSliders() {
  const media = window.matchMedia("(max-width: 860px)");
  const sliders = Array.from(document.querySelectorAll("[data-mobile-slider]"));

  sliders.forEach((slider) => {
    const track = slider.querySelector("[data-slider-track]");
    const slides = Array.from(track?.children || []);
    const dots = Array.from(slider.querySelectorAll("[data-slider-dot]"));
    const prev = slider.querySelector("[data-slider-prev]");
    const next = slider.querySelector("[data-slider-next]");
    let active = 0;
    let timer;
    let touchStartX = 0;

    if (!track || slides.length < 2) return;

    const update = () => {
      if (!media.matches) {
        track.style.transform = "";
        return;
      }

      const gap = Number.parseFloat(window.getComputedStyle(track).columnGap) || 0;
      const width = slides[0].getBoundingClientRect().width;
      track.style.transform = `translateX(-${active * (width + gap)}px)`;
      dots.forEach((dot, index) => dot.classList.toggle("active", index === active));
    };

    const goTo = (index) => {
      active = (index + slides.length) % slides.length;
      update();
    };

    const start = () => {
      clearInterval(timer);
      if (media.matches) {
        timer = setInterval(() => goTo(active + 1), 4200);
      }
    };

    const stop = () => clearInterval(timer);

    prev?.addEventListener("click", () => {
      goTo(active - 1);
      start();
    });
    next?.addEventListener("click", () => {
      goTo(active + 1);
      start();
    });
    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => {
        goTo(index);
        start();
      });
    });
    track.addEventListener(
      "touchstart",
      (event) => {
        touchStartX = event.touches[0].clientX;
        stop();
      },
      { passive: true },
    );
    track.addEventListener(
      "touchend",
      (event) => {
        const diff = event.changedTouches[0].clientX - touchStartX;
        if (Math.abs(diff) > 36) goTo(active + (diff < 0 ? 1 : -1));
        start();
      },
      { passive: true },
    );
    const handleMediaChange = () => {
      update();
      start();
    };
    window.addEventListener("resize", update);
    if (media.addEventListener) {
      media.addEventListener("change", handleMediaChange);
    } else if (media.addListener) {
      media.addListener(handleMediaChange);
    }

    update();
    start();
  });
}

function initFooter() {
  const footerButton = document.querySelector("[data-footer-toggle]");
  const footerPanel = document.querySelector("[data-footer-panel]");
  const bizButton = document.querySelector("[data-biz-toggle]");
  const bizContent = document.querySelector(".biz-content");
  let footerOpen = false;
  let bizOpen = false;

  footerButton?.addEventListener("click", () => {
    footerOpen = !footerOpen;
    footerButton.setAttribute("aria-expanded", String(footerOpen));
    footerButton.innerHTML = `사이트 정보 ${icon(footerOpen ? "chevronUp" : "chevronDown", 18)}`;
    footerPanel?.classList.toggle("open", footerOpen);
  });

  bizButton?.addEventListener("click", () => {
    bizOpen = !bizOpen;
    bizButton.setAttribute("aria-expanded", String(bizOpen));
    bizButton.innerHTML = `사업자 정보 ${icon(bizOpen ? "chevronUp" : "chevronDown", 18)}`;
    bizContent?.classList.toggle("open", bizOpen);
  });
}

function initQuickActions() {
  const quickActions = document.querySelector(".quick-actions");
  const footer = document.querySelector(".site-footer");
  const updateFooterOverlap = () => {
    if (!quickActions || !footer) return;
    const rect = footer.getBoundingClientRect();
    quickActions.classList.toggle(
      "over-footer",
      rect.top < window.innerHeight && rect.bottom > 0,
    );
  };

  document.querySelector("[data-scroll-top]")?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  updateFooterOverlap();
  window.addEventListener("scroll", updateFooterOverlap, { passive: true });
  window.addEventListener("resize", updateFooterOverlap);
}

function initScrollAnimations() {
  const elements = Array.from(document.querySelectorAll("[data-anim]"));
  if (!("IntersectionObserver" in window)) {
    elements.forEach((element) => element.classList.add("is-inview"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-inview");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
  );

  elements.forEach((element) => observer.observe(element));
}

function initHeaderTone() {
 const header=document.querySelector('.site-header');
 const brand=header.querySelector('.yd-loader-logo');
 const marker=document.createElement('div');
 marker.className='header-scroll-marker';marker.setAttribute('aria-hidden','true');
 document.body.prepend(marker);
 const update=(scrolled)=>{header.classList.toggle('is-scrolled',scrolled);brand.src=`assets/brand/logo-${scrolled?'black':'white'}-green.svg`;};
 update(window.scrollY>32);
 new IntersectionObserver(([entry])=>update(entry.boundingClientRect.bottom<=0),{threshold:0}).observe(marker);
}

function initSite() {
  initHeaderTone();
  initLoader();
  initDrawer();
  initHero();
  initGallery();
  initFaq();
  initMobileSliders();
  initFooter();
  initQuickActions();
  initScrollAnimations();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initSite);
} else {
  initSite();
}
})();
