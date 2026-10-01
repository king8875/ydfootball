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
      // html의 scroll-behavior: smooth가 켜져 있으면 ScrollTrigger가 위치를 다시 잴 때(refresh)
      // 스크롤 값을 잘못 읽어 word-band 시작 · 끝이 현재 스크롤만큼 어긋남(창을 1024px 아래로 줄였다 키우면 재현)
      // → 모션이 켜져 있는 동안은 CSS smooth를 끄고, 페이지 안 링크 이동만 JS로 부드럽게 처리
      const root = document.documentElement;
      const onAnchorClick = (event) => {
        const link = event.target.closest('a[href^="#"]');
        if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return;
        const target = document.getElementById(decodeURIComponent(link.hash.slice(1)));
        if (!target) return;
        event.preventDefault();
        target.scrollIntoView({ behavior: "smooth" });
        if (location.hash !== link.hash) history.pushState(null, "", link.hash);
      };
      const mm = gsap.matchMedia();
      mm.add(query, () => {
        document.documentElement.classList.add("desktop-motion");
        root.style.scrollBehavior = "auto";
        document.addEventListener("click", onAnchorClick);
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
        return () => {
          document.documentElement.classList.remove("desktop-motion");
          root.style.scrollBehavior = "";
          document.removeEventListener("click", onAnchorClick);
        };
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
