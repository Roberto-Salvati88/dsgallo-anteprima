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
    scrollTrigger: { trigger: section, start: "top top", end: "bottom bottom", scrub: 1 },
  });

  // con il finale del logo (home) il video occupa la prima parte dello scroll, poi la scena si ferma
  const sceneEnd = outro ? 0.6 : 1;
  tl.to({}, { duration: sceneEnd, onUpdate() { drawScene(this.progress()); } }, 0)
    .to(hint, { opacity: 0, duration: 0.06 }, 0)
    .to(copy, { opacity: 0, y: -60, duration: 0.22 }, 0.06)
    .to(scrim, { opacity: 0, duration: 0.25 }, 0.06);

  // finale della home: lo sfondo chiaro copre il video, poi il logo 3D entra girando
  // lentamente e si ferma di fronte, infine compare la scritta; un tratto di scroll fermo prima di uscire
  if (outro) {
    const logo = section.querySelector("[data-logo3d]");
    const scritta = section.querySelector("[data-logo3d-scritta]");
    const model = logo && logo3d(logo, { gsap });
    const spin = { p: 0 };
    tl.fromTo(outro, { opacity: 0 }, { opacity: 1, duration: 0.06 }, sceneEnd - 0.02)
      .fromTo(logo, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.1, ease: "power2.out" }, sceneEnd + 0.03)
      .to(spin, { p: 1, duration: 0.24, ease: "power2.out", onUpdate: () => model?.setScroll(spin.p) }, sceneEnd + 0.03)
      .fromTo(scritta, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.08, ease: "power2.out" }, sceneEnd + 0.2)
      .to({}, { duration: 0.08 }, sceneEnd + 0.28);
    tl.eventCallback("onUpdate", () => outro.classList.toggle("is-live", tl.progress() > 0.82));
    model?.setScroll(0);
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
