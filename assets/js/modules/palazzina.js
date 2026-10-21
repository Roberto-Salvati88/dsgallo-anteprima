// Sezione servizi della home: punti sulla facciata collegati all'elenco a fianco.
export default function palazzina(root, { gsap, reduce }) {
  const spots = [...root.querySelectorAll("[data-hotspot]")];
  const links = [...root.querySelectorAll("[data-hotspot-link]")];

  const focus = (slug) => {
    root.classList.toggle("is-focus", Boolean(slug));
    spots.forEach((s) => s.classList.toggle("is-active", s.dataset.hotspot === slug));
    links.forEach((l) => l.classList.toggle("is-active", l.dataset.hotspotLink === slug));
  };

  [...spots, ...links].forEach((el) => {
    const slug = el.dataset.hotspot || el.dataset.hotspotLink;
    el.addEventListener("mouseenter", () => focus(slug));
    el.addEventListener("focus", () => focus(slug));
    el.addEventListener("mouseleave", () => focus(null));
    el.addEventListener("blur", () => focus(null));
  });

  if (!reduce && gsap) {
    gsap.from(spots, {
      scale: 0,
      opacity: 0,
      duration: 0.6,
      ease: "back.out(2)",
      stagger: 0.08,
      scrollTrigger: { trigger: root, start: "top 70%", once: true },
    });
  }
}
