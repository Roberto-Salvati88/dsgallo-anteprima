export function initHeader() {
  const header = document.querySelector("[data-header]");
  if (!header) return;

  let lastY = window.scrollY;

  const update = () => {
    const y = window.scrollY;
    header.classList.toggle("is-scrolled", y > 40);
    // si nasconde scendendo, ricompare appena si risale
    const goingDown = y > lastY && y > 400;
    header.classList.toggle("is-hidden", goingDown && !header.classList.contains("is-open"));
    lastY = y;
  };

  update();
  window.addEventListener("scroll", update, { passive: true });
}
