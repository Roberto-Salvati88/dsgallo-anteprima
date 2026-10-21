export function initNav() {
  const header = document.querySelector("[data-header]");
  const trigger = document.querySelector("[data-menu-trigger]");
  const menu = document.querySelector("[data-menu]");
  const burger = document.querySelector("[data-burger]");
  const mobile = document.querySelector("[data-mobile-menu]");

  if (trigger && menu) {
    const setMega = (open) => {
      trigger.setAttribute("aria-expanded", String(open));
      menu.classList.toggle("is-open", open);
    };
    trigger.addEventListener("click", () => setMega(trigger.getAttribute("aria-expanded") !== "true"));
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".main-nav__item--has-menu")) setMega(false);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setMega(false);
    });
  }

  if (burger && mobile) {
    const setMobile = (open) => {
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? "Chiudi il menu" : "Apri il menu");
      burger.querySelector("use").setAttribute("href", `/dsgallo-anteprima/assets/icons.svg#i-${open ? "close" : "menu"}`);
      mobile.hidden = !open;
      header.classList.toggle("is-open", open);
      document.body.style.overflow = open ? "hidden" : "";
    };
    burger.addEventListener("click", () => setMobile(mobile.hidden));
    mobile.addEventListener("click", (e) => {
      if (e.target.closest("a")) setMobile(false);
    });
  }
}
