// Scroll fluido (Lenis) + animazioni d'ingresso (GSAP ScrollTrigger).
// Senza librerie o con "riduci movimento" il contenuto resta visibile e statico.
export function initMotion() {
  const { gsap, ScrollTrigger, Lenis } = window;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!gsap || !ScrollTrigger || reduce) {
    document.documentElement.classList.remove("js");
    return { gsap, ScrollTrigger, reduce: true };
  }

  gsap.registerPlugin(ScrollTrigger);
  // su mobile la barra degli indirizzi cambia l'altezza a ogni scroll: niente ricalcoli a scatti
  ScrollTrigger.config({ ignoreMobileResize: true });

  if (Lenis) {
    const lenis = new Lenis({ lerp: 0.11 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  gsap.utils.toArray("[data-reveal]").forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: "power3.out",
      delay: Number(el.dataset.revealDelay || 0),
      scrollTrigger: { trigger: el, start: "top 88%", once: true },
    });
  });

  gsap.utils.toArray("[data-parallax]").forEach((el) => {
    gsap.to(el, {
      yPercent: Number(el.dataset.parallax || 12),
      ease: "none",
      scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true },
    });
  });

  gsap.utils.toArray("[data-count]").forEach((el) => {
    const end = Number(el.dataset.count);
    const obj = { v: 0 };
    gsap.to(obj, {
      v: end,
      duration: 1.6,
      ease: "power2.out",
      scrollTrigger: { trigger: el, start: "top 90%", once: true },
      onUpdate: () => (el.textContent = Math.round(obj.v) + (el.dataset.suffix || "")),
    });
  });

  const hero = document.querySelector("[data-page-hero]");
  if (hero) {
    gsap.from(hero.querySelectorAll(".eyebrow, .page-hero__title, .page-hero__lead, .page-hero__actions"), {
      y: 40,
      opacity: 0,
      duration: 1.1,
      ease: "power3.out",
      stagger: 0.09,
    });
    const img = hero.querySelector(".page-hero__media img");
    if (img) {
      gsap.fromTo(img, { scale: 1.12 }, { scale: 1, duration: 2.2, ease: "power2.out" });
      gsap.to(img, { yPercent: 10, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true } });
    }
  }

  return { gsap, ScrollTrigger, reduce: false };
}
