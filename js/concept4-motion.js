/* 시안 4 — 데스크톱 전용 GSAP 모션 (assets/vendor의 GSAP를 필요할 때만 불러옴).
   Desktop-only GSAP. No scroll hijacking; mobile never loads the libraries.
   Edit travel/scrub below. matchMedia reverts inline styles and triggers on resize. */
(() => {
  "use strict";
  const query =
    "(min-width: 1024px) and (pointer: fine) and (prefers-reduced-motion: no-preference)";
  const media = window.matchMedia(query);
  const assetRoot = new URL("../assets/vendor/", document.currentScript.src);
  let loading;
  let initialized = false;
  function load(name) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = new URL(name, assetRoot).href;
      script.onload = resolve;
      script.onerror = () => {
        script.remove();
        reject(new Error("Motion library unavailable"));
      };
      document.head.append(script);
    });
  }
  async function init() {
    if (!media.matches || initialized) return;
    try {
      loading ||= (async () => {
        if (!window.gsap) await load("gsap.min.js");
        if (!window.ScrollTrigger) await load("ScrollTrigger.min.js");
      })();
      await loading;
      if (initialized) return;
      initialized = true;
      const { gsap, ScrollTrigger } = window;
      gsap.registerPlugin(ScrollTrigger);
      // 창 크기를 바꾸면 ScrollTrigger가 위치를 다시 재는데(refresh), 이때 잠깐 스크롤을 맨 위로 옮겼다 되돌립니다.
      // html에 scroll-behavior: smooth가 걸려 있으면 이 이동이 애니메이션되어 중간 위치를 재게 되고,
      // word-band 시작 · 끝 위치가 수천 px 어긋나 스크롤 연출이 엉뚱한 곳에서 움직였음 → 재는 동안만 smooth 해제
      const root = document.documentElement;
      ScrollTrigger.addEventListener("refreshInit", () => { root.style.scrollBehavior = "auto"; });
      // refresh 이벤트 뒤에도 ScrollTrigger가 스크롤 위치를 되돌리므로, 한 프레임 뒤에 smooth를 되살림
      ScrollTrigger.addEventListener("refresh", () => {
        requestAnimationFrame(() => requestAnimationFrame(() => { root.style.scrollBehavior = ""; }));
      });
      const mm = gsap.matchMedia();
      mm.add(query, () => {
        document.documentElement.classList.add("desktop-motion");
        const band = document.querySelector(".word-band");
        const scrollSettings = {
          trigger: band,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
          invalidateOnRefresh: true,
        };
        gsap.fromTo(
          ".motion-track-left",
          { xPercent: 0 },
          { xPercent: -24, ease: "none", scrollTrigger: { ...scrollSettings } },
        );
        gsap.fromTo(
          ".motion-track-right",
          { xPercent: -24 },
          { xPercent: 0, ease: "none", scrollTrigger: { ...scrollSettings } },
        );
        document
          .querySelectorAll("[data-motion-heading]")
          .forEach((heading) => {
            gsap.fromTo(
              heading,
              { x: heading.dataset.motionHeading === "left" ? -44 : 44 },
              {
                x: 0,
                ease: "none",
                scrollTrigger: {
                  trigger: heading,
                  start: "top 92%",
                  end: "top 55%",
                  scrub: 0.8,
                  invalidateOnRefresh: true,
                },
              },
            );
          });
        return () =>
          document.documentElement.classList.remove("desktop-motion");
      });
      document.fonts.ready.then(() => ScrollTrigger.refresh());
      if (document.readyState === "complete") ScrollTrigger.refresh();
      else
        window.addEventListener("load", () => ScrollTrigger.refresh(), {
          once: true,
        });
      // FAQ changes section heights; refresh after the native layout change.
      document.querySelectorAll("details").forEach((el) =>
        el.addEventListener("toggle", () => {
          if (media.matches) ScrollTrigger.refresh();
        }),
      );
    } catch {
      loading = undefined; // All content remains visible if a library fails to load.
    }
  }
  media.addEventListener("change", init);
  init();
})();
