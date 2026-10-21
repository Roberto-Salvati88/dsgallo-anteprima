// Pagina pratiche edilizie: la linea del percorso si riempie con lo scroll
// e ogni tappa si accende quando la linea la raggiunge.
export default function percorso(section, { gsap, ScrollTrigger, reduce }) {
  const track = section.querySelector(".percorso__track");
  const fill = section.querySelector(".percorso__fill");
  const steps = [...section.querySelectorAll(".percorso__step")];

  if (reduce || !gsap) {
    fill.style.height = "100%";
    steps.forEach((s) => s.classList.add("is-done"));
    return;
  }

  gsap.to(fill, {
    height: "100%",
    ease: "none",
    scrollTrigger: { trigger: track, start: "top 65%", end: "bottom 65%", scrub: true },
  });

  steps.forEach((s) => {
    ScrollTrigger.create({
      trigger: s,
      start: "top 65%",
      onEnter: () => s.classList.add("is-done"),
      onLeaveBack: () => s.classList.remove("is-done"),
    });
  });
}
