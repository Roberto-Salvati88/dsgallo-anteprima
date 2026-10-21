// Pagina serramenti: lo scroll separa il serramento nei suoi componenti
// e accende uno alla volta i punti dell'elenco.
export default function esploso(section, { gsap, reduce }) {
  const pin = section.querySelector(".esploso__pin");
  const assembled = section.querySelector(".esploso__img--assemblato");
  const exploded = section.querySelector(".esploso__img--esploso");
  const steps = [...section.querySelectorAll("[data-step]")];

  const activate = (p) => {
    const i = Math.min(steps.length - 1, Math.floor(p * steps.length));
    steps.forEach((s, j) => s.classList.toggle("is-active", j <= i));
  };

  if (reduce || !gsap || window.innerWidth < 900) {
    exploded.style.opacity = 1;
    assembled.style.opacity = 0;
    steps.forEach((s) => s.classList.add("is-active"));
    return;
  }

  gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: "top top",
      end: "+=180%",
      pin,
      scrub: 0.6,
      onUpdate: (st) => activate(st.progress),
    },
  })
    .fromTo(assembled, { scale: 0.92 }, { scale: 1, duration: 0.3 })
    .to(assembled, { opacity: 0, scale: 1.05, duration: 0.3 }, 0.35)
    .fromTo(exploded, { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.35 }, 0.35)
    .to({}, { duration: 0.3 });
}
