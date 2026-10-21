// Tende invernali: interruttore estate / inverno sulla stessa scena.
export default function stagioni(el) {
  const buttons = [...el.querySelectorAll("[data-season-option]")];
  buttons.forEach((b) =>
    b.addEventListener("click", () => {
      el.dataset.mode = b.dataset.seasonOption;
      buttons.forEach((o) => o.setAttribute("aria-checked", String(o === b)));
    }),
  );
}
