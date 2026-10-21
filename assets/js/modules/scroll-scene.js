// Scena a schermo pieno pilotata dallo scroll, usata nelle pagine servizio.
// Con un video (porta che si apre, tapparella che scende) lo scroll lo fa avanzare:
// video sugli schermi grandi, sequenza di immagini su telefono (vedi scrub.js).
// Senza video è una dissolvenza dalla scena A alla scena B.
import { scrubber } from "./scrub.js";

export default function scrollScene(section, { gsap, reduce }) {
  const pin = section.querySelector(".scene__pin");
  const layerB = section.querySelector(".scene__layer--b");
  const video = section.querySelector(".scene__video");
  const canvas = section.querySelector(".scene__canvas");
  const marks = [...section.querySelectorAll(".scene__progress span")];

  // dentro il contenitore bloccato il caricamento "lazy" può non partire mai
  section.querySelectorAll("img[loading=lazy]").forEach((img) => (img.loading = "eager"));

  if (reduce || !gsap) {
    if (layerB) layerB.style.opacity = 1;
    return;
  }

  const tl = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: section,
      start: "top top",
      end: video ? "+=220%" : "+=150%",
      pin,
      scrub: 0.5,
      onUpdate: (st) => marks.forEach((m, i) => m.classList.toggle("is-on", st.progress >= i / marks.length)),
    },
  });

  if (video) {
    const draw = scrubber(section, canvas, video);
    tl.to({}, { duration: 1, onUpdate() { draw(this.progress()); } }, 0);
  } else if (layerB) {
    tl.fromTo(layerB, { opacity: 0, scale: 1.04 }, { opacity: 1, scale: 1, duration: 1 }, 0);
  }
}
