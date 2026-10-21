// Hero a scorrimento (home e pagine servizio): lo scroll fa avanzare la scena
// (video su schermi grandi, sequenza di immagini su telefono: vedi scrub.js).
import logo3d from "./logo-3d.js";
import { scrubber } from "./scrub.js";

export default function heroFinestra(section, { gsap, ScrollTrigger, reduce }) {
  const canvas = section.querySelector("[data-hero-canvas]");
  const video = section.querySelector("[data-hero-video]");
  const copy = section.querySelector("[data-hero-copy]");
  const scrim = section.querySelector("[data-hero-scrim]");
  const outro = section.querySelector("[data-hero-outro]");
  const hint = section.querySelector("[data-hero-hint]");

  if (reduce || !gsap) {
    section.style.height = "auto";
    return;
  }

  const drawScene = scrubber(section, canvas, video);

  const tl = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: { trigger: section, start: "top top", end: "bottom bottom", scrub: 0.6 },
  });

  tl.to({}, { duration: 1, onUpdate() { drawScene(this.progress()); } }, 0)
    .to(hint, { opacity: 0, duration: 0.06 }, 0)
    .to(copy, { opacity: 0, y: -60, duration: 0.22 }, 0.06)
    .to(scrim, { opacity: 0, duration: 0.25 }, 0.06);

  // finale della home: il logo 3D copre il logo piatto del video e gira entrando
  if (outro) {
    tl.fromTo(outro, { opacity: 0 }, { opacity: 1, duration: 0.08 }, 0.8);
    const logo = section.querySelector("[data-logo3d]");
    const model = logo && logo3d(logo, { gsap });
    tl.eventCallback("onUpdate", () => {
      const p = tl.progress();
      outro.classList.toggle("is-live", p > 0.86);
      model?.setScroll(Math.min(Math.max((p - 0.82) / 0.18, 0), 1));
    });
  }

  // ingresso del titolo al caricamento
  gsap.from(section.querySelectorAll(".hero__line, .hero__lead, .hero__actions, .hero__rating, .eyebrow"), {
    y: 60,
    opacity: 0,
    duration: 1.2,
    ease: "power4.out",
    stagger: 0.08,
  });

  ScrollTrigger.refresh();
}
