// Interruttore doppio / triplo vetro nella pagina serramenti.
export default function vetro(section) {
  const options = [...section.querySelectorAll("[data-vetro-option]")];
  const infos = [...section.querySelectorAll("[data-vetro-info]")];
  const visual = section.querySelector("[data-vetro-visual]");

  const set = (mode) => {
    options.forEach((o) => o.setAttribute("aria-checked", String(o.dataset.vetroOption === mode)));
    infos.forEach((i) => (i.hidden = i.dataset.vetroInfo !== mode));
    visual.dataset.mode = mode;
  };

  options.forEach((o) => o.addEventListener("click", () => set(o.dataset.vetroOption)));
}
