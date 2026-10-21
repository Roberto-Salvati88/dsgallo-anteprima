// Scena a schermo pieno pilotata dallo scroll, usata nelle pagine servizio:
// dissolvenza dalla scena A alla scena B (porta che si apre, tenda che si apre, tapparella che scende).
export default function scrollScene(section, { gsap, reduce }) {
  const pin = section.querySelector(".scene__pin");
  const layerB = section.querySelector(".scene__layer--b");
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
      end: "+=150%",
      pin,
      scrub: 0.5,
      onUpdate: (st) => marks.forEach((m, i) => m.classList.toggle("is-on", st.progress >= i / marks.length)),
    },
  });

  if (layerB) {
    tl.fromTo(layerB, { opacity: 0, scale: 1.04 }, { opacity: 1, scale: 1, duration: 1 }, 0);
  }
}
